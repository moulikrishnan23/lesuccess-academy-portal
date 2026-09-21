package in.lesuccess.portal.courseenquiry;

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
@RequestMapping("/api/course-enquiries")
@RequiredArgsConstructor
public class CourseEnquiryController {

    private final CourseEnquiryService service;

    /**
     * Public — rate-limited (the path is listed in
     * {@code lesuccess.rate-limit.protected-paths}, which is how
     * {@code RateLimitFilter} learns about a new public form), honeypot-protected
     * and duplicate-detected.
     *
     * <p>A honeypot hit returns exactly the same 201 and body shape as a genuine
     * submission, so a bot cannot tell that it was caught.</p>
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CourseEnquiryResponse>> create(
            @Valid @RequestBody CourseEnquiryRequest request,
            HttpServletRequest httpRequest) {

        CourseEnquiryService.CourseEnquirySubmitResult result =
                service.create(request, httpRequest.getRemoteAddr());

        String message = "Your enquiry has been received. Our counsellors will contact you shortly.";

        if (result.isHoneypot()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(message, result.response()));
    }

    /**
     * Admin — paginated, filterable by course and searchable by name/email/mobile.
     *
     * <p>{@code hasAnyRole('ADMIN', 'MANAGER')} rather than ADMIN alone, matching
     * every other lead-capture listing in the project: managers are the people who
     * actually work these enquiries, and a narrower rule here would make this the
     * one source they could not see.</p>
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<CourseEnquiryResponse>>> list(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(ApiResponse.success("Course enquiries retrieved successfully",
                service.list(courseId, search, pageable)));
    }
}
