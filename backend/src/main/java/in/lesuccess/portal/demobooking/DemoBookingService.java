package in.lesuccess.portal.demobooking;

import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
import in.lesuccess.portal.shared.support.LeadCaptureSupport;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemoBookingService {

    private final DemoBookingRepository repository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    /**
     * The same externalised window Contact, Lead and CourseEnquiry use, so all
     * four public forms behave alike.
     *
     * <p>The {@code = 5} initialiser is load-bearing, not decoration: this is a
     * field rather than a constructor argument precisely so that
     * Mockito-constructed instances in DemoBookingServiceTest keep the original
     * five-minute behaviour, while Spring overrides it from configuration at
     * runtime. Widening the constructor instead would have broken those tests.</p>
     */
    @Value("${lesuccess.lead-capture.duplicate-window-minutes:5}")
    private int duplicateWindowMinutes = 5;

    /**
     * Capture a demo booking from the public home-page form.
     *
     * <p>Applies the same three protections as the other three public forms —
     * honeypot, duplicate window, sanitisation — via the shared
     * {@link LeadCaptureSupport}. This endpoint previously had none of them: it
     * was an unauthenticated, unthrottled POST straight to
     * {@code repository.save()}.</p>
     */
    @Transactional
    public DemoBookingSubmitResult create(DemoBookingRequest request, String ipAddress) {
        if (LeadCaptureSupport.isHoneypotTriggered(request.getWebsite(), ipAddress)) {
            return DemoBookingSubmitResult.honeypot();
        }

        /*
         * Normalised here as well as in DemoBookingRequest#getMobileNumber, which
         * already strips whitespace. Not redundant belt-and-braces: the duplicate
         * query below matches on exact string equality, so it has to key on the
         * same normalised form the other three services use. Relying on the DTO
         * accessor alone would make this method's correctness depend on a caller
         * it does not control — a service-level call with a hand-built request
         * would silently miss every duplicate.
         */
        String cleanMobile = LeadCaptureSupport.normalizeMobile(request.getMobileNumber());

        Optional<DemoBooking> existingDuplicate = repository.findRecentDuplicate(
                cleanMobile,
                LeadCaptureSupport.duplicateWindowStart(duplicateWindowMinutes));

        if (existingDuplicate.isPresent()) {
            log.info("Duplicate demo booking detected from IP: {} for mobile ending {}",
                    ipAddress, tail(cleanMobile));
            return DemoBookingSubmitResult.success(DemoBookingResponse.from(existingDuplicate.get()));
        }

        DemoBooking entity = DemoBooking.builder()
                .name(LeadCaptureSupport.sanitizeText(trimOrNull(request.getName())))
                .email(LeadCaptureSupport.sanitizeText(trimOrNull(request.getEmail())))
                .courseName(LeadCaptureSupport.sanitizeText(trimOrNull(request.getCourseName())))
                .mobileNumber(cleanMobile)
                .ipAddress(ipAddress)
                .status(DemoBookingStatus.PENDING)
                .build();

        DemoBooking saved = repository.save(entity);
        log.info("Demo booking created: id={}, mobile ending {}", saved.getId(), tail(cleanMobile));
        eventPublisher.publishEvent(new DemoBookingCreatedEvent(this, saved));

        return DemoBookingSubmitResult.success(DemoBookingResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public PageResponse<DemoBookingResponse> listAll(DemoBookingStatus status, Pageable pageable) {
        Page<DemoBooking> page = status != null
                ? repository.findByStatus(status, pageable)
                : repository.findAll(pageable);

        return PageResponse.from(page.map(DemoBookingResponse::from));
    }

    @Transactional(readOnly = true)
    public DemoBookingResponse getById(Long id) {
        return DemoBookingResponse.from(findOrThrow(id));
    }

    @Transactional
    public DemoBookingResponse updateStatus(Long id, DemoBookingStatusUpdateRequest request) {
        DemoBooking entity = findOrThrow(id);
        entity.setStatus(request.getStatus());

        DemoBooking saved = repository.saveAndFlush(entity);
        log.info("Demo booking status updated: id={}, status={}", id, request.getStatus());
        eventPublisher.publishEvent(new DemoBookingStatusUpdatedEvent(this, id, request.getStatus()));
        return DemoBookingResponse.from(saved);
    }

    private DemoBooking findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo booking", id));
    }

    /**
     * Last four digits only. The previous log line printed the whole number on
     * every submission; a mobile number is the only personal data this table
     * holds, and it does not belong in the application log.
     */
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

    /** Mirrors ContactService.ContactSubmitResult so all four controllers read alike. */
    public record DemoBookingSubmitResult(boolean isHoneypot, DemoBookingResponse response) {
        public static DemoBookingSubmitResult honeypot() {
            return new DemoBookingSubmitResult(true, null);
        }

        public static DemoBookingSubmitResult success(DemoBookingResponse response) {
            return new DemoBookingSubmitResult(false, response);
        }
    }
}
