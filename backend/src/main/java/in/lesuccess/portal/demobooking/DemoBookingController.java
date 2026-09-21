package in.lesuccess.portal.demobooking;

import in.lesuccess.portal.shared.dto.ApiResponse;
import in.lesuccess.portal.shared.dto.PageResponse;

import jakarta.servlet.http.HttpServletRequest;
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
public class DemoBookingController {

    private final DemoBookingService service;

    /**
     * Public — submit a demo booking from the home page form.
     *
     * <p>Rate-limited (the path is listed in
     * {@code lesuccess.rate-limit.protected-paths}), honeypot-protected and
     * duplicate-detected, matching the other three public forms.</p>
     *
     * <p>A honeypot hit returns exactly the same 201 and body shape as a genuine
     * submission, so a bot cannot tell that it was caught.</p>
     */
    @PostMapping("/api/demo-bookings")
    public ResponseEntity<ApiResponse<DemoBookingResponse>> create(
            @Valid @RequestBody DemoBookingRequest request,
            HttpServletRequest httpRequest) {

        DemoBookingService.DemoBookingSubmitResult result =
                service.create(request, httpRequest.getRemoteAddr());

        String message = "Demo booking submitted successfully";

        if (result.isHoneypot()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(message, result.response()));
    }

    /** Admin — paginated list, filterable by status. */
    @GetMapping("/api/admin/demo-bookings")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<DemoBookingResponse>>> listAll(
            @RequestParam(required = false) DemoBookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success("Demo bookings retrieved successfully", service.listAll(status, pageable)));
    }

    /** Admin — single booking. */
    @GetMapping("/api/admin/demo-bookings/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DemoBookingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Demo booking retrieved successfully", service.getById(id)));
    }

    /** Admin — advance the booking status (PENDING → CONTACTED → ENROLLED). */
    @PatchMapping("/api/admin/demo-bookings/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DemoBookingResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody DemoBookingStatusUpdateRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", service.updateStatus(id, request)));
    }
}
