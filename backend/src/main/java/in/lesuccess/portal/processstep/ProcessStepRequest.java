package in.lesuccess.portal.processstep;

import jakarta.validation.constraints.Max;
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
public class ProcessStepRequest {

    /**
     * 1-4. Bounded because the section is a fixed four-step diagram — a step 7
     * would render off the end of it.
     */
    @Min(value = 1, message = "Step number must be between 1 and 4")
    @Max(value = 4, message = "Step number must be between 1 and 4")
    private int stepNumber;

    @NotBlank(message = "Title is required")
    @Size(max = 80, message = "Title must not exceed 80 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 255, message = "Icon URL must not exceed 255 characters")
    private String iconUrl;
}
