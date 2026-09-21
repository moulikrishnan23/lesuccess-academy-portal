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
public class CourseModuleResponse {

    private Long id;
    private Long courseId;
    private String title;
    private String content;
    private int displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CourseModuleResponse from(CourseModule entity) {
        return CourseModuleResponse.builder()
                .id(entity.getId())
                .courseId(entity.getCourse().getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
