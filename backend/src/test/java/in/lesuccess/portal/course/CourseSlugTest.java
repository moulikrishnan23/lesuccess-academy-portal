package in.lesuccess.portal.course;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.SoftAssertions.assertSoftly;

/**
 * Keeps backend course slugs equal to the slugs the frontend links to.
 *
 * <p>Course names are read from the Flyway seed migrations themselves: every
 * {@code INSERT INTO course} row, then every later {@code UPDATE course SET name},
 * applied in version order. A renamed or newly seeded course is therefore checked
 * without editing this test. The expected slugs are copied from
 * frontend/src/mocks/catalog.js and matched by course name. catalog.js numbers
 * courses differently from the database (catalog id 3 is DB id 2), so the map
 * below is keyed by DB id with the name alongside.</p>
 */
class CourseSlugTest {

    /** DB id -> slug used in frontend/src/mocks/catalog.js (and Footer.jsx, OfferHeader.jsx). */
    private static final Map<Long, String> FRONTEND_SLUGS = Map.ofEntries(
            Map.entry(1L, "python-full-stack-development"),                // Python : Full Stack Development
            Map.entry(2L, "full-stack-java"),                              // Full Stack Java
            Map.entry(3L, "data-analytics"),                               // Data Analytics
            Map.entry(4L, "aws-and-devops"),                               // AWS & DevOps
            Map.entry(5L, "mern-full-stack"),                              // MERN Full Stack
            Map.entry(6L, "mean-full-stack"),                              // MEAN Full Stack
            Map.entry(7L, "c-and-cpp"),                                    // C and C++
            Map.entry(8L, "dsa-with-python-java"),                         // DSA with Python / Java
            Map.entry(9L, "data-science"),                                 // Data Science
            Map.entry(10L, "artificial-intelligence-and-machine-learning"), // Artificial Intelligence and Machine Learning
            Map.entry(11L, "aws-the-ultimate"),                            // AWS - The Ultimate
            Map.entry(12L, "frontend-developer-ui-ux-design"),             // Frontend Developer - UI/UX Design
            Map.entry(13L, "data-engineering"),                            // Data Engineering
            Map.entry(14L, "digital-marketing"),                           // Digital Marketing
            Map.entry(15L, "gen-ai"),                                      // Gen AI
            Map.entry(16L, "agentic-ai"),                                  // Agentic AI
            Map.entry(17L, "servicenow"),                                  // ServiceNow
            Map.entry(18L, "cybersecurity"),                               // Cybersecurity
            Map.entry(19L, "tally"),                                       // Tally
            Map.entry(20L, "placement-readiness-program"));                // Placement Readiness Program

    private static final Pattern MIGRATION_FILE = Pattern.compile("V(\\d+)__.*\\.sql");
    private static final Pattern INSERT_COURSE = Pattern.compile("INSERT INTO course\\s*\\(", Pattern.CASE_INSENSITIVE);
    private static final Pattern NEXT_STATEMENT = Pattern.compile("(?m)^\\s*(INSERT|UPDATE|DELETE|ALTER|CREATE)\\b",
            Pattern.CASE_INSENSITIVE);
    /** A VALUES row starts a line: (id, 'name', ... ; '' is an escaped quote. */
    private static final Pattern VALUES_ROW = Pattern.compile("(?m)^\\s*\\(\\s*(\\d+)\\s*,\\s*'((?:[^']|'')*)'");
    private static final Pattern RENAME = Pattern.compile(
            "(?s)UPDATE course SET\\s+(?:(?!WHERE).)*?\\bname\\s*=\\s*'((?:[^']|'')*)'(?:(?!WHERE).)*?WHERE id\\s*=\\s*(\\d+)",
            Pattern.CASE_INSENSITIVE);

    @Test
    @DisplayName("Every seeded course's backend slug equals the slug the frontend uses")
    void seededCourses_matchFrontendSlugs() throws Exception {
        Map<Long, String> seededNames = seededCourseNames();

        assertThat(seededNames.keySet())
                .as("seed migrations and the frontend catalog cover the same courses")
                .containsExactlyInAnyOrderElementsOf(FRONTEND_SLUGS.keySet());

        assertSoftly(softly -> seededNames.forEach((id, name) ->
                softly.assertThat(CourseSlug.of(name))
                        .as("course %d '%s'", id, name)
                        .isEqualTo(FRONTEND_SLUGS.get(id))));
    }

    @Test
    @DisplayName("Slugs the backend served before 2026-10 still resolve to their course")
    void legacySlugs_stillMatch() {
        assertThat(CourseSlug.matches("AWS & DevOps", "aws-devops")).isTrue();
        assertThat(CourseSlug.matches("C and C++", "c-and-c")).isTrue();
        assertThat(CourseSlug.matches("Frontend Developer - UI/UX Design", "frontend-developer-uiux-design")).isTrue();
        assertThat(CourseSlug.matches("AWS & DevOps", "aws-and-devops")).isTrue();
        assertThat(CourseSlug.matches("AWS & DevOps", "AWS-AND-DEVOPS ")).as("case and whitespace tolerant").isTrue();
        assertThat(CourseSlug.matches("AWS & DevOps", "aws-the-ultimate")).isFalse();
        assertThat(CourseSlug.matches("AWS & DevOps", null)).isFalse();
    }

    @Test
    @DisplayName("Edge cases: null, punctuation-only and leading or trailing separators")
    void edgeCases() {
        assertThat(CourseSlug.of(null)).isEmpty();
        assertThat(CourseSlug.of("  /  ")).isEmpty();
        assertThat(CourseSlug.of("- Gen AI -")).isEqualTo("gen-ai");
    }

    /** id -> final name after applying every seed migration in version order. */
    private static Map<Long, String> seededCourseNames() throws IOException, URISyntaxException {
        Path migrations = Path.of(CourseSlugTest.class.getResource("/db/migration").toURI());
        List<Path> files = new ArrayList<>();
        try (Stream<Path> listing = Files.list(migrations)) {
            listing.filter(p -> MIGRATION_FILE.matcher(p.getFileName().toString()).matches()).forEach(files::add);
        }
        files.sort(Comparator.comparingInt(CourseSlugTest::version));

        Map<Long, String> names = new TreeMap<>();
        for (Path file : files) {
            String sql = withoutLineComments(Files.readString(file, StandardCharsets.UTF_8));

            Matcher insert = INSERT_COURSE.matcher(sql);
            while (insert.find()) {
                Matcher next = NEXT_STATEMENT.matcher(sql);
                int end = next.find(insert.end()) ? next.start() : sql.length();
                Matcher row = VALUES_ROW.matcher(sql).region(insert.end(), end);
                while (row.find()) {
                    names.put(Long.parseLong(row.group(1)), row.group(2).replace("''", "'"));
                }
            }

            Matcher rename = RENAME.matcher(sql);
            while (rename.find()) {
                names.put(Long.parseLong(rename.group(2)), rename.group(1).replace("''", "'"));
            }
        }
        return names;
    }

    private static int version(Path file) {
        Matcher matcher = MIGRATION_FILE.matcher(file.getFileName().toString());
        return matcher.matches() ? Integer.parseInt(matcher.group(1)) : Integer.MAX_VALUE;
    }

    private static String withoutLineComments(String sql) {
        return sql.replaceAll("(?m)^\\s*--.*$", "");
    }
}
