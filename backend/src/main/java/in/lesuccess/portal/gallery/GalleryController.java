package in.lesuccess.portal.gallery;

import in.lesuccess.portal.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<GalleryCategoryResponse>>> listCategories() {
        return ResponseEntity.ok(ApiResponse.success("Gallery categories retrieved successfully",
                galleryService.listPublicCategories()));
    }

    @GetMapping("/categories/{slugOrId}")
    public ResponseEntity<ApiResponse<GalleryCategoryResponse>> getCategory(@PathVariable String slugOrId) {
        return ResponseEntity.ok(ApiResponse.success("Gallery category retrieved successfully",
                galleryService.getCategory(slugOrId)));
    }

    @GetMapping("/categories/{id}/subcategories")
    public ResponseEntity<ApiResponse<List<GalleryCategoryResponse>>> listSubcategories(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Gallery subcategories retrieved successfully",
                galleryService.listPublicSubcategories(id)));
    }

    @GetMapping("/categories/{id}/images")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> listCategoryImages(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Gallery images retrieved successfully",
                galleryService.listCategoryImages(id)));
    }
}
