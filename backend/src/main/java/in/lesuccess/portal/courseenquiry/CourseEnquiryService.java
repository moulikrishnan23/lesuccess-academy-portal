package in.lesuccess.portal.courseenquiry;

import in.lesuccess.portal.course.Course;
import in.lesuccess.portal.course.CourseRepository;
import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.shared.support.LeadCaptureSupport;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Capture and admin listing for the global "Course Enquiry" modal.
 *
 * <p>Applies the same three public-form protections as Contact and Lead —
 * honeypot, duplicate window, sanitisation — through the shared
 * {@link LeadCaptureSupport}, so a third form cannot drift into a third set of
 * rules.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CourseEnquiryService {

    private final CourseEnquiryRepository repository;
    private final CourseRepository courseRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * The same externalised window Contact and Lead use, so all three forms
     * behave alike. The {@code = 5} initialiser is load-bearing for
     * Mockito-constructed instances in the unit tests — see the identical note on
     * {@code ContactService}.
     */
    @Value("${lesuccess.lead-capture.duplicate-window-minutes:5}")
    private int duplicateWindowMinutes = 5;

    @Transactional
    public CourseEnquirySubmitResult create(CourseEnquiryRequest request, String ipAddress) {
        if (LeadCaptureSupport.isHoneypotTriggered(request.getWebsite(), ipAddress)) {
            return CourseEnquirySubmitResult.honeypot();
        }

        Long courseId = resolveCourseId(request.getCourseId());
        String cleanMobile = LeadCaptureSupport.normalizeMobile(request.getMobile());

        Optional<CourseEnquiry> existingDuplicate = repository.findRecentDuplicate(
                cleanMobile,
                LeadCaptureSupport.duplicateWindowStart(duplicateWindowMinutes));

        if (existingDuplicate.isPresent()) {
            log.info("Duplicate course enquiry detected from IP: {} for mobile ending {}",
                    ipAddress, tail(cleanMobile));
            return CourseEnquirySubmitResult.success(
                    CourseEnquiryResponse.from(existingDuplicate.get()));
        }

        CourseEnquiry entity = CourseEnquiry.builder()
                .name(LeadCaptureSupport.sanitizeText(request.getName().trim()))
                .mobile(cleanMobile)
                .email(trimOrNull(request.getEmail()))
                .location(LeadCaptureSupport.sanitizeText(trimOrNull(request.getLocation())))
                .courseId(courseId)
                .currentStatus(LeadCaptureSupport.sanitizeText(trimOrNull(request.getCurrentStatus())))
                .ipAddress(ipAddress)
                .build();

        CourseEnquiry saved = repository.save(entity);
        log.info("Course enquiry created: id={}, courseId={}", saved.getId(), saved.getCourseId());

        eventPublisher.publishEvent(new CourseEnquiryCreatedEvent(this, saved));

        return CourseEnquirySubmitResult.success(CourseEnquiryResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public PageResponse<CourseEnquiryResponse> list(Long courseId, String search, Pageable pageable) {
        Page<CourseEnquiry> page;

        // Normalised once, to null when there is nothing to search on. The previous
        // shape carried the guard in a separate boolean, which trimmed twice and
        // left the null analysis unable to see that the flag implied search != null
        // — two "potential null pointer access" warnings on correct code.
        String term = (search != null && !search.isBlank()) ? search.trim() : null;

        if (courseId != null && term != null) {
            page = repository.searchByNameEmailOrMobileAndCourseId(term, courseId, pageable);
        } else if (courseId != null) {
            page = repository.findByCourseId(courseId, pageable);
        } else if (term != null) {
            page = repository.searchByNameEmailOrMobile(term, pageable);
        } else {
            page = repository.findAll(pageable);
        }

        return PageResponse.from(page.map(CourseEnquiryResponse::from));
    }

    /**
     * An optional course id must name a course a visitor could actually have
     * picked from the dropdown.
     *
     * <p><strong>"Published" here means {@code Course.isActive}.</strong> There is
     * no PUBLISHED/DRAFT status on {@code Course} — that pairing exists on
     * {@code ServiceOffering} as {@code ServiceStatus}. {@code is_active} is the
     * flag {@code findByIsActiveTrueOrderByDisplayOrderAsc} uses to build the
     * public catalogue the modal's dropdown renders, so it is the same notion of
     * published, under the name this table actually has.</p>
     *
     * <p>Rejected with a 400 field error rather than silently nulled: a dropdown
     * offering a course the API then drops would look like it worked while losing
     * the one piece of routing information the counsellor needs.</p>
     */
    private Long resolveCourseId(Long courseId) {
        if (courseId == null) {
            return null;
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> courseRejected(courseId, "does not exist"));

        if (!course.isActive()) {
            throw courseRejected(courseId, "is not published");
        }

        return course.getId();
    }

    private static InvalidRequestException courseRejected(Long courseId, String why) {
        return new InvalidRequestException("Validation failed", List.of(
                InvalidRequestException.fieldError("courseId", "Course " + courseId + " " + why)));
    }

    /** Last four digits only — a full mobile number does not belong in the logs. */
    private static String tail(String mobile) {
        return mobile == null || mobile.length() < 4 ? "????" : mobile.substring(mobile.length() - 4);
    }

    private static String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /** Mirrors ContactService.ContactSubmitResult so all three controllers read alike. */
    public record CourseEnquirySubmitResult(boolean isHoneypot, CourseEnquiryResponse response) {
        public static CourseEnquirySubmitResult honeypot() {
            return new CourseEnquirySubmitResult(true, null);
        }

        public static CourseEnquirySubmitResult success(CourseEnquiryResponse response) {
            return new CourseEnquirySubmitResult(false, response);
        }
    }
}
