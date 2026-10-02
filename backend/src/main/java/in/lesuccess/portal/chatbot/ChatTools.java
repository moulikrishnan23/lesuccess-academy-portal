package in.lesuccess.portal.chatbot;

import in.lesuccess.portal.chatbot.ChatToolResults.ContactInfo;
import in.lesuccess.portal.chatbot.ChatToolResults.CourseDetails;
import in.lesuccess.portal.chatbot.ChatToolResults.CourseDetailsResult;
import in.lesuccess.portal.chatbot.ChatToolResults.CourseSummary;
import in.lesuccess.portal.chatbot.ChatToolResults.Webinar;
import in.lesuccess.portal.course.CourseModuleResponse;
import in.lesuccess.portal.course.CourseResponse;
import in.lesuccess.portal.course.CourseService;
import in.lesuccess.portal.course.CourseSlug;
import in.lesuccess.portal.course.CourseToolResponse;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
import in.lesuccess.portal.sitesetting.SiteSettingService;
import in.lesuccess.portal.upcomingprogram.UpcomingProgramResponse;
import in.lesuccess.portal.upcomingprogram.UpcomingProgramService;
import in.lesuccess.portal.upcomingprogram.UpcomingProgramType;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * The chatbot's live-database tools: the ONLY source the model may quote fees,
 * durations, dates or contact details from (see ChatbotPromptConfig).
 *
 * <p>Read-only, and built on the same service methods the public site uses, so a
 * tool can never see a course, webinar or setting that the website hides.
 * "Published" here means exactly what the public catalog means: an active course
 * that is not soft-deleted, or an active webinar dated today or later.</p>
 *
 * <p>Every method returns a result instead of throwing. A failed lookup is
 * something the model should hear about and work around ("not found, try
 * searchCourses"), not an error that kills the whole reply.</p>
 */
@Component
@ConditionalOnProperty(name = "chatbot.enabled", havingValue = "true")
@RequiredArgsConstructor
public class ChatTools {

    private static final String COURSE_ROUTE = "/courses/";
    private static final String CONTACT_ROUTE = "/contact";
    /** Same zone UpcomingProgramService uses for "today". */
    private static final ZoneId ZONE_IST = ZoneId.of("Asia/Kolkata");

    private final CourseService courseService;
    private final UpcomingProgramService upcomingProgramService;
    private final SiteSettingService siteSettingService;

    @Tool(description = "Search LeSuccess Academy's published courses by title or category, e.g. 'python', "
            + "'data analytics', 'testing'. Returns each match's title, slug, duration, mode (ONLINE, OFFLINE "
            + "or BOTH) and badge (a marketing/offer label such as '30% OFF', if any). Pass an empty query to "
            + "list every course. Call this before stating any course duration or offer, and to find the slug "
            + "for getCourseDetails.")
    public List<CourseSummary> searchCourses(
            @ToolParam(description = "Words from the course title or category; empty for all courses",
                    required = false) String query) {

        List<CourseResponse> published = publishedCourses();
        List<String> terms = searchTerms(query);
        if (terms.isEmpty()) {
            return published.stream().map(ChatTools::toSummary).toList();
        }

        // Prefer courses matching the whole phrase. Fall back to any single word,
        // so "java full stack course" still finds "Java Full Stack Development".
        String phrase = String.join(" ", terms);
        List<CourseResponse> phraseMatches = published.stream()
                .filter(course -> matches(course, phrase))
                .toList();
        List<CourseResponse> matches = !phraseMatches.isEmpty()
                ? phraseMatches
                : published.stream().filter(course -> terms.stream().anyMatch(term -> matches(course, term))).toList();

        return matches.stream().map(ChatTools::toSummary).toList();
    }

    @Tool(description = "Get full details of ONE published LeSuccess course by its slug (from searchCourses), "
            + "e.g. 'python-full-stack-development': duration, mode, badge/offer label, whether placement "
            + "assistance is included, module titles, tech stack and the course page link. Returns found=false "
            + "with a message when no published course has that slug.")
    public CourseDetailsResult getCourseDetails(
            @ToolParam(description = "The course slug from searchCourses") String slug) {

        if (slug == null || slug.isBlank()) {
            return CourseDetailsResult.notFound(String.valueOf(slug));
        }
        String wanted = slug.trim();

        // Resolve against the public catalog, never by raw id or slug lookup.
        // CourseService.findByIdOrSlug also finds inactive courses, which must
        // stay invisible here.
        Optional<CourseResponse> published = publishedCourses().stream()
                .filter(course -> CourseSlug.matches(course.getName(), wanted)
                        || wanted.equalsIgnoreCase(course.getName()))
                .findFirst();
        if (published.isEmpty()) {
            return CourseDetailsResult.notFound(wanted);
        }

        try {
            CourseResponse course = courseService.getById(published.get().getId());
            return CourseDetailsResult.found(toDetails(course));
        } catch (ResourceNotFoundException deletedMeanwhile) {
            return CourseDetailsResult.notFound(wanted);
        }
    }

    @Tool(description = "List LeSuccess Academy's upcoming webinars (today or later, soonest first): title, "
            + "topic, date, start and end time, platform, and whether a certificate is included. Call this "
            + "before stating any webinar date or time. Returns an empty list when none are scheduled.")
    public List<Webinar> getUpcomingWebinars() {
        // listUpcoming already restricts to active programmes dated today or later
        // (IST). Re-checked here so a past (completed) or deactivated (cancelled)
        // webinar can never be offered, whatever that query becomes.
        LocalDate today = LocalDate.now(ZONE_IST);
        return upcomingProgramService.listUpcoming(UpcomingProgramType.WEBINAR).stream()
                .filter(UpcomingProgramResponse::getActive)
                .filter(program -> program.getEventDate() != null && !program.getEventDate().isBefore(today))
                .map(program -> new Webinar(
                        program.getTitle(),
                        program.getTopic(),
                        program.getEventDate(),
                        program.getStartTime(),
                        program.getEndTime(),
                        program.getPlatform(),
                        program.isCertificateIncluded()))
                .toList();
    }

    @Tool(description = "Get LeSuccess Academy's contact details: phone numbers, email, address and the "
            + "contact page link. Use this whenever a visitor wants to call, visit, enrol, ask about fees or "
            + "admissions, or when you cannot answer something yourself. A null field means that detail is "
            + "not published; do not make one up.")
    public ContactInfo getContactInfo() {
        Map<String, String> settings = siteSettingService.getAll();
        return new ContactInfo(
                blankToNull(settings.get("phone_primary")),
                blankToNull(settings.get("phone_secondary")),
                blankToNull(settings.get("email_primary")),
                blankToNull(settings.get("address")),
                CONTACT_ROUTE);
    }

    /** The public catalog, re-filtered on isActive for the same reason as the webinars. */
    private List<CourseResponse> publishedCourses() {
        return courseService.listActive().stream().filter(CourseResponse::isActive).toList();
    }

    // ── mapping ──────────────────────────────────────────────────────────────

    private static CourseSummary toSummary(CourseResponse course) {
        return new CourseSummary(
                course.getName(),
                CourseSlug.of(course.getName()),
                course.getCategory(),
                course.getDurationValue(),
                course.getDurationUnit(),
                course.getMode() != null ? course.getMode().name() : null,
                blankToNull(course.getBadgeText()));
    }

    private static CourseDetails toDetails(CourseResponse course) {
        List<String> moduleTitles = course.getModules() == null ? List.of()
                : course.getModules().stream().map(CourseModuleResponse::getTitle).toList();
        List<String> techStack = course.getTools() == null ? List.of()
                : course.getTools().stream().map(CourseToolResponse::getToolName).toList();

        return new CourseDetails(
                course.getName(),
                CourseSlug.of(course.getName()),
                course.getCategory(),
                course.getShortDescription(),
                course.getDurationValue(),
                course.getDurationUnit(),
                course.getMode() != null ? course.getMode().name() : null,
                blankToNull(course.getBadgeText()),
                course.isPlacementAssistance(),
                COURSE_ROUTE + CourseSlug.of(course.getName()),
                moduleTitles,
                techStack);
    }

    private static List<String> searchTerms(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        return Arrays.stream(query.toLowerCase(Locale.ROOT).split("[^a-z0-9+#.]+"))
                .filter(term -> term.length() >= 2)
                .filter(term -> !List.of("course", "courses", "the", "and", "for", "in").contains(term))
                .toList();
    }

    private static boolean matches(CourseResponse course, String term) {
        return contains(course.getName(), term) || contains(course.getCategory(), term);
    }

    private static boolean contains(String haystack, String term) {
        return haystack != null && haystack.toLowerCase(Locale.ROOT).contains(term);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
