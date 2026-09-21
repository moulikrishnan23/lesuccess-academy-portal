package in.lesuccess.portal.testimonial;

import in.lesuccess.portal.course.TestimonialRequest;
import in.lesuccess.portal.course.TestimonialResponse;
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
public class TestimonialController {

    private final TestimonialService service;

    /** Public — list all active testimonials & Google reviews. */
    @GetMapping("/api/testimonials")
    public ResponseEntity<ApiResponse<List<TestimonialResponse>>> listActive() {
        return ResponseEntity.ok(ApiResponse.success("Testimonials retrieved successfully", service.listActive()));
    }

    /** Public — single testimonial. */
    @GetMapping("/api/testimonials/{id}")
    public ResponseEntity<ApiResponse<TestimonialResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Testimonial retrieved successfully", service.getById(id)));
    }

    /** Admin — list all testimonials & Google reviews. */
    @GetMapping("/api/admin/testimonials")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TestimonialResponse>>> listForAdmin() {
        return ResponseEntity.ok(ApiResponse.success("Testimonials retrieved for admin", service.listAllForAdmin()));
    }

    /** Admin — create a new testimonial / review. */
    @PostMapping("/api/admin/testimonials")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TestimonialResponse>> create(@Valid @RequestBody TestimonialRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Testimonial created successfully", service.create(request)));
    }

    /** Admin — update an existing testimonial. */
    @PutMapping("/api/admin/testimonials/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TestimonialResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody TestimonialRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Testimonial updated successfully", service.update(id, request)));
    }

    /** Admin — soft delete testimonial. */
    @DeleteMapping("/api/admin/testimonials/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
