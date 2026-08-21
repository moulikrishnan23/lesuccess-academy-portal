package in.lesuccess.portal.upcomingprogram;

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

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UpcomingProgramController {

    private final UpcomingProgramService service;

    /** Public — upcoming active programs, optionally filtered by type. */
    @GetMapping("/api/upcoming-programs")
    public ResponseEntity<ApiResponse<List<UpcomingProgramResponse>>> listUpcoming(
            @RequestParam(required = false) UpcomingProgramType type) {

        return ResponseEntity.ok(ApiResponse.success("Upcoming programs retrieved successfully", service.listUpcoming(type)));
    }

    /** Public — single program detail. */
    @GetMapping("/api/upcoming-programs/{id}")
    public ResponseEntity<ApiResponse<UpcomingProgramResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Upcoming program retrieved successfully", service.getById(id)));
    }

    /** Public — register for a program ("Register Now" button). */
    @PostMapping("/api/upcoming-programs/{id}/register")
    public ResponseEntity<ApiResponse<UpcomingProgramRegistrationResponse>> register(
            @PathVariable Long id,
            @Valid @RequestBody UpcomingProgramRegistrationRequest request,
            HttpServletRequest httpRequest) {

        UpcomingProgramRegistrationResponse response = service.register(id, request, httpRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful!", response));
    }

    /** Admin — all programs (including past), paginated, optionally filtered by type. */
    @GetMapping("/api/admin/upcoming-programs")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<UpcomingProgramResponse>>> listAll(
            @RequestParam(required = false) UpcomingProgramType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "eventDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success("Upcoming programs retrieved successfully", service.listAllForAdmin(type, pageable)));
    }

    /** Admin — create a new program. */
    @PostMapping("/api/admin/upcoming-programs")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UpcomingProgramResponse>> create(@Valid @RequestBody UpcomingProgramRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Upcoming program created successfully", service.create(request)));
    }

    /** Admin — update an existing program. */
    @PutMapping("/api/admin/upcoming-programs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UpcomingProgramResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpcomingProgramRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Upcoming program updated successfully", service.update(id, request)));
    }

    /** Admin — soft delete. */
    @DeleteMapping("/api/admin/upcoming-programs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    /** Admin — list all registrations for a specific program. */
    @GetMapping("/api/admin/upcoming-programs/{id}/registrations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<UpcomingProgramRegistrationResponse>>> listRegistrations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success("Registrations retrieved successfully", service.listRegistrations(id, pageable)));
    }
}
