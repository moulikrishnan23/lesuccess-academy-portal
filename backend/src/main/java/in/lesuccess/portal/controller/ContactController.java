package in.lesuccess.portal.controller;

import in.lesuccess.portal.dto.ApiResponse;
import in.lesuccess.portal.dto.ContactMessageRequest;
import in.lesuccess.portal.dto.ContactMessageResponse;
import in.lesuccess.portal.dto.ContactMessageStatusUpdateRequest;
import in.lesuccess.portal.dto.PageResponse;
import in.lesuccess.portal.model.ContactMessageStatus;
import in.lesuccess.portal.service.ContactService;

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
@RequestMapping("/api/contact-messages")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    /**
     * POST /api/contact-messages — public, rate-limited.
     * Returns 201 on success. Honeypot submissions also get 201 (silent discard).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ContactMessageResponse>> createContactMessage(
            @Valid @RequestBody ContactMessageRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = httpRequest.getRemoteAddr();

        ContactService.ContactSubmitResult result = contactService.createContactMessage(request, ipAddress);

        if (result.isHoneypot()) {
            // Return identical 201 shape — don't reveal honeypot detection
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Thank you for reaching out! We will get back to you soon."));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thank you for reaching out! We will get back to you soon.", result.response()));
    }

    /**
     * GET /api/contact-messages — admin, paginated, filterable, searchable.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTENT_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ContactMessageResponse>>> listContactMessages(
            @RequestParam(required = false) ContactMessageStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<ContactMessageResponse> result = contactService.listContactMessages(status, search, pageable);

        return ResponseEntity.ok(ApiResponse.success("Contact messages retrieved successfully", result));
    }

    /**
     * GET /api/contact-messages/{id} — admin, single record.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTENT_ADMIN')")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> getContactMessage(@PathVariable Long id) {
        ContactMessageResponse response = contactService.getContactMessage(id);
        return ResponseEntity.ok(ApiResponse.success("Contact message retrieved successfully", response));
    }

    /**
     * PUT /api/contact-messages/{id}/status — admin, update status.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTENT_ADMIN')")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ContactMessageStatusUpdateRequest request) {

        ContactMessageResponse response = contactService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", response));
    }

    /**
     * DELETE /api/contact-messages/{id} — admin, soft delete. Returns 204.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTENT_ADMIN')")
    public ResponseEntity<Void> deleteContactMessage(@PathVariable Long id) {
        contactService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
