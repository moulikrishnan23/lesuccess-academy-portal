package in.lesuccess.portal.gallery;

import in.lesuccess.portal.shared.dto.ApiResponse;
import in.lesuccess.portal.shared.exception.InvalidRequestException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin/gallery")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@RequiredArgsConstructor
public class AdminGalleryController {

    private final GalleryService galleryService;

    /* =========================================================
       CATEGORY CRUD
    ========================================================= */

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<GalleryCategoryResponse>>> listCategories() {
        return ResponseEntity.ok(ApiResponse.success("All gallery categories retrieved",
                galleryService.listAllCategoriesForAdmin()));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<GalleryCategoryResponse>> createCategory(
            @Valid @RequestBody GalleryCategoryRequest request) {
        GalleryCategoryResponse response = galleryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", response));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<GalleryCategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody GalleryCategoryRequest request) {
        GalleryCategoryResponse response = galleryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        galleryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }

    /* =========================================================
       IMAGE CRUD
    ========================================================= */

    @GetMapping("/categories/{categoryId}/images")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> listImages(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success("Category images retrieved",
                galleryService.listAllImagesForAdmin(categoryId)));
    }

    @PostMapping("/images")
    public ResponseEntity<ApiResponse<GalleryImageResponse>> createImage(
            @Valid @RequestBody GalleryImageRequest request) {
        GalleryImageResponse response = galleryService.createImage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image added to gallery successfully", response));
    }

    @PutMapping("/images/{id}")
    public ResponseEntity<ApiResponse<GalleryImageResponse>> updateImage(
            @PathVariable Long id,
            @Valid @RequestBody GalleryImageRequest request) {
        GalleryImageResponse response = galleryService.updateImage(id, request);
        return ResponseEntity.ok(ApiResponse.success("Image updated successfully", response));
    }

    @PostMapping("/images/batch")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> createBatchImages(
            @Valid @RequestBody GalleryBatchImageRequest request) {
        List<GalleryImageResponse> responses = galleryService.createBatchImages(
                request.getCategoryId(), request.getImageUrls());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Images added to gallery successfully", responses));
    }

    @DeleteMapping("/images/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id) {
        galleryService.deleteImage(id);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
    }

    /* =========================================================
       IMAGE FILE UPLOAD & BULK UPLOAD
    ========================================================= */

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidRequestException("Cannot upload empty file");
        }

        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf(".")).toLowerCase();
        }

        if (!List.of(".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif").contains(ext)) {
            throw new InvalidRequestException("Only image files (.jpg, .jpeg, .png, .webp, .svg, .gif) are supported");
        }

        try {
            Path uploadDir = Paths.get("uploads", "gallery");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String filename = UUID.randomUUID().toString() + ext;
            Path targetPath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/gallery/" + filename;
            log.info("File uploaded successfully: {}", fileUrl);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("File uploaded successfully", Map.of("url", fileUrl, "filename", filename)));
        } catch (IOException e) {
            log.error("Failed to store file upload", e);
            throw new InvalidRequestException("Failed to store file: " + e.getMessage());
        }
    }

    @PostMapping(value = "/upload-batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> uploadBatchImages(
            @RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new InvalidRequestException("No files selected for upload");
        }

        List<Map<String, String>> uploaded = new ArrayList<>();
        Path uploadDir = Paths.get("uploads", "gallery");
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new InvalidRequestException("Failed to create upload directory: " + e.getMessage());
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String original = file.getOriginalFilename();
            String ext = "";
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf(".")).toLowerCase();
            }

            if (!List.of(".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif").contains(ext)) {
                throw new InvalidRequestException("Unsupported file type in batch: " + original);
            }

            try {
                String filename = UUID.randomUUID().toString() + ext;
                Path targetPath = uploadDir.resolve(filename);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                String fileUrl = "/uploads/gallery/" + filename;
                uploaded.add(Map.of("url", fileUrl, "filename", filename));
            } catch (IOException e) {
                log.error("Failed to store file upload: " + original, e);
                throw new InvalidRequestException("Failed to store file " + original + ": " + e.getMessage());
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Batch files uploaded successfully", uploaded));
    }

    @PostMapping(value = "/categories/{categoryId}/upload-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> uploadAndCreateImages(
            @PathVariable Long categoryId,
            @RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new InvalidRequestException("No files selected for upload");
        }

        List<String> imageUrls = new ArrayList<>();
        Path uploadDir = Paths.get("uploads", "gallery");
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new InvalidRequestException("Failed to create upload directory: " + e.getMessage());
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String original = file.getOriginalFilename();
            String ext = "";
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf(".")).toLowerCase();
            }

            if (!List.of(".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif").contains(ext)) {
                throw new InvalidRequestException("Unsupported file format: " + original + ". Supported: JPG, PNG, WebP, GIF, SVG");
            }

            try {
                String filename = UUID.randomUUID().toString() + ext;
                Path targetPath = uploadDir.resolve(filename);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                String fileUrl = "/uploads/gallery/" + filename;
                imageUrls.add(fileUrl);
            } catch (IOException e) {
                log.error("Failed to save uploaded file: " + original, e);
                throw new InvalidRequestException("Failed to store file " + original + ": " + e.getMessage());
            }
        }

        List<GalleryImageResponse> created = galleryService.createBatchImages(categoryId, imageUrls);
        log.info("Uploaded and added {} photos to category id={}", created.size(), categoryId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Photos uploaded and added to album successfully", created));
    }
}
