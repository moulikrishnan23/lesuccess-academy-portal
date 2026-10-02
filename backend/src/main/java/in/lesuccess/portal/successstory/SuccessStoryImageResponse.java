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
public class SuccessStoryImageResponse {
    private Long id;
    private String imageUrl;
    private String caption;
    private int displayOrder;

    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("active")
    public boolean getActive() {
        return isActive;
    }

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SuccessStoryImageResponse from(SuccessStoryImage img) {
        return SuccessStoryImageResponse.builder()
                .id(img.getId())
                .imageUrl(img.getImageUrl())
                .caption(img.getCaption())
                .displayOrder(img.getDisplayOrder())
                .isActive(img.isActive())
                .createdAt(img.getCreatedAt())
                .updatedAt(img.getUpdatedAt())
                .build();
    }
}
