package in.lesuccess.portal.announcement;

import in.lesuccess.portal.shared.dto.ApiResponse;
import in.lesuccess.portal.shared.dto.PageResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService service;

    /** Public — returns the single active announcement for the ticker. */
    @GetMapping("/api/announcements/active")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> getActive() {
        return service.getActive()
                .map(a -> ResponseEntity.ok(ApiResponse.success("Active announcement retrieved", a)))
                .orElse(ResponseEntity.ok(ApiResponse.success("No active announcement")));
    }

    /** Admin — paginated list of all announcements. */
    @GetMapping("/api/admin/announcements")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<AnnouncementResponse>>> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success("Announcements retrieved successfully", service.listAll(pageable)));
    }

    /** Admin — create a new announcement (inactive by default). */
    @PostMapping("/api/admin/announcements")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> create(@Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Announcement created successfully", service.create(request)));
    }

    /** Admin — update text/links of an existing announcement. */
    @PutMapping("/api/admin/announcements/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Announcement updated successfully", service.update(id, request)));
    }

    /** Admin — make this announcement the active ticker (deactivates all others). */
    @PatchMapping("/api/admin/announcements/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> activate(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Announcement activated", service.activate(id)));
    }

    /** Admin — soft delete. */
    @DeleteMapping("/api/admin/announcements/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
