package in.lesuccess.portal.processstep;

import in.lesuccess.portal.shared.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/process-steps")
@RequiredArgsConstructor
public class ProcessStepController {

    private final ProcessStepService service;

    /** Public — all four steps, ordered by stepNumber. */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProcessStepResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.success(
                "Process steps retrieved successfully", service.listAll()));
    }

    /**
     * Admin — edit copy or reorder. There is deliberately no POST or DELETE:
     * the four steps are seeded by migration and are not a growable collection.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProcessStepResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProcessStepRequest request) {

        return ResponseEntity.ok(ApiResponse.success(
                "Process step updated successfully", service.update(id, request)));
    }
}
