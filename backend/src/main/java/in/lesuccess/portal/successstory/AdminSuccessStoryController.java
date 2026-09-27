package in.lesuccess.portal.successstory;

import in.lesuccess.portal.shared.dto.ApiResponse;
import in.lesuccess.portal.shared.media.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/success-stories")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminSuccessStoryController {

    private final SuccessStoryService successStoryService;
    private final CloudinaryService cloudinaryService;

    /* =========================================================
       IMAGES
    ========================================================= */

    @GetMapping("/images")
    public ResponseEntity<ApiResponse<List<SuccessStoryImageResponse>>> listAllImages() {
        return ResponseEntity.ok(ApiResponse.success("All images retrieved successfully", successStoryService.listAllImagesForAdmin()));
    }

    @PostMapping("/images")
    public ResponseEntity<ApiResponse<SuccessStoryImageResponse>> createImage(@Valid @RequestBody SuccessStoryImageRequest request) {
        SuccessStoryImageResponse response = successStoryService.createImage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Image created successfully", response));
    }

    @PutMapping("/images/{id}")
    public ResponseEntity<ApiResponse<SuccessStoryImageResponse>> updateImage(
            @PathVariable Long id, 
            @Valid @RequestBody SuccessStoryImageRequest request) {
        SuccessStoryImageResponse response = successStoryService.updateImage(id, request);
        return ResponseEntity.ok(ApiResponse.success("Image updated successfully", response));
    }

    @DeleteMapping("/images/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id) {
        successStoryService.deleteImage(id);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadImage(file, "lesuccess/success-stories");
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", Map.of("url", url)));
    }

    /* =========================================================
       REELS
    ========================================================= */

    @GetMapping("/reels")
    public ResponseEntity<ApiResponse<List<SuccessStoryReelResponse>>> listAllReels() {
        return ResponseEntity.ok(ApiResponse.success("All reels retrieved successfully", successStoryService.listAllReelsForAdmin()));
    }

    @PostMapping("/reels")
    public ResponseEntity<ApiResponse<SuccessStoryReelResponse>> createReel(@Valid @RequestBody SuccessStoryReelRequest request) {
        SuccessStoryReelResponse response = successStoryService.createReel(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Reel created successfully", response));
    }

    @PutMapping("/reels/{id}")
    public ResponseEntity<ApiResponse<SuccessStoryReelResponse>> updateReel(
            @PathVariable Long id, 
            @Valid @RequestBody SuccessStoryReelRequest request) {
        SuccessStoryReelResponse response = successStoryService.updateReel(id, request);
        return ResponseEntity.ok(ApiResponse.success("Reel updated successfully", response));
    }

    @DeleteMapping("/reels/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReel(@PathVariable Long id) {
        successStoryService.deleteReel(id);
        return ResponseEntity.ok(ApiResponse.success("Reel deleted successfully", null));
    }
}
