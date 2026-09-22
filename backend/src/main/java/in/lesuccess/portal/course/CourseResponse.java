package in.lesuccess.portal.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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

    private CourseMode mode;
    private String     badge;
    private String     badgeText;
    private String      badgeLabel; // alias for badgeText

    private boolean placementAssistance;
    private String  syllabusUrl;
    private String  enrollUrl;
    private String  iconUrl;

    private String description;
    private String category;
    private String roleHeading;
    private String roleIntro;
    private String roleBullets;
    private List<String> roleBulletsList;

    private boolean isActive;
    private int     displayOrder;

    private List<CourseModuleResponse> modules;
    private List<CourseToolResponse> tools;
    private List<CourseToolResponse> techStack;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private static final com.fasterxml.jackson.databind.ObjectMapper OBJECT_MAPPER = new com.fasterxml.jackson.databind.ObjectMapper();

    public static List<String> parseBullets(String bullets) {
        if (bullets == null || bullets.isBlank()) {
            return java.util.Collections.emptyList();
        }
        String trimmed = bullets.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                return OBJECT_MAPPER.readValue(trimmed, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
            } catch (Exception ignored) {
            }
        }
        return java.util.Arrays.stream(trimmed.split("[\r\n]+"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }

    public static CourseResponse from(Course entity) {
        return from(entity, null, null);
    }

    public static CourseResponse from(Course entity, List<CourseModuleResponse> modules) {
        return from(entity, modules, null);
    }

    public static CourseResponse from(Course entity, List<CourseModuleResponse> modules, List<CourseToolResponse> tools) {
        String name = entity.getName();
        String slug = toSlug(name);
        String roleBullets = entity.getRoleBullets();

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
                .iconUrl(entity.getIconUrl())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .roleHeading(entity.getRoleHeading())
                .roleIntro(entity.getRoleIntro())
                .roleBullets(roleBullets)
                .roleBulletsList(parseBullets(roleBullets))
                .isActive(entity.isActive())
                .displayOrder(entity.getDisplayOrder())
                .modules(modules)
                .tools(tools)
                .techStack(tools)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Converts a course name to a URL-safe slug.
     * "Python : Full Stack Development" → "python-full-stack-development"
     */
    public static String toSlug(String name) {
        if (name == null) return "";
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")   // strip punctuation
                .trim()
                .replaceAll("\\s+", "-")             // spaces → dashes
                .replaceAll("-{2,}", "-");            // collapse consecutive dashes
    }
}
