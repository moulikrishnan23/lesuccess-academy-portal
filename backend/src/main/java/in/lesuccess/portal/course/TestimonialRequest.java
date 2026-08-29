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

    // @Builder.Default, not a bare initialiser: @Builder generates its own field
    // initialisation and ignores the expression entirely, so builder().build()
    // would yield false — the opposite of the intended default. Jackson binding
    // is unaffected (it goes through the no-args constructor, where the
    // initialiser does apply), which is what makes the builder path easy to miss.
    // Matches CourseRequest and UpcomingProgramRequest.
    @lombok.Builder.Default
    private boolean isActive = true;
}
