package in.lesuccess.portal.teammember;

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
public class TeamCategoryController {

    private final TeamCategoryService service;

    @GetMapping("/api/team-categories")
    public ResponseEntity<ApiResponse<List<TeamCategoryResponse>>> listCategories() {
        return ResponseEntity.ok(ApiResponse.success("Team categories retrieved", service.listAll()));
    }

    @PostMapping("/api/admin/team-categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TeamCategoryResponse>> createCategory(@Valid @RequestBody TeamCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team category created", service.create(request)));
    }

    @DeleteMapping("/api/admin/team-categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}