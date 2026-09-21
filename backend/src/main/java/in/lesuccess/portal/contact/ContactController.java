package in.lesuccess.portal.contact;

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
@RequestMapping("/api/contact-messages")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ApiResponse<ContactMessageResponse>> createContactMessage(
            @Valid @RequestBody ContactMessageRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = httpRequest.getRemoteAddr();
        ContactService.ContactSubmitResult result = contactService.createContactMessage(request, ipAddress);

        if (result.isHoneypot()) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Thank you for reaching out! We will get back to you soon."));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thank you for reaching out! We will get back to you soon.", result.response()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> getContactMessage(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Contact message retrieved successfully",
                contactService.getContactMessage(id)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ContactMessageResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ContactMessageStatusUpdateRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Status updated successfully",
                contactService.updateStatus(id, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteContactMessage(@PathVariable Long id) {
        contactService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
