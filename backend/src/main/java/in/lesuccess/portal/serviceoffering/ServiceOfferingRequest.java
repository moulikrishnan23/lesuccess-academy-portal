package in.lesuccess.portal.serviceoffering;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOfferingRequest {

    @NotNull(message = "Category is required")
    private ServiceCategory category;

    @NotBlank(message = "Title is required")
    @Size(max = 120, message = "Title must not exceed 120 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @Size(max = 255, message = "Icon URL must not exceed 255 characters")
    private String iconUrl;

    /** Optional on create — the entity defaults to DRAFT so nothing goes live by accident. */
    private ServiceStatus status;

    @PositiveOrZero(message = "Display order must be zero or greater")
    private int displayOrder;
}
