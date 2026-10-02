package in.lesuccess.portal.successstory;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuccessStoryReelResponse {
    private Long id;
    private String reelUrl;
    private String title;
    private int displayOrder;

    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("active")
    public boolean getActive() {
        return isActive;
    }

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SuccessStoryReelResponse from(SuccessStoryReel reel) {
        return SuccessStoryReelResponse.builder()
                .id(reel.getId())
                .reelUrl(reel.getReelUrl())
                .title(reel.getTitle())
                .displayOrder(reel.getDisplayOrder())
                .isActive(reel.isActive())
                .createdAt(reel.getCreatedAt())
                .updatedAt(reel.getUpdatedAt())
                .build();
    }
}
