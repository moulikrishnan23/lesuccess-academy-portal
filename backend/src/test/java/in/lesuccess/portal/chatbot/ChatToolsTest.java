package in.lesuccess.portal.chatbot;

import in.lesuccess.portal.chatbot.ChatToolResults.ContactInfo;
import in.lesuccess.portal.chatbot.ChatToolResults.CourseDetailsResult;
import in.lesuccess.portal.chatbot.ChatToolResults.CourseSummary;
import in.lesuccess.portal.chatbot.ChatToolResults.Webinar;
import in.lesuccess.portal.course.Course;
import in.lesuccess.portal.course.CourseMode;
import in.lesuccess.portal.course.CourseModule;
import in.lesuccess.portal.course.CourseModuleRepository;
import in.lesuccess.portal.course.CourseRepository;
import in.lesuccess.portal.course.CourseService;
import in.lesuccess.portal.course.CourseTool;
import in.lesuccess.portal.course.CourseToolRepository;
import in.lesuccess.portal.course.TestimonialRepository;
import in.lesuccess.portal.sitesetting.SiteSettingService;
import in.lesuccess.portal.upcomingprogram.UpcomingProgramResponse;
import in.lesuccess.portal.upcomingprogram.UpcomingProgramService;
import in.lesuccess.portal.upcomingprogram.UpcomingProgramType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * ChatTools over a REAL CourseService backed by mocked repositories. That matters
 * for the visibility tests: CourseService.findByIdOrSlug would happily return an
 * inactive course, so these tests prove the tools never reach one.
 */
class ChatToolsTest {

    private CourseRepository courseRepository;
    private CourseModuleRepository moduleRepository;
    private CourseToolRepository toolRepository;
    private UpcomingProgramService upcomingProgramService;
    private SiteSettingService siteSettingService;
    private ChatTools tools;

    private Course python;
    private Course draftJava;

