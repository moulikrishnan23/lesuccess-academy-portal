package in.lesuccess.portal.course;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialRequest {

    @NotBlank(message = "Student name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String studentName;

    @NotBlank(message = "Review text is required")
    private String reviewText;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private int rating;

    @Size(max = 255, message = "Photo URL must not exceed 255 characters")
    private String photoUrl;

    @Min(value = 0, message = "Display order must be 0 or greater")
    private int displayOrder;

    private boolean isActive = true;
}
