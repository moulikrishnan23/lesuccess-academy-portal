package in.lesuccess.portal.sitesetting;

import in.lesuccess.portal.shared.dto.ApiResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SiteSettingController {

    private final SiteSettingService service;
    private final in.lesuccess.portal.shared.media.CloudinaryService cloudinaryService;

    /**
     * How long a client or CDN may serve this response without revalidating.
     * Five minutes: settings change on the order of months, but an admin who
     * fixes a wrong phone number should not wait an hour to see it.
     */
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);

    /** Public — the whole key/value map, cacheable. */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getAll() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(CACHE_TTL).cachePublic())
                .body(ApiResponse.success("Settings retrieved successfully", service.getAll()));
    }

    /**
     * Admin — partial update. The body is the key/value map itself, so a caller
     * sends {@code {"phone_primary": "+91..."}} rather than wrapping it.
     * Keys not present are left untouched; unknown keys are rejected with 400.
     */
    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> update(
            @RequestBody Map<String, String> updates) {

        return ResponseEntity.ok(ApiResponse.success(
                "Settings updated successfully", service.updateAll(updates)));
    }

    /**
     * Admin — upload and replace the Home Hero video file directly to Cloudinary
     * and persist its secure URL in site settings.
     */
    @PostMapping(value = "/hero-video", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadHeroVideo(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        String videoUrl = cloudinaryService.uploadVideo(file, "lesuccess/video");
        Map<String, String> updated = service.updateAll(Map.of(
                "hero_video_url", videoUrl,
                "hero_video_enabled", "true"
        ));
        return ResponseEntity.ok(ApiResponse.success("Hero video uploaded successfully", updated));
    }
}