    @BeforeEach
    void setUp() {
        courseRepository = mock(CourseRepository.class);
        moduleRepository = mock(CourseModuleRepository.class);
        toolRepository = mock(CourseToolRepository.class);
        CourseService courseService = new CourseService(courseRepository, moduleRepository, toolRepository,
                mock(TestimonialRepository.class), mock(ApplicationEventPublisher.class));
        upcomingProgramService = mock(UpcomingProgramService.class);
        siteSettingService = mock(SiteSettingService.class);
        tools = new ChatTools(courseService, upcomingProgramService, siteSettingService);

        python = course(1L, "Python Full Stack Development", "Development", true, "30% OFF");
        Course dataAnalytics = course(2L, "Data Analytics", "Data", true, null);
        draftJava = course(3L, "Java Full Stack Development", "Development", false, null);

        // The catalog query: active only. findAll (behind findByIdOrSlug) also sees the inactive one.
        when(courseRepository.findByIsActiveTrueOrderByDisplayOrderAsc()).thenReturn(List.of(python, dataAnalytics));
        when(courseRepository.findAll()).thenReturn(List.of(python, dataAnalytics, draftJava));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(python));
        when(courseRepository.findById(3L)).thenReturn(Optional.of(draftJava));
        when(toolRepository.findByCourseIdInOrderByCourseIdAscDisplayOrderAsc(anyCollection())).thenReturn(List.of());
    }

    @Test
    @DisplayName("searchCourses returns only published (active) courses: an inactive match is excluded")
    void searchCourses_excludesInactive() {
        List<CourseSummary> results = tools.searchCourses("full stack");

        assertThat(results).extracting(CourseSummary::title).containsExactly("Python Full Stack Development");
        assertThat(results.getFirst().slug()).isEqualTo("python-full-stack-development");
        assertThat(results.getFirst().durationValue()).isEqualTo(6);
        assertThat(results.getFirst().durationUnit()).isEqualTo("months");
        assertThat(results.getFirst().badge()).isEqualTo("30% OFF");
    }

    @Test
    @DisplayName("searchCourses with no query lists the whole published catalog, inactive excluded")
    void searchCourses_blankQuery_listsCatalog() {
        assertThat(tools.searchCourses("  ")).extracting(CourseSummary::title)
                .containsExactly("Python Full Stack Development", "Data Analytics");
    }

    @Test
    @DisplayName("searchCourses matches category and falls back to single words")
    void searchCourses_matchesCategoryAndWords() {
        assertThat(tools.searchCourses("data")).extracting(CourseSummary::title).containsExactly("Data Analytics");
        assertThat(tools.searchCourses("python course for beginners")).extracting(CourseSummary::title)
                .containsExactly("Python Full Stack Development");
    }

    @Test
    @DisplayName("getCourseDetails returns modules, tech stack, duration and badge for a published course")
    void getCourseDetails_found() {
        when(moduleRepository.findByCourseIdOrderByDisplayOrderAsc(1L)).thenReturn(List.of(
                CourseModule.builder().id(11L).course(python).title("Core Python").content("Basics").build(),
                CourseModule.builder().id(12L).course(python).title("Django").content("Web").build()));
        when(toolRepository.findByCourseIdOrderByDisplayOrderAsc(1L)).thenReturn(List.of(
                CourseTool.builder().id(21L).course(python).toolName("Python").build(),
                CourseTool.builder().id(22L).course(python).toolName("PostgreSQL").build()));

        CourseDetailsResult result = tools.getCourseDetails("python-full-stack-development");

        assertThat(result.found()).isTrue();
        assertThat(result.course().moduleTitles()).containsExactly("Core Python", "Django");
        assertThat(result.course().techStack()).containsExactly("Python", "PostgreSQL");
        assertThat(result.course().durationValue()).isEqualTo(6);
        assertThat(result.course().pageUrl()).isEqualTo("/courses/python-full-stack-development");
    }

    @Test
    @DisplayName("getCourseDetails with an unknown slug returns not-found, not an exception")
    void getCourseDetails_unknownSlug_notFound() {
        CourseDetailsResult result = tools.getCourseDetails("quantum-basket-weaving");

        assertThat(result.found()).isFalse();
        assertThat(result.course()).isNull();
        assertThat(result.message()).contains("quantum-basket-weaving").contains("searchCourses");
    }

    @Test
    @DisplayName("getCourseDetails never reveals an inactive course, though CourseService could find it")
    void getCourseDetails_inactiveCourse_notFound() {
        assertThat(tools.getCourseDetails("java-full-stack-development").found()).isFalse();
        assertThat(tools.getCourseDetails("3").found()).as("numeric id must not bypass the catalog").isFalse();
    }

    @Test
    @DisplayName("getUpcomingWebinars excludes completed (past) and cancelled (inactive) webinars")
    void getUpcomingWebinars_excludesCompletedAndCancelled() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        when(upcomingProgramService.listUpcoming(UpcomingProgramType.WEBINAR)).thenReturn(List.of(
                webinar("Intro to AI", today.plusDays(3), true),
                webinar("Completed: Cloud 101", today.minusDays(1), true),
                webinar("Cancelled: DevOps Live", today.plusDays(5), false),
                webinar("Today: Resume Clinic", today, true)));

        List<Webinar> webinars = tools.getUpcomingWebinars();

        verify(upcomingProgramService).listUpcoming(UpcomingProgramType.WEBINAR);
        assertThat(webinars).extracting(Webinar::title).containsExactly("Intro to AI", "Today: Resume Clinic");
        assertThat(webinars.getFirst().startTime()).isEqualTo(LocalTime.of(18, 0));
        assertThat(webinars.getFirst().hasCertificate()).isTrue();
    }

    @Test
    @DisplayName("getContactInfo maps settings and returns blank values as null")
    void getContactInfo_blankAsNull() {
        Map<String, String> settings = new LinkedHashMap<>();
        settings.put("phone_primary", "+91 98765 43210");
        settings.put("phone_secondary", "");
        settings.put("email_primary", "hello@lesuccess.in");
        settings.put("address", "  ");
        when(siteSettingService.getAll()).thenReturn(settings);

        ContactInfo contact = tools.getContactInfo();

        assertThat(contact.primaryPhone()).isEqualTo("+91 98765 43210");
        assertThat(contact.secondaryPhone()).isNull();
        assertThat(contact.email()).isEqualTo("hello@lesuccess.in");
        assertThat(contact.address()).isNull();
        assertThat(contact.contactPageUrl()).isEqualTo("/contact");
    }

    private static Course course(Long id, String name, String category, boolean active, String badgeText) {
        return Course.builder()
                .id(id).name(name).category(category).mode(CourseMode.BOTH)
                .durationMonths(6).badgeText(badgeText).isActive(active)
                .shortDescription(name + " in brief")
                .build();
    }

    private static UpcomingProgramResponse webinar(String title, LocalDate date, boolean active) {
        return UpcomingProgramResponse.builder()
                .type(UpcomingProgramType.WEBINAR).title(title).topic(title + " topic")
                .eventDate(date).startTime(LocalTime.of(18, 0)).endTime(LocalTime.of(19, 0))
                .platform("Google Meet").certificateIncluded(true).isActive(active)
                .build();
    }
}
