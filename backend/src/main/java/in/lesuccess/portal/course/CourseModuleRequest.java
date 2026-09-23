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
public class CourseModuleRequest {

    private Long id;

    @NotBlank(message = "Module title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String content;

    private java.util.List<String> topics;

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

    public String resolveContent() {
        if (content != null && !content.isBlank()) {
            return content;
        }
        if (topics != null && !topics.isEmpty()) {
            try {
                return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(topics);
            } catch (Exception e) {
                return String.join("\n", topics);
            }
        }
        return null;
    }
}
