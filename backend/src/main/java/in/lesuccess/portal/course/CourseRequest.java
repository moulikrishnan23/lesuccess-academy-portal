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

    private CourseBadge badge;

    @Size(max = 50, message = "Badge text must not exceed 50 characters")
    private String badgeText;

    private boolean placementAssistance;

    @Size(max = 255, message = "Syllabus URL must not exceed 255 characters")
    private String syllabusUrl;

    @Size(max = 255, message = "Enroll URL must not exceed 255 characters")
    private String enrollUrl;

    private boolean isActive = true;

    @Min(value = 0, message = "Display order must be 0 or greater")
    private int displayOrder;
}
