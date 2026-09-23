package in.lesuccess.portal.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseToolResponse {

    private Long id;
    private Long courseId;
    private String groupName;
    private String toolName;
    private String itemName; // alias for toolName for frontend
    private String iconUrl;
    private int displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CourseToolResponse from(CourseTool entity) {
        String name = entity.getToolName();
        return CourseToolResponse.builder()
                .id(entity.getId())
                .courseId(entity.getCourse().getId())
                .groupName(entity.getGroupName() != null && !entity.getGroupName().isBlank() ? entity.getGroupName() : "Tools")
                .toolName(name)
                .itemName(name)
                .iconUrl(entity.getIconUrl())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}