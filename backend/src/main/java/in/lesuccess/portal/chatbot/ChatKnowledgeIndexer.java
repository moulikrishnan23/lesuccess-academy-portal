package in.lesuccess.portal.chatbot;

import in.lesuccess.portal.course.CourseMode;
import in.lesuccess.portal.course.CourseModuleResponse;
import in.lesuccess.portal.course.CourseResponse;
import in.lesuccess.portal.course.CourseService;
import in.lesuccess.portal.course.CourseSlug;
import in.lesuccess.portal.processstep.ProcessStepResponse;
import in.lesuccess.portal.processstep.ProcessStepService;
import in.lesuccess.portal.serviceoffering.ServiceCategory;
import in.lesuccess.portal.serviceoffering.ServiceOfferingResponse;
import in.lesuccess.portal.serviceoffering.ServiceOfferingService;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Owns the chatbot's in-memory vector index: what goes into it, and when it is
 * rebuilt.
 *
 * <h2>Content: prose only</h2>
 * One Document per entity (never fixed-size character chunks): course overview,
 * course module, published service, process step. Prices, discounts, durations
 * and dates are left out on purpose - those answers come from {@link ChatTools}
 * against the live database, so the index can never serve a stale fee. As a
 * second line of defence, {@link #redactFacts} scrubs money, percentages,
 * durations and dates that an admin typed into free text.
 *
 * <p>There is no FAQ entity in this codebase yet. When one is added, add it to
 * {@link #buildDocuments()} and publish {@link ChatKnowledgeChangedEvent} from its
 * service.</p>
 *
 * <h2>Rebuilds: full, debounced, single-flight, atomically swapped</h2>
 * <ul>
 *   <li>Any change triggers a FULL rebuild. The store is never patched per entity.</li>
 *   <li>{@link #requestRebuild()} debounces: each call cancels the pending rebuild and
 *       schedules a new one {@code debounce} out, so a burst of admin edits causes
 *       one rebuild after the edits stop.</li>
 *   <li>At most one rebuild runs at a time. A request that arrives during a rebuild
 *       is collapsed into exactly one follow-up rebuild after it finishes.</li>
 *   <li>Each rebuild fills a NEW store and swaps it in only on success. Queries keep
 *       reading the old store until then (through {@link DelegatingVectorStore}).
 *       A failed rebuild, or one that yields 0 documents where there were some,
 *       keeps the old store.</li>
 * </ul>
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "chatbot.enabled", havingValue = "true")
public class ChatKnowledgeIndexer {

    public enum Trigger { STARTUP, CHANGE }

    static final Duration DEFAULT_DEBOUNCE = Duration.ofSeconds(5);
    static final Duration DEFAULT_STARTUP_RETRY_DELAY = Duration.ofSeconds(60);

    static final String TYPE_COURSE = "COURSE";
    static final String TYPE_COURSE_MODULE = "COURSE_MODULE";
    static final String TYPE_SERVICE = "SERVICE";
    static final String TYPE_PROCESS_STEP = "PROCESS_STEP";

    static final String META_TYPE = "type";
    static final String META_ENTITY_ID = "entityId";
    static final String META_COURSE_SLUG = "courseSlug";
    static final String META_SOURCE_URL = "sourceUrl";

    /** Frontend routes (frontend/src/App.jsx). Process steps render on the Services page. */
    private static final String COURSE_ROUTE = "/courses/";
    private static final String SERVICES_ROUTE = "/services";

    private static final String REDACTED = "(ask us for current details)";

    /**
     * Whole month names and their standard abbreviations, ending at a word boundary.
     * "May" is left out because "Java 8 may change" would read as a date; it is
     * only matched by the patterns that also require a year.
     */
    private static final String MONTH = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|june?|july?"
            + "|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?(?![a-z])";
    private static final String MONTH_OR_MAY = "(?:" + MONTH + "|may(?![a-z]))";
    private static final String NUMBER = "\\d+(?:[.,]\\d+)*";

    /**
     * Facts that must come from tools, not from text an admin happened to type.
     *
     * <p>Every pattern is anchored on context that only a fact carries: a currency
     * marker, a % sign, a salary or lakh unit, an explicit duration unit, or a
     * date shape. A bare number never matches, so version numbers and product names
     * (Java 17, React 18, Spring Boot 3, HTML5, ES6, AWS EC2, Module 4, Node.js 20)
     * pass through untouched. ChatKnowledgeIndexerTest pins both lists.</p>
     */
    private static final List<Pattern> FACT_PATTERNS = List.of(
            // Money: ₹25,000/-, Rs. 15000, INR 25,000.50, ₹1.5 lakh
            Pattern.compile("(?:₹|\\bRs\\.?|\\bINR)\\s*" + NUMBER + "(?:\\s*/-)?(?:\\s*(?:lakhs?|lacs?|crores?|k)\\b)?",
                    Pattern.CASE_INSENSITIVE),
            // Salary and large-amount units: 10 LPA, 12 lakhs, 2 crore, 6 CTC
            Pattern.compile("\\b" + NUMBER + "\\s*(?:LPA|CTC|lakhs?|lacs?|crores?)\\b", Pattern.CASE_INSENSITIVE),
            // Percentages, with an optional offer word: 30% OFF, 40 % discount, 100%
            Pattern.compile("\\b" + NUMBER + "\\s*%(?:\\s*(?:off|discount))?", Pattern.CASE_INSENSITIVE),
            // Durations with an explicit unit: 3 months, 6-8 weeks, 2 to 3 days, 3-month, 40 hrs
            Pattern.compile("\\b\\d+(?:\\s*(?:-|to)\\s*\\d+)?[\\s-]*(?:years?|months?|weeks?|days?|hours?|hrs?)\\b",
                    Pattern.CASE_INSENSITIVE),
            // ISO dates: 2026-01-15
            Pattern.compile("\\b\\d{4}-\\d{2}-\\d{2}\\b"),
            // Numeric day-first dates: 15/01/2026, 15-01-26. A dotted form needs a
            // four-digit year, so version triplets such as Angular 17.3.10 survive.
            Pattern.compile("\\b\\d{1,2}([/-])\\d{1,2}\\1\\d{2,4}\\b"),
            Pattern.compile("\\b\\d{1,2}\\.\\d{1,2}\\.\\d{4}\\b"),
            // Day-month dates, year optional: 15 January 2026, 5th Aug, 15 May 2026
            Pattern.compile("\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?" + MONTH + "(?:,?\\s+\\d{4})?",
                    Pattern.CASE_INSENSITIVE),
            Pattern.compile("\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?may,?\\s+\\d{4}\\b", Pattern.CASE_INSENSITIVE),
            // Month-day dates, year optional: January 15, 2026, Aug 5th, May 15, 2026
            Pattern.compile("\\b" + MONTH + "\\s+\\d{1,2}(?:st|nd|rd|th)?\\b(?:,?\\s+\\d{4})?", Pattern.CASE_INSENSITIVE),
            Pattern.compile("\\bmay\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}\\b", Pattern.CASE_INSENSITIVE),
            // Month-year: January 2026, Sept 2026, May 2026
            Pattern.compile("\\b" + MONTH_OR_MAY + "\\s+\\d{4}\\b", Pattern.CASE_INSENSITIVE));

    private final CourseService courseService;
    private final ServiceOfferingService serviceOfferingService;
    private final ProcessStepService processStepService;
    private final EmbeddingModel embeddingModel;
    private final Duration debounce;
    private final Duration startupRetryDelay;

    private final AtomicReference<VectorStore> activeStore;
    /** False until any rebuild has swapped a store in, including a legitimately empty one. */
    private final AtomicBoolean everBuilt = new AtomicBoolean();
    private final AtomicInteger activeDocumentCount = new AtomicInteger();

    /** True while a rebuild is running - the single-flight guard. */
    private final AtomicBoolean rebuilding = new AtomicBoolean();
    /** Set by requests that arrive mid-rebuild; collapses any number of them into one follow-up. */
    private final AtomicBoolean followUpRequested = new AtomicBoolean();

    private final ScheduledExecutorService executor;
    private final Object scheduleLock = new Object();
    private ScheduledFuture<?> pendingRebuild; // guarded by scheduleLock

    @Autowired
    public ChatKnowledgeIndexer(CourseService courseService,
                                ServiceOfferingService serviceOfferingService,
                                ProcessStepService processStepService,
                                EmbeddingModel embeddingModel) {
        this(courseService, serviceOfferingService, processStepService, embeddingModel,
                DEFAULT_DEBOUNCE, DEFAULT_STARTUP_RETRY_DELAY);
    }

    /** Tests shorten the debounce window and the startup retry delay through this constructor. */
    ChatKnowledgeIndexer(CourseService courseService,
                         ServiceOfferingService serviceOfferingService,
                         ProcessStepService processStepService,
                         EmbeddingModel embeddingModel,
                         Duration debounce,
                         Duration startupRetryDelay) {
        this.courseService = courseService;
        this.serviceOfferingService = serviceOfferingService;
        this.processStepService = processStepService;
        this.embeddingModel = embeddingModel;
        this.debounce = debounce;
        this.startupRetryDelay = startupRetryDelay;
        // Empty until the startup rebuild lands; a query before then retrieves
        // nothing and is answered from tools alone.
        this.activeStore = new AtomicReference<>(SimpleVectorStore.builder(embeddingModel).build());
        this.executor = Executors.newSingleThreadScheduledExecutor(runnable -> {
            Thread thread = new Thread(runnable, "chat-knowledge-indexer");
            thread.setDaemon(true);
            return thread;
        });
    }

    /** The store queries should read right now. Always the latest successfully built one. */
    public VectorStore currentStore() {
        return activeStore.get();
    }

    /** Documents in {@link #currentStore()}. */
    public int documentCount() {
        return activeDocumentCount.get();
    }

    /**
     * Startup build, off the main thread so it never delays readiness. Runs the
     * same {@link #rebuild} as a content change.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        executor.execute(this::startupBuild);
    }

    /**
     * The first build is the one failure with no older store to fall back on: a
     * Gemini outage or a bad key at boot would otherwise leave the index empty
     * until the next admin edit. The app still starts, with an empty store, and
     * the chat endpoint keeps working through tools alone. One retry follows
     * {@code startupRetryDelay} later on the same executor. If that fails too, the
     * next content change rebuilds as usual.
     */
    void startupBuild() {
        rebuild(Trigger.STARTUP);
        if (!everBuilt.get()) {
            log.error("Chat knowledge startup build failed; serving an empty index (answers come from tools "
                    + "only) and retrying once in {}s", startupRetryDelay.toSeconds());
            executor.schedule(() -> rebuild(Trigger.STARTUP), startupRetryDelay.toMillis(), TimeUnit.MILLISECONDS);
        }
    }

    /**
     * Schedules a full rebuild {@code debounce} from now, replacing any rebuild
     * already pending. Returns immediately - safe to call from a request thread.
     */
    public void requestRebuild() {
        synchronized (scheduleLock) {
            if (pendingRebuild != null) {
                pendingRebuild.cancel(false);
            }
            pendingRebuild = executor.schedule(
                    () -> rebuild(Trigger.CHANGE), debounce.toMillis(), TimeUnit.MILLISECONDS);
        }
    }

    /**
     * Rebuilds the index now, unless one is already running - in which case it
     * books exactly one follow-up rebuild for when that one finishes, and returns.
     */
    void rebuild(Trigger trigger) {
        Trigger next = trigger;
        do {
            if (!rebuilding.compareAndSet(false, true)) {
                followUpRequested.set(true);
                if (rebuilding.get()) {
                    // The running rebuild re-reads followUpRequested after it releases
                    // the guard, so it is guaranteed to see the flag just set.
                    return;
                }
                // It released between our CAS and the flag write: take over below.
                continue;
            }
            try {
                followUpRequested.set(false);
                rebuildOnce(next);
            } finally {
                rebuilding.set(false);
            }
            next = Trigger.CHANGE;
        } while (followUpRequested.get());
    }

    private void rebuildOnce(Trigger trigger) {
        long startedAt = System.nanoTime();
        int previousCount = activeDocumentCount.get();
        try {
            List<Document> documents = buildDocuments();

            if (documents.isEmpty() && previousCount > 0) {
                log.error("Chat knowledge rebuild produced 0 chunks while the active store holds {}; "
                                + "treating it as a failure and keeping the active store: trigger={}, durationMs={}",
                        previousCount, trigger, elapsedMillis(startedAt));
                return;
            }

            SimpleVectorStore fresh = SimpleVectorStore.builder(embeddingModel).build();
            if (!documents.isEmpty()) {
                fresh.add(documents);
            }

            activeStore.set(fresh);
            activeDocumentCount.set(documents.size());
            everBuilt.set(true);
            log.info("Chat knowledge rebuilt: trigger={}, chunks={}, durationMs={}",
                    trigger, documents.size(), elapsedMillis(startedAt));
        } catch (RuntimeException ex) {
            log.error("Chat knowledge rebuild failed; still serving the previous {} chunks: trigger={}, durationMs={}",
                    previousCount, trigger, elapsedMillis(startedAt), ex);
        }
    }

    /** Every Document the index should hold, built from the live database. */
    List<Document> buildDocuments() {
        List<Document> documents = new ArrayList<>();

        // listActive() is the public catalog: active, not soft-deleted.
        for (CourseResponse course : courseService.listActive()) {
            documents.add(courseDocument(course));
            for (CourseModuleResponse module : courseService.listModules(course.getId())) {
                documents.add(moduleDocument(course, module));
            }
        }

        // PUBLISHED only - DRAFT services never reach the index.
        for (ServiceOfferingResponse service : serviceOfferingService.listPublished(null)) {
            documents.add(serviceDocument(service));
        }

        // A fixed, always-live set of four; there is no draft state to filter.
        for (ProcessStepResponse step : processStepService.listAll()) {
            documents.add(processStepDocument(step));
        }

        return documents;
    }

    /**
     * Title, short description, description and mode only. Deliberately absent:
     * duration, badge text (it carries offers such as "30% OFF"), and every date.
     */
    private Document courseDocument(CourseResponse course) {
        String text = joinLines(
                "Course: " + course.getName(),
                "Mode: " + describeMode(course.getMode()),
                clean(course.getShortDescription()),
                clean(course.getDescription()));
        return document("course-" + course.getId(), text, TYPE_COURSE, course.getId(),
                CourseSlug.of(course.getName()), COURSE_ROUTE + CourseSlug.of(course.getName()));
    }

    private Document moduleDocument(CourseResponse course, CourseModuleResponse module) {
        String topics = module.getTopics() == null ? null : String.join("; ", module.getTopics());
        String text = joinLines(
                "Course: " + course.getName(),
                "Module: " + clean(module.getTitle()),
                clean(topics));
        return document("course-module-" + module.getId(), text, TYPE_COURSE_MODULE, module.getId(),
                CourseSlug.of(course.getName()), COURSE_ROUTE + CourseSlug.of(course.getName()));
    }

    private Document serviceDocument(ServiceOfferingResponse service) {
        String text = joinLines(
                "Service (" + describeCategory(service.getCategory()) + "): " + clean(service.getTitle()),
                clean(service.getDescription()));
        return document("service-" + service.getId(), text, TYPE_SERVICE, service.getId(), null, SERVICES_ROUTE);
    }

    private Document processStepDocument(ProcessStepResponse step) {
        String text = joinLines(
                "How LeSuccess works, step " + step.getStepNumber() + ": " + clean(step.getTitle()),
                clean(step.getDescription()));
        return document("process-step-" + step.getId(), text, TYPE_PROCESS_STEP, step.getId(), null, SERVICES_ROUTE);
    }

    private static Document document(String id, String text, String type, Long entityId,
                                     String courseSlug, String sourceUrl) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put(META_TYPE, type);
        metadata.put(META_ENTITY_ID, entityId);
        metadata.put(META_SOURCE_URL, sourceUrl);
        if (courseSlug != null) {
            metadata.put(META_COURSE_SLUG, courseSlug);
        }
        return Document.builder().id(id).text(text).metadata(metadata).build();
    }

    /** HTML stripped, facts redacted, whitespace collapsed. Null for nothing left. */
    private static String clean(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String text = redactFacts(Jsoup.parse(raw).text()).replaceAll("\\s+", " ").trim();
        return text.isEmpty() ? null : text;
    }

    static String redactFacts(String text) {
        String result = text;
        for (Pattern pattern : FACT_PATTERNS) {
            result = pattern.matcher(result).replaceAll(REDACTED);
        }
        return result;
    }

    private static String joinLines(String... lines) {
        return java.util.Arrays.stream(lines)
                .filter(line -> line != null && !line.isBlank())
                .collect(Collectors.joining("\n"));
    }

    private static String describeMode(CourseMode mode) {
        if (mode == null) {
            return "Online and classroom";
        }
        return switch (mode) {
            case ONLINE -> "Online";
            case OFFLINE -> "Classroom (offline) in Coimbatore";
            case BOTH -> "Online and classroom";
        };
    }

    private static String describeCategory(ServiceCategory category) {
        if (category == null) {
            return "Service";
        }
        return switch (category) {
            case INSTITUTION -> "For Institutions";
            case CORPORATE -> "Corporate Training";
        };
    }

    private static long elapsedMillis(long startedAtNanos) {
        return TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAtNanos);
    }

    @PreDestroy
    void shutdown() {
        executor.shutdownNow();
    }
}
