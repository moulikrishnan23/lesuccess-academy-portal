package in.lesuccess.portal.course;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequest {

    @NotBlank(message = "Course name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    private String shortDescription;

    @Min(value = 1, message = "Duration must be at least 1 month")
    private Integer durationMonths;

    @NotNull(message = "Mode is required")
    private CourseMode mode;

    @Size(max = 50, message = "Badge must not exceed 50 characters")
    private String badge;

    @Size(max = 50, message = "Badge text must not exceed 50 characters")
    private String badgeText;

    private Boolean placementAssistance;

    @Size(max = 255, message = "Syllabus URL must not exceed 255 characters")
    private String syllabusUrl;

    @Size(max = 255, message = "Enroll URL must not exceed 255 characters")
    private String enrollUrl;

    @Size(max = 255, message = "Icon URL must not exceed 255 characters")
    private String iconUrl;

    private String description;

    @Size(max = 80, message = "Category must not exceed 80 characters")
    private String category;

    @Size(max = 200, message = "Role heading must not exceed 200 characters")
    private String roleHeading;

    private String roleIntro;

    private String roleBullets;

    private java.util.List<String> roleBulletsList;

    private java.util.List<CourseToolRequest> tools;

    private java.util.List<CourseModuleRequest> modules;

    @lombok.Builder.Default
    private Boolean isActive = true;

    /*
     * @Builder.Default, or the builder ignores this initializer and leaves the
     * field null.
     *
     * Nothing observable depends on it today: getDisplayOrder() below coerces
     * null to 0, and Lombok routes the generated equals, hashCode and toString
     * through that accessor rather than reading the field directly (verified in
     * the bytecode - they call getDisplayOrder()I). So it is here for two duller
     * reasons: the field then holds what its declaration says it holds, and
     * deleting the null check below - which reads as redundant sitting next to
     * an initializer - cannot quietly turn every builder-built request's order
     * into null. isActive above already carries it.
     */
    @Builder.Default
    @Min(value = 0, message = "Display order must be 0 or greater")
    private Integer displayOrder = 0;

    public int getDisplayOrder() {
        return displayOrder != null ? displayOrder : 0;
    }

    public boolean isPlacementAssistance() {
        return Boolean.TRUE.equals(placementAssistance);
    }

    public boolean isActive() {
        return isActive == null || isActive;
    }

    public String resolveRoleBullets() {
        if (roleBullets != null && !roleBullets.isBlank()) {
            return roleBullets;
        }
        if (roleBulletsList != null && !roleBulletsList.isEmpty()) {
            try {
                return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(roleBulletsList);
            } catch (Exception e) {
                return String.join("\n", roleBulletsList);
            }
        }
        return null;
    }
}
