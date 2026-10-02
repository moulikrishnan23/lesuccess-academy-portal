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
import in.lesuccess.portal.serviceoffering.ServiceStatus;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * ChatKnowledgeIndexer with every collaborator mocked: no database, and a fake
 * EmbeddingModel in place of Gemini's, so no network call is ever made.
 */
class ChatKnowledgeIndexerTest {

    /** Every text embeds to the same unit vector, so similarity is always 1.0 and search returns everything. */
    private static final float[] VECTOR = {1f, 0f, 0f};

    private CourseService courseService;
    private ServiceOfferingService serviceOfferingService;
    private ProcessStepService processStepService;
    private EmbeddingModel embeddingModel;
    private ChatKnowledgeIndexer indexer;

    @BeforeEach
    void setUp() {
        courseService = mock(CourseService.class);
        serviceOfferingService = mock(ServiceOfferingService.class);
        processStepService = mock(ProcessStepService.class);
        embeddingModel = mock(EmbeddingModel.class);
        when(embeddingModel.embed(any(Document.class))).thenReturn(VECTOR);
        when(embeddingModel.embed(anyString())).thenReturn(VECTOR);

        when(serviceOfferingService.listPublished(null)).thenReturn(List.of());
        when(processStepService.listAll()).thenReturn(List.of());

        indexer = new ChatKnowledgeIndexer(courseService, serviceOfferingService, processStepService,
                embeddingModel, Duration.ofMillis(300), Duration.ofMillis(300));
    }

    @AfterEach
    void tearDown() {
        indexer.shutdown();
    }

    // ── Document content ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("Documents")
    class DocumentContent {

        @Test
        @DisplayName("No price, discount label, duration or date reaches any Document text")
        void structuredFacts_neverEmbedded() {
            CourseResponse course = course(1L, "Data Analytics", 17, "30% OFF",
                    "<p>Master <b>Excel</b> and <i>Power BI</i>. Fee Rs. 25,000/- (INR 25000, ₹25,000), "
                            + "a 6 month programme with 40% discount, starting 12 August 2026 or 01/09/2026. "
                            + "Average package 6 LPA.</p>");
            when(courseService.listActive()).thenReturn(List.of(course));
            when(courseService.listModules(1L)).thenReturn(List.of(
                    module(11L, "Excel in 3 weeks", "[\"Pivot tables\", \"VLOOKUP - 2 days\"]")));

            List<Document> documents = indexer.buildDocuments();

            assertThat(documents).isNotEmpty();
            for (Document document : documents) {
                assertThat(document.getText())
                        .as("document %s", document.getId())
                        // durationValue / durationUnit fields
                        .doesNotContain("17")
                        // badge text, the discountLabel equivalent
                        .doesNotContain("30%").doesNotContain("OFF")
                        // prices and discounts typed into prose
                        .doesNotContain("25,000").doesNotContain("25000").doesNotContain("Rs.")
                        .doesNotContain("₹").doesNotContain("INR").doesNotContain("40%")
                        // durations, dates and salary figures typed into prose
                        .doesNotContain("6 month").doesNotContain("3 weeks").doesNotContain("2 days")
                        .doesNotContain("August").doesNotContain("2026").doesNotContain("6 LPA");
            }
        }

        @Test
        @DisplayName("HTML is stripped and the prose survives")
        void html_stripped() {
            when(courseService.listActive()).thenReturn(List.of(
                    course(1L, "Python", 4, null, "<p>Learn <b>Django</b> &amp; REST APIs</p>")));
            when(courseService.listModules(1L)).thenReturn(List.of());

            Document courseDoc = indexer.buildDocuments().getFirst();

            assertThat(courseDoc.getText())
                    .contains("Course: Python", "Learn Django & REST APIs", "Mode: Online")
                    .doesNotContain("<p>", "<b>", "&amp;");
        }

