package in.lesuccess.portal.gallery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GalleryImageResponse {

    private Long id;
    private Long categoryId;
    private String title;
    private String imageUrl;
    private String caption;
    private int displayOrder;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static GalleryImageResponse from(GalleryImage img) {
        return GalleryImageResponse.builder()
                .id(img.getId())
                .categoryId(img.getCategoryId())
                .title(img.getTitle())
                .imageUrl(img.getImageUrl())
                .caption(img.getCaption())
                .displayOrder(img.getDisplayOrder())
                .isActive(img.isActive())
                .createdAt(img.getCreatedAt())
                .updatedAt(img.getUpdatedAt())
                .build();
    }
}
