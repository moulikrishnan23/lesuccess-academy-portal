package in.lesuccess.portal.announcement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementResponse {

    private Long id;
    private String text;
    private String linkLabel;
    private String linkUrl;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AnnouncementResponse from(Announcement entity) {
        return AnnouncementResponse.builder()
                .id(entity.getId())
                .text(entity.getText())
                .linkLabel(entity.getLinkLabel())
                .linkUrl(entity.getLinkUrl())
                .isActive(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
