package in.lesuccess.portal.teammember;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamCategoryResponse {
    private Long id;
    private String name;
    private int displayOrder;
    private LocalDateTime createdAt;

    public static TeamCategoryResponse from(TeamCategory entity) {
        return TeamCategoryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}