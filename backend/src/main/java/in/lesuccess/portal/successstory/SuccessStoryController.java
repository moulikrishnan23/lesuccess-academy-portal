package in.lesuccess.portal.successstory;

import in.lesuccess.portal.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/success-stories")
@RequiredArgsConstructor
public class SuccessStoryController {

    private final SuccessStoryService successStoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<SuccessStoryCombinedResponse>> getCombinedStories() {
        return ResponseEntity.ok(ApiResponse.success("Success stories retrieved successfully", successStoryService.getCombinedActiveStories()));
    }

    @GetMapping("/images")
    public ResponseEntity<ApiResponse<List<SuccessStoryImageResponse>>> listActiveImages() {
        return ResponseEntity.ok(ApiResponse.success("Active images retrieved successfully", successStoryService.listActiveImages()));
    }

    @GetMapping("/reels")
    public ResponseEntity<ApiResponse<List<SuccessStoryReelResponse>>> listActiveReels() {
        return ResponseEntity.ok(ApiResponse.success("Active reels retrieved successfully", successStoryService.listActiveReels()));
    }
}
