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
public class TeamMemberController {

    private final TeamMemberService service;

    @GetMapping("/api/team-members")
    public ResponseEntity<ApiResponse<List<TeamMemberResponse>>> listActive() {
        return ResponseEntity.ok(ApiResponse.success("Team members retrieved", service.listActive()));
    }

    @GetMapping("/api/admin/team-members")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TeamMemberResponse>>> listForAdmin() {
        return ResponseEntity.ok(ApiResponse.success("Team members retrieved for admin", service.listAllForAdmin()));
    }

    @PostMapping("/api/admin/team-members")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TeamMemberResponse>> create(@Valid @RequestBody TeamMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team member created", service.create(request)));
    }

    @PutMapping("/api/admin/team-members/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TeamMemberResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody TeamMemberRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Team member updated", service.update(id, request)));
    }

    @DeleteMapping("/api/admin/team-members/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
