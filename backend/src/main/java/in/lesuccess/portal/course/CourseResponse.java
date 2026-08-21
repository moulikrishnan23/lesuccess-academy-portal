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
public class CourseResponse {

    private Long id;
    private String name;
    private String shortDescription;
    private Integer durationMonths;
    private CourseMode mode;
    private CourseBadge badge;
    private String badgeText;
    private boolean placementAssistance;
    private String syllabusUrl;
    private String enrollUrl;
    private boolean isActive;
    private int displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CourseResponse from(Course entity) {
        return CourseResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .shortDescription(entity.getShortDescription())
                .durationMonths(entity.getDurationMonths())
                .mode(entity.getMode())
                .badge(entity.getBadge())
                .badgeText(entity.getBadgeText())
                .placementAssistance(entity.isPlacementAssistance())
                .syllabusUrl(entity.getSyllabusUrl())
                .enrollUrl(entity.getEnrollUrl())
                .isActive(entity.isActive())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
