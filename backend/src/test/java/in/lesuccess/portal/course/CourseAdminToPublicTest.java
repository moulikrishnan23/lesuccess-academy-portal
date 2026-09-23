package in.lesuccess.portal.course;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A course created through the admin panel must reach the public pages with its
 * own content — from the database, through the backend, and nothing supplied by
 * the frontend on its behalf.
 *
 * <p>The course below is deliberately named so that it matches none of the
 * keyword ladders the frontend used to run ("java", "python", "aws", "data
 * analytics", "cyber", "mern"…). Those ladders were written around the seeded
 * catalog, so a course added afterwards fell off the end of every one of them
 * and inherited another course's syllabus PDF, logo, badge and tech stack. A
 * name that matches nothing is the case that used to break.</p>
 */
@SpringBootTest
@ActiveProfiles("test")
class CourseAdminToPublicTest {

    @Autowired
    private CourseService service;

    @Autowired
    private CourseRepository repository;

    @Autowired
    private CourseToolRepository toolRepository;

    @Autowired
    private CourseModuleRepository moduleRepository;

    private static final String COURSE_NAME = "Embedded Systems with Rust";
    private static final String COURSE_SLUG = "embedded-systems-with-rust";

    @BeforeEach
    void cleanUp() {
        toolRepository.deleteAll();
        moduleRepository.deleteAll();
        repository.deleteAll();
    }

    /** Exactly what the admin Courses tab posts when someone fills in the form. */
    private CourseRequest adminSubmission() {
        return CourseRequest.builder()
                .name(COURSE_NAME)
                .shortDescription("Write firmware in Rust, on real hardware, without a garbage collector.")
                .description("A full description, shown in the Why Learn section.")
                .category("Embedded")
                .durationMonths(4)
                .mode(CourseMode.BOTH)
                .badge("NEW")
                .badgeText("New")
                .placementAssistance(true)
                .syllabusUrl("/syllabus/embedded-rust.pdf")
                .enrollUrl("/courses/embedded-systems-with-rust")
                .iconUrl("/tech/rust.svg")
                .roleHeading("What an embedded engineer does")
                .roleIntro("They make the thing boot, and keep it running for ten years.")
                .roleBulletsList(List.of("Bring up a board", "Debug over JTAG", "Ship an OTA update"))
                .tools(List.of(
                        CourseToolRequest.builder()
                                .toolName("Rust").groupName("Language").iconUrl("/tech/rust.svg").displayOrder(1).build(),
                        CourseToolRequest.builder()
                                .toolName("probe-rs").groupName("Tooling").displayOrder(2).build()))
                .modules(List.of(
                        CourseModuleRequest.builder()
                                .title("Module 1 - Board bring-up").content("GPIO\nClocks\nInterrupts").displayOrder(1).build(),
                        CourseModuleRequest.builder()
                                .title("Module 2 - Async on bare metal").content("Executors\nTimers").displayOrder(2).build()))
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("an admin-created course is persisted with every field it was given")
    void createPersistsEveryField() {
        CourseResponse created = service.create(adminSubmission());

        Course stored = repository.findById(created.getId()).orElseThrow();

        assertThat(stored.getName()).isEqualTo(COURSE_NAME);
        assertThat(stored.getIconUrl()).isEqualTo("/tech/rust.svg");
        assertThat(stored.getSyllabusUrl()).isEqualTo("/syllabus/embedded-rust.pdf");
        assertThat(stored.getBadge()).isEqualTo("NEW");
        assertThat(stored.getBadgeText()).isEqualTo("New");
        assertThat(stored.getCategory()).isEqualTo("Embedded");
        assertThat(stored.getRoleHeading()).isEqualTo("What an embedded engineer does");
        assertThat(stored.isPlacementAssistance()).isTrue();

        assertThat(toolRepository.findByCourseIdOrderByDisplayOrderAsc(created.getId()))
                .as("tools submitted with the course are saved as rows, not dropped")
                .hasSize(2);
        assertThat(moduleRepository.findByCourseIdOrderByDisplayOrderAsc(created.getId()))
                .hasSize(2);
    }

    @Test
    @DisplayName("the public catalog serves the new course, tech stack included")
    void publicCatalogCarriesTheCourse() {
        service.create(adminSubmission());

        CourseResponse listed = service.listActive().stream()
                .filter(course -> COURSE_NAME.equals(course.getName()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("the new course is missing from GET /api/courses"));

        // The slug the public URL is built from is derived from the name server-side.
        assertThat(listed.getSlug()).isEqualTo(COURSE_SLUG);

        // Each of these had a frontend fallback that used to win when it was absent.
        assertThat(listed.getIconUrl()).as("card logo").isEqualTo("/tech/rust.svg");
        assertThat(listed.getSyllabusUrl()).as("syllabus download").isEqualTo("/syllabus/embedded-rust.pdf");
        assertThat(listed.getBadgeText()).as("card badge").isEqualTo("New");

        /*
         * The reason listActive changed. It used to call CourseResponse.from(entity),
         * which passes null for tools, so every catalog card had a null tech stack and
         * the frontend guessed one from keywords in the title.
         */
        assertThat(listed.getTechStack())
                .as("GET /api/courses must carry the tools an admin configured")
                .isNotNull()
                .extracting(CourseToolResponse::getItemName)
                .containsExactly("Rust", "probe-rs");

        // A card needs the stack, not the syllabus.
        assertThat(listed.getModules()).as("modules stay off the list payload").isNull();
    }

    @Test
    @DisplayName("the public course page serves modules, tools and role bullets")
    void publicDetailPageCarriesEverything() {
        service.create(adminSubmission());

        CourseResponse detail = service.getByIdOrSlug(COURSE_SLUG);

        assertThat(detail.getName()).isEqualTo(COURSE_NAME);
        assertThat(detail.getDescription()).isEqualTo("A full description, shown in the Why Learn section.");
        assertThat(detail.getRoleIntro()).isEqualTo("They make the thing boot, and keep it running for ten years.");

        assertThat(detail.getModules())
                .extracting(CourseModuleResponse::getTitle)
                .containsExactly("Module 1 - Board bring-up", "Module 2 - Async on bare metal");

        assertThat(detail.getTechStack())
                .extracting(CourseToolResponse::getGroupName)
                .containsExactly("Language", "Tooling");

        /*
         * roleBulletsList is the parsed form. The frontend reads it in preference to
         * the raw column now: parseBullets accepts newline-separated text as well as
         * JSON, and the frontend's own parser only understood JSON, so bullets stored
         * one-per-line used to disappear from the page.
         */
        assertThat(detail.getRoleBulletsList())
                .containsExactly("Bring up a board", "Debug over JTAG", "Ship an OTA update");
    }

    @Test
    @DisplayName("a course reachable at its slug is the one the catalog links to")
    void catalogSlugResolvesToTheSameCourse() {
        CourseResponse created = service.create(adminSubmission());

        CourseResponse listed = service.listActive().stream()
                .filter(course -> created.getId().equals(course.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(service.getByIdOrSlug(listed.getSlug()).getId())
                .as("the slug on a catalog card must open that same course")
                .isEqualTo(created.getId());
    }

    @Test
    @DisplayName("a deactivated course leaves the public catalog but keeps its data")
    void deactivatedCourseIsHiddenFromTheCatalog() {
        CourseResponse created = service.create(adminSubmission());

        Course stored = repository.findById(created.getId()).orElseThrow();
        stored.setActive(false);
        repository.save(stored);

        assertThat(service.listActive())
                .as("an inactive course must not appear on the public catalog")
                .noneMatch(course -> created.getId().equals(course.getId()));

        assertThat(repository.findById(created.getId()))
                .as("hiding it from the catalog must not delete it")
                .isPresent();
    }
}
