package in.lesuccess.portal.connectwithus;

import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.support.LeadCaptureSupport;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Capture and admin listing for the Home page "Connect with Us" form.
 *
 * <p>Applies the same three public-form protections as Contact, Lead and Course
 * Enquiry — honeypot, duplicate window, sanitisation — through the shared
 * {@link LeadCaptureSupport}, so a fourth form cannot drift into a fourth set of
 * rules. There is no course-id resolution step here: the form has no course
 * field.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConnectWithUsService {

    private final ConnectWithUsRepository repository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * The same externalised window every other capture form uses. The {@code = 5}
     * initialiser is load-bearing for Mockito-constructed instances in the unit
     * tests — see the identical note on {@code ContactService}.
     */
    @Value("${lesuccess.lead-capture.duplicate-window-minutes:5}")
    private int duplicateWindowMinutes = 5;

    @Transactional
    public ConnectWithUsSubmitResult create(ConnectWithUsRequest request, String ipAddress) {
        if (LeadCaptureSupport.isHoneypotTriggered(request.getWebsite(), ipAddress)) {
            return ConnectWithUsSubmitResult.honeypot();
        }

        String cleanMobile = LeadCaptureSupport.normalizeMobile(request.getMobile());

        Optional<ConnectWithUs> existingDuplicate = repository.findRecentDuplicate(
                cleanMobile,
                LeadCaptureSupport.duplicateWindowStart(duplicateWindowMinutes));

        if (existingDuplicate.isPresent()) {
            log.info("Duplicate connect-with-us submission from IP: {} for mobile ending {}",
                    ipAddress, tail(cleanMobile));
            return ConnectWithUsSubmitResult.success(
                    ConnectWithUsResponse.from(existingDuplicate.get()));
        }

        ConnectWithUs entity = ConnectWithUs.builder()
                .name(LeadCaptureSupport.sanitizeText(request.getName().trim()))
                .mobile(cleanMobile)
                .email(trimOrNull(request.getEmail()))
                .ipAddress(ipAddress)
                .build();

        ConnectWithUs saved = repository.save(entity);
        log.info("Connect-with-us submission created: id={}", saved.getId());

        eventPublisher.publishEvent(new ConnectWithUsCreatedEvent(this, saved));

        return ConnectWithUsSubmitResult.success(ConnectWithUsResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public PageResponse<ConnectWithUsResponse> list(String search, Pageable pageable) {
        // Normalised once, to null when there is nothing to search on — see the
        // note on CourseEnquiryService.list for why the guard is not a boolean.
        String term = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<ConnectWithUs> page = (term != null)
                ? repository.searchByNameEmailOrMobile(term, pageable)
                : repository.findAll(pageable);

        return PageResponse.from(page.map(ConnectWithUsResponse::from));
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

    /** Mirrors CourseEnquiryService.CourseEnquirySubmitResult so the controllers read alike. */
    public record ConnectWithUsSubmitResult(boolean isHoneypot, ConnectWithUsResponse response) {
        public static ConnectWithUsSubmitResult honeypot() {
            return new ConnectWithUsSubmitResult(true, null);
        }

        public static ConnectWithUsSubmitResult success(ConnectWithUsResponse response) {
            return new ConnectWithUsSubmitResult(false, response);
        }
    }
}
