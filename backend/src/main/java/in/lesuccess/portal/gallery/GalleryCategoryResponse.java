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
public class GalleryCategoryResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private String coverImageUrl;
    private Long parentId;
    private int displayOrder;
    private boolean isActive;
    private long imageCount;
    private long subCategoryCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static GalleryCategoryResponse from(GalleryCategory cat, long imageCount, long subCategoryCount) {
        return GalleryCategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .slug(cat.getSlug())
                .description(cat.getDescription())
                .coverImageUrl(cat.getCoverImageUrl())
                .parentId(cat.getParentId())
                .displayOrder(cat.getDisplayOrder())
                .isActive(cat.isActive())
                .imageCount(imageCount)
                .subCategoryCount(subCategoryCount)
                .createdAt(cat.getCreatedAt())
                .updatedAt(cat.getUpdatedAt())
                .build();
    }
}
