package in.lesuccess.portal.serviceoffering;

import in.lesuccess.portal.shared.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceOfferingController {

    private final ServiceOfferingService service;

    /** Public — PUBLISHED cards, optionally narrowed to one category, in displayOrder. */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceOfferingResponse>>> listPublished(
            @RequestParam(required = false) ServiceCategory category) {

        return ResponseEntity.ok(ApiResponse.success(
                "Services retrieved successfully", service.listPublished(category)));
    }

    /** Admin — single service, any status. */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceOfferingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Service retrieved successfully", service.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceOfferingResponse>> create(
            @Valid @RequestBody ServiceOfferingRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service created successfully", service.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceOfferingResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ServiceOfferingRequest request) {

        return ResponseEntity.ok(ApiResponse.success(
                "Service updated successfully", service.update(id, request)));
    }

    /** Admin — soft delete (row stays, {@code deleted_at} is stamped). */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