        @Test
        @DisplayName("One Document per module, carrying course title, module title and topics")
        void oneDocumentPerModule() {
            when(courseService.listActive()).thenReturn(List.of(course(1L, "Java Full Stack", 6, null, "Java")));
            when(courseService.listModules(1L)).thenReturn(List.of(
                    module(11L, "Core Java", "OOP, collections"),
                    module(12L, "Spring Boot", "REST, JPA"),
                    module(13L, "React", "Hooks, routing")));

            List<Document> modules = indexer.buildDocuments().stream()
                    .filter(d -> ChatKnowledgeIndexer.TYPE_COURSE_MODULE.equals(d.getMetadata().get("type")))
                    .toList();

            assertThat(modules).hasSize(3);
            assertThat(modules).extracting(d -> d.getMetadata().get("entityId")).containsExactly(11L, 12L, 13L);
            assertThat(modules.get(1).getText()).contains("Course: Java Full Stack", "Module: Spring Boot", "REST");
        }

        @Test
        @DisplayName("Only the published-only reads are used, so DRAFT, ARCHIVED and inactive rows never reach the index")
        void onlyPublishedSourcesAreRead() {
            when(courseService.listActive()).thenReturn(List.of(course(1L, "Python", 4, null, "Python")));
            when(courseService.listModules(1L)).thenReturn(List.of());
            when(serviceOfferingService.listPublished(null)).thenReturn(List.of(
                    service(21L, ServiceCategory.CORPORATE, "Corporate Upskilling")));

            List<Document> documents = indexer.buildDocuments();

            // The catalog read (active and not soft-deleted) and the PUBLISHED-only service read.
            verify(courseService).listActive();
            verify(serviceOfferingService).listPublished(null);
            // The admin reads, which include inactive and DRAFT rows, are never touched.
            verify(courseService, never()).listAllForAdmin(any());
            verify(serviceOfferingService, never()).getById(anyLong());
            assertThat(documents).extracting(Document::getId)
                    .containsExactlyInAnyOrder("course-1", "service-21");
        }

        @Test
        @DisplayName("Every Document carries type, entityId and sourceUrl; course content also carries courseSlug")
        void requiredMetadata() {
            when(courseService.listActive()).thenReturn(List.of(course(1L, "Python Full Stack", 4, null, "Py")));
            when(courseService.listModules(1L)).thenReturn(List.of(module(11L, "Django", "Views")));
            when(serviceOfferingService.listPublished(null)).thenReturn(List.of(
                    service(21L, ServiceCategory.INSTITUTION, "Campus Training")));
            when(processStepService.listAll()).thenReturn(List.of(step(31L, 1, "Evaluate")));

            List<Document> documents = indexer.buildDocuments();

            assertThat(documents).hasSize(4);
            for (Document document : documents) {
                assertThat(document.getMetadata()).containsKeys("type", "entityId", "sourceUrl");
            }
            assertThat(byId(documents, "course-1").getMetadata())
                    .containsEntry("type", "COURSE")
                    .containsEntry("courseSlug", "python-full-stack")
                    .containsEntry("sourceUrl", "/courses/python-full-stack");
            assertThat(byId(documents, "course-module-11").getMetadata())
                    .containsEntry("courseSlug", "python-full-stack")
                    .containsEntry("sourceUrl", "/courses/python-full-stack");
            assertThat(byId(documents, "service-21").getMetadata())
                    .containsEntry("type", "SERVICE").containsEntry("sourceUrl", "/services");
            assertThat(byId(documents, "process-step-31").getMetadata())
                    .containsEntry("type", "PROCESS_STEP").containsEntry("sourceUrl", "/services");
        }
    }

    // ── Fact masking ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Fact masking")
    class FactMasking {

        @ParameterizedTest(name = "survives: {0}")
        @ValueSource(strings = {
                "Java 17", "Java 21", "React 18", "Python 3", "Spring Boot 3", "HTML5", "CSS3", "ES6",
                "Module 4", "Tableau", "Power BI", "AWS EC2", "S3", "Node.js 20", "MySQL 8",
                // Real course prose the earlier rules damaged: "dec"/"Mar"/"Jun" read as months.
                "Python 3 decorators", "Digital Marketing 2", "JUnit 5", "Angular 17.3.10",
                "Java 8 may surprise you", "Learn Java 17, React 18 and Spring Boot 3 in Module 4"})
        void techNamesSurviveUnchanged(String text) {
            assertThat(ChatKnowledgeIndexer.redactFacts(text)).isEqualTo(text);
        }

