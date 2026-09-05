package in.lesuccess.portal.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {

    private Long id;

    private String name;
    private String title;          // alias for name — frontend reads this

    private String slug;           // URL-safe identifier derived from name

    private String shortDescription;

    private Integer durationMonths;
    private Integer durationValue; // alias for durationMonths
    private String  durationUnit;  // "months" when durationMonths is set

    private CourseMode  mode;
    private CourseBadge badge;
    private String      badgeText;
    private String      badgeLabel; // alias for badgeText

    private boolean placementAssistance;
    private String  syllabusUrl;
    private String  enrollUrl;

    private boolean isActive;
    private int     displayOrder;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CourseResponse from(Course entity) {
        String name = entity.getName();
        String slug = toSlug(name);

        return CourseResponse.builder()
                .id(entity.getId())
                .name(name)
                .title(name)
                .slug(slug)
                .shortDescription(entity.getShortDescription())
                .durationMonths(entity.getDurationMonths())
                .durationValue(entity.getDurationMonths())
                .durationUnit(entity.getDurationMonths() != null ? "months" : null)
                .mode(entity.getMode())
                .badge(entity.getBadge())
                .badgeText(entity.getBadgeText())
                .badgeLabel(entity.getBadgeText())
                .placementAssistance(entity.isPlacementAssistance())
                .syllabusUrl(entity.getSyllabusUrl())
                .enrollUrl(entity.getEnrollUrl())
                .isActive(entity.isActive())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Converts a course name to a URL-safe slug.
     * "Python : Full Stack Development" → "python-full-stack-development"
     */
    static String toSlug(String name) {
        if (name == null) return "";
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")   // strip punctuation
                .trim()
                .replaceAll("\\s+", "-")             // spaces → dashes
                .replaceAll("-{2,}", "-");            // collapse consecutive dashes
    }
}
