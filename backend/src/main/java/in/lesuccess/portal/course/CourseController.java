package in.lesuccess.portal.course;

import in.lesuccess.portal.shared.dto.ApiResponse;
import in.lesuccess.portal.shared.dto.PageResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CourseController {

    // ── Course CRUD ───────────────────────────────────────────────────────────

    private final CourseService service;

    /** Public — active courses ordered by displayOrder (home page cards + booking dropdown). */
    @GetMapping("/api/courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> listActive() {
        return ResponseEntity.ok(ApiResponse.success("Courses retrieved successfully", service.listActive()));
    }

    /** Public — single course detail. */
    @GetMapping("/api/courses/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Course retrieved successfully", service.getById(id)));
    }

    /** Admin — all courses (including inactive), paginated. */
    @GetMapping("/api/admin/courses")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<CourseResponse>>> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success("Courses retrieved successfully", service.listAllForAdmin(pageable)));
    }

    /** Admin — create a new course. */
    @PostMapping("/api/admin/courses")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CourseResponse>> create(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Course created successfully", service.create(request)));
    }

    /** Admin — update an existing course. */
    @PutMapping("/api/admin/courses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CourseResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", service.update(id, request)));
    }

    /** Admin — update display order only. */
    @PatchMapping("/api/admin/courses/{id}/order")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CourseResponse>> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody CourseOrderRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Course order updated", service.updateOrder(id, request)));
    }

    /** Admin — soft delete. */
    @DeleteMapping("/api/admin/courses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Modules ───────────────────────────────────────────────────────────────

    /** Public — syllabus accordion for a course page. */
    @GetMapping("/api/courses/{id}/modules")
    public ResponseEntity<ApiResponse<List<CourseModuleResponse>>> listModules(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Modules retrieved successfully", service.listModules(id)));
    }

    @PostMapping("/api/admin/courses/{id}/modules")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CourseModuleResponse>> createModule(
            @PathVariable Long id,
            @Valid @RequestBody CourseModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Module created successfully", service.createModule(id, request)));
    }

    @PutMapping("/api/admin/modules/{moduleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<CourseModuleResponse>> updateModule(
            @PathVariable Long moduleId,
            @Valid @RequestBody CourseModuleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Module updated successfully", service.updateModule(moduleId, request)));
    }

    @DeleteMapping("/api/admin/modules/{moduleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteModule(@PathVariable Long moduleId) {
        service.deleteModule(moduleId);
        return ResponseEntity.noContent().build();
    }

    // ── Testimonials ──────────────────────────────────────────────────────────

    /** Public — testimonial carousel for a course page. */
    @GetMapping("/api/courses/{id}/testimonials")
    public ResponseEntity<ApiResponse<List<TestimonialResponse>>> listTestimonials(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Testimonials retrieved successfully", service.listTestimonials(id)));
    }

    @PostMapping("/api/admin/courses/{id}/testimonials")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TestimonialResponse>> createTestimonial(
            @PathVariable Long id,
            @Valid @RequestBody TestimonialRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Testimonial created successfully", service.createTestimonial(id, request)));
    }

    @PutMapping("/api/admin/testimonials/{testimonialId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TestimonialResponse>> updateTestimonial(
            @PathVariable Long testimonialId,
            @Valid @RequestBody TestimonialRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Testimonial updated successfully", service.updateTestimonial(testimonialId, request)));
    }

    @DeleteMapping("/api/admin/testimonials/{testimonialId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteTestimonial(@PathVariable Long testimonialId) {
        service.deleteTestimonial(testimonialId);
        return ResponseEntity.noContent().build();
    }
}