        @ParameterizedTest(name = "masked: {0}")
        @ValueSource(strings = {
                "₹25,000", "Rs. 15000", "30% OFF", "3 months", "within 6 weeks", "10 LPA", "12 lakhs",
                "15 January 2026", "2026-01-15"})
        void factsAreMasked(String fact) {
            String masked = ChatKnowledgeIndexer.redactFacts("Details: " + fact + ".");

            assertThat(masked).contains("(ask us for current details)");
            assertThat(masked.replace("(ask us for current details)", ""))
                    .as("no digit of the fact may survive")
                    .doesNotContainPattern("\\d");
        }

        @Test
        @DisplayName("Facts are masked inside a sentence while the tech names around them survive")
        void mixedSentence() {
            String masked = ChatKnowledgeIndexer.redactFacts(
                    "Master Java 21 and React 18 in 3 months for ₹25,000 - 30% OFF until 15 January 2026.");

            assertThat(masked).contains("Java 21", "React 18")
                    .doesNotContain("3 months", "25,000", "30%", "January", "2026");
        }
    }

    // ── Rebuild behaviour ────────────────────────────────────────────────────

    @Nested
    @DisplayName("Rebuilds")
    class Rebuilds {

        @BeforeEach
        void oneCourse() {
            when(courseService.listActive()).thenReturn(List.of(course(1L, "Python", 4, null, "Python")));
            when(courseService.listModules(1L)).thenReturn(List.of(module(11L, "Django", "Views")));
        }

        @Test
        @DisplayName("First build fails at startup → empty store, app keeps running, one retry later succeeds")
        void failedStartupBuild_keepsEmptyStoreAndRetriesOnce() {
            when(courseService.listActive())
                    .thenThrow(new IllegalStateException("Gemini embeddings unavailable"))
                    .thenReturn(List.of(course(1L, "Python", 4, null, "Python")));

            indexer.startupBuild(); // must not throw

            assertThat(indexer.documentCount()).isZero();
            assertThat(search()).isEmpty();

            // The retry is 300 ms out in this test (60 s in production).
            await().atMost(5, TimeUnit.SECONDS).until(() -> indexer.documentCount() == 2);
            verify(courseService, times(2)).listActive();
        }

        @Test
        @DisplayName("A successful startup build schedules no retry")
        void successfulStartupBuild_noRetry() throws Exception {
            indexer.startupBuild();
            Thread.sleep(600); // twice the test retry delay

            verify(courseService, times(1)).listActive();
        }

        @Test
        @DisplayName("10 requestRebuild() calls within 1 second → exactly 1 rebuild")
        void burstOfRequests_debouncedIntoOneRebuild() throws Exception {
            for (int i = 0; i < 10; i++) {
                indexer.requestRebuild();
                Thread.sleep(50); // 10 calls over ~0.5 s, each inside the 300 ms window of the last
            }

            await().atMost(5, TimeUnit.SECONDS).until(() -> indexer.documentCount() == 2);
            Thread.sleep(600); // longer than the debounce: a stray second rebuild would have run by now

            verify(courseService, times(1)).listActive();
        }

        @Test
        @DisplayName("A rebuild that throws → the old store is still served, document count unchanged")
        void failedRebuild_keepsOldStore() {
            indexer.rebuild(ChatKnowledgeIndexer.Trigger.STARTUP);
            VectorStore before = indexer.currentStore();
            assertThat(indexer.documentCount()).isEqualTo(2);

            when(courseService.listActive()).thenThrow(new IllegalStateException("database is down"));
            indexer.rebuild(ChatKnowledgeIndexer.Trigger.CHANGE);

            assertThat(indexer.currentStore()).isSameAs(before);
            assertThat(indexer.documentCount()).isEqualTo(2);
            assertThat(search()).extracting(Document::getId)
                    .containsExactlyInAnyOrder("course-1", "course-module-11");
        }

        @Test
        @DisplayName("A rebuild producing 0 documents while the old store has some → no swap")
        void emptyRebuild_doesNotReplaceNonEmptyStore() {
            indexer.rebuild(ChatKnowledgeIndexer.Trigger.STARTUP);
            VectorStore before = indexer.currentStore();

            when(courseService.listActive()).thenReturn(List.of());
            indexer.rebuild(ChatKnowledgeIndexer.Trigger.CHANGE);

            assertThat(indexer.currentStore()).isSameAs(before);
            assertThat(indexer.documentCount()).isEqualTo(2);
        }

