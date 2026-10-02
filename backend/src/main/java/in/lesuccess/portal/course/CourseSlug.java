package in.lesuccess.portal.course;

import java.util.Locale;

/**
 * The single source of truth for a course's URL slug, derived from its name.
 * Course has no slug column; every /courses/{slug} link in the API, the chatbot's
 * tools and its knowledge index comes from {@link #of(String)}.
 *
 * <p>The rules reproduce the slugs the frontend and the seeded {@code enroll_url}
 * values already use: "&" reads as "and", "C++" as "cpp", and "/" separates words.
 * So "AWS & DevOps" is {@code aws-and-devops}, "C and C++" is {@code c-and-cpp},
 * and "UI/UX" is {@code ui-ux}. CourseSlugTest checks every seeded course against
 * the frontend catalog.</p>
 */
public final class CourseSlug {

    private CourseSlug() {
    }

    public static String of(String name) {
        if (name == null) {
            return "";
        }
        return name.toLowerCase(Locale.ROOT)
                .replace("&", " and ")
                .replace("+", "p")                    // c++ -> cpp
                .replace("/", " ")                    // ui/ux -> ui ux
                .replaceAll("[^a-z0-9\\s-]", "")      // strip remaining punctuation
                .trim()
                .replaceAll("\\s+", "-")              // spaces -> dashes
                .replaceAll("-{2,}", "-")             // collapse consecutive dashes
                .replaceAll("^-|-$", "");             // no leading or trailing dash
    }

    /**
     * True when {@code candidate} is this course's slug, or the slug the earlier
     * rules gave it. Until 2026-10 the backend dropped "&", "+" and "/", so it
     * served aws-devops, c-and-c and frontend-developer-uiux-design; links built
     * from those keep resolving.
     */
    public static boolean matches(String name, String candidate) {
        if (candidate == null) {
            return false;
        }
        String wanted = candidate.trim().toLowerCase(Locale.ROOT);
        return of(name).equals(wanted) || legacyOf(name).equals(wanted);
    }

    /** The pre-2026-10 rules, kept only so {@link #matches} accepts old links. */
    static String legacyOf(String name) {
        if (name == null) {
            return "";
        }
        return name.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("-{2,}", "-");
    }
}
