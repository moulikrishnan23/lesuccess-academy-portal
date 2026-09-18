package in.lesuccess.portal.companypartner;

import in.lesuccess.portal.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CompanyPartnerController {

    private final CompanyPartnerService service;

    @GetMapping("/api/companies")
    public ResponseEntity<ApiResponse<List<CompanyPartnerResponse>>> listActive() {
        return ResponseEntity.ok(ApiResponse.success("Company partners retrieved", service.listActive()));
    }

    @GetMapping("/api/admin/companies")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<CompanyPartnerResponse>>> listForAdmin() {
        return ResponseEntity.ok(ApiResponse.success("Company partners retrieved for admin", service.listAllForAdmin()));
    }

    @PostMapping("/api/admin/companies")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CompanyPartnerResponse>> create(@Valid @RequestBody CompanyPartnerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company partner created", service.create(request)));
    }

    @PutMapping("/api/admin/companies/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CompanyPartnerResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CompanyPartnerRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Company partner updated", service.update(id, request)));
    }

    @DeleteMapping("/api/admin/companies/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
