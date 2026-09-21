package in.lesuccess.portal.lead;

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
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    /**
     * Public — rate-limited (see RateLimitFilter and
     * {@code lesuccess.rate-limit.protected-paths}), honeypot-protected and
     * duplicate-detected.
     *
     * <p>A honeypot hit returns exactly the same 201 and body shape as a genuine
     * submission, so a bot cannot tell that it was caught.</p>
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LeadResponse>> create(
            @Valid @RequestBody LeadRequest request,
            HttpServletRequest httpRequest) {

        LeadService.LeadSubmitResult result =
                leadService.createLead(request, httpRequest.getRemoteAddr());

        String message = "Thank you! Our team will get in touch with you shortly.";

        if (result.isHoneypot()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(message, result.response()));
    }

    /** Admin — paginated, filterable by status and source. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<LeadResponse>>> list(
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) LeadSource source,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(ApiResponse.success("Leads retrieved successfully",
                leadService.listLeads(status, source, pageable)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeadResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeadStatusUpdateRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Status updated successfully",
                leadService.updateStatus(id, request.getStatus())));
    }
}
