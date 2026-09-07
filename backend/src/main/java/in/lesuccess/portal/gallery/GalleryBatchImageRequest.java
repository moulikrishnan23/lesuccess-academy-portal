package in.lesuccess.portal.gallery;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GalleryBatchImageRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotEmpty(message = "At least one image URL is required")
    private List<String> imageUrls;
}