        @Test
        @DisplayName("During a slow rebuild, similaritySearch returns the old store's results, never empty")
        void slowRebuild_servesOldStoreUntilSwap() throws Exception {
            indexer.rebuild(ChatKnowledgeIndexer.Trigger.STARTUP);

            CountDownLatch rebuildStarted = new CountDownLatch(1);
            CountDownLatch releaseRebuild = new CountDownLatch(1);
            when(courseService.listActive()).thenAnswer(invocation -> {
                rebuildStarted.countDown();
                releaseRebuild.await(5, TimeUnit.SECONDS);
                return List.of(course(2L, "Golang", 3, null, "Go"));
            });
            when(courseService.listModules(2L)).thenReturn(List.of());

            Thread slowRebuild = new Thread(() -> indexer.rebuild(ChatKnowledgeIndexer.Trigger.CHANGE));
            slowRebuild.start();
            assertThat(rebuildStarted.await(5, TimeUnit.SECONDS)).isTrue();

            // Mid-rebuild: queries go through the same indirection QuestionAnswerAdvisor uses.
            for (int i = 0; i < 5; i++) {
                assertThat(search()).extracting(Document::getId)
                        .containsExactlyInAnyOrder("course-1", "course-module-11");
            }

            releaseRebuild.countDown();
            slowRebuild.join(5_000);

            assertThat(search()).extracting(Document::getId).containsExactly("course-2");
            assertThat(indexer.documentCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("Requests during a running rebuild collapse into exactly one follow-up rebuild")
        void requestsDuringRebuild_runExactlyOneMore() throws Exception {
            CountDownLatch rebuildStarted = new CountDownLatch(1);
            CountDownLatch releaseRebuild = new CountDownLatch(1);
            when(courseService.listActive())
                    .thenAnswer(invocation -> {
                        rebuildStarted.countDown();
                        releaseRebuild.await(5, TimeUnit.SECONDS);
                        return List.of(course(1L, "Python", 4, null, "Python"));
                    })
                    .thenReturn(List.of(course(1L, "Python", 4, null, "Python")));

            Thread running = new Thread(() -> indexer.rebuild(ChatKnowledgeIndexer.Trigger.STARTUP));
            running.start();
            assertThat(rebuildStarted.await(5, TimeUnit.SECONDS)).isTrue();

            // Three overlapping requests: each must return at once, not block or run concurrently.
            for (int i = 0; i < 3; i++) {
                indexer.rebuild(ChatKnowledgeIndexer.Trigger.CHANGE);
            }
            verify(courseService, times(1)).listActive();

            releaseRebuild.countDown();
            running.join(5_000);

            verify(courseService, times(2)).listActive(); // the original plus exactly one follow-up
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private List<Document> search() {
        return new DelegatingVectorStore(indexer::currentStore)
                .similaritySearch(SearchRequest.builder().query("python").topK(10).similarityThreshold(0.5).build());
    }

    private static Document byId(List<Document> documents, String id) {
        return documents.stream().filter(d -> d.getId().equals(id)).findFirst().orElseThrow();
    }

    private static CourseResponse course(Long id, String name, int months, String badgeText, String description) {
        return CourseResponse.builder()
                .id(id)
                .name(name)
                .title(name)
                .slug(CourseSlug.of(name))
                .shortDescription("Short intro to " + name)
                .description(description)
                .durationMonths(months)
                .durationValue(months)
                .durationUnit("months")
                .mode(CourseMode.ONLINE)
                .badgeText(badgeText)
                .isActive(true)
                .build();
    }

    private static CourseModuleResponse module(Long id, String title, String content) {
        return CourseModuleResponse.builder()
                .id(id)
                .title(title)
                .content(content)
                .description(content)
                .topics(CourseModuleResponse.parseTopics(content))
                .build();
    }

    private static ServiceOfferingResponse service(Long id, ServiceCategory category, String title) {
        return ServiceOfferingResponse.builder()
                .id(id).category(category).title(title)
                .description(title + " for teams").status(ServiceStatus.PUBLISHED)
                .build();
    }

    private static ProcessStepResponse step(Long id, int number, String title) {
        return ProcessStepResponse.builder()
                .id(id).stepNumber(number).title(title).description(title + " your goals")
                .build();
    }
}
