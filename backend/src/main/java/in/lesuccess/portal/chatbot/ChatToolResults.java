package in.lesuccess.portal.chatbot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Compact, read-only shapes that {@link ChatTools} hands to the model.
 *
 * <p>Never JPA entities. Every field is serialised into the prompt, so these
 * carry only what an answer needs. Fields the database does not have (course
 * price, discount price, webinar "is free") are absent rather than faked.</p>
 */
public final class ChatToolResults {

    private ChatToolResults() {
    }

    /** One catalog match. {@code badge} is the course's marketing label, e.g. "30% OFF". */
    public record CourseSummary(
            String title,
            String slug,
            String category,
            Integer durationValue,
            String durationUnit,
            String mode,
            String badge) {
    }

    public record CourseDetails(
            String title,
            String slug,
            String category,
            String shortDescription,
            Integer durationValue,
            String durationUnit,
            String mode,
            String badge,
            boolean placementAssistance,
            String pageUrl,
            List<String> moduleTitles,
            List<String> techStack) {
    }

    /** Exactly one of {@code course} or {@code message} is set. */
    public record CourseDetailsResult(boolean found, CourseDetails course, String message) {

        static CourseDetailsResult found(CourseDetails course) {
            return new CourseDetailsResult(true, course, null);
        }

        static CourseDetailsResult notFound(String slug) {
            return new CourseDetailsResult(false, null,
                    "No published course was found for '" + slug + "'. Use searchCourses to find the right slug.");
        }
    }

    public record Webinar(
            String title,
            String topic,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String platform,
            boolean hasCertificate) {
    }

    /** Blank settings come back as null, so the model cannot quote an empty value. */
    public record ContactInfo(
            String primaryPhone,
            String secondaryPhone,
            String email,
            String address,
            String contactPageUrl) {
    }
}
