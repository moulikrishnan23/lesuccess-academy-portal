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

    @NotBlank(message = "Module title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String content;

    @Min(value = 0, message = "Display order must be 0 or greater")
    private int displayOrder;
}
