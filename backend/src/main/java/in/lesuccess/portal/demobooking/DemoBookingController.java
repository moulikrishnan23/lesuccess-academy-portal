package in.lesuccess.portal.demobooking;

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
public class DemoBookingController {

    private final DemoBookingService service;

    /** Public — submit a demo booking from the home page form. */
    @PostMapping("/api/demo-bookings")
    public ResponseEntity<ApiResponse<DemoBookingResponse>> create(
            @Valid @RequestBody DemoBookingRequest request) {

        DemoBookingResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Demo booking submitted successfully", response));
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
