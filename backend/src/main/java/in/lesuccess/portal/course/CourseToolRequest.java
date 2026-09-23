package in.lesuccess.portal.course;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseToolRequest {

    private Long id;

    @Size(max = 80, message = "Group name must not exceed 80 characters")
    private String groupName;

    @NotBlank(message = "Tool name is required")
    @Size(max = 120, message = "Tool name must not exceed 120 characters")
    private String toolName;

    // Alias for toolName so frontends sending itemName also work
    public void setItemName(String itemName) {
        if (this.toolName == null || this.toolName.isBlank()) {
            this.toolName = itemName;
        }
    }

    @Size(max = 255, message = "Icon URL must not exceed 255 characters")
    private String iconUrl;

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
}