package in.lesuccess.portal.lead;

import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
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
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository repository;
    private final ApplicationEventPublisher eventPublisher;

    /** Same externalised window ContactService uses, so both forms behave alike. */
    @Value("${lesuccess.lead-capture.duplicate-window-minutes:5}")
    private int duplicateWindowMinutes = 5;

    /**
     * Which sources this endpoint currently accepts over HTTP.
     *
     * <p><strong>Deliberately narrowed for now.</strong> All four
     * {@link LeadSource} values exist in the schema, but only
     * {@code SERVICE_CTA_FORM} is accepted by default, because the Service page
     * CTA is the only form wired to this endpoint in this phase. Accepting a
     * source no form sends would mean shipping an unvalidated, unmonitored write
     * path ahead of the feature that uses it.</p>
     *
     * <p><strong>To whoever builds Home or Course lead capture next:</strong> you
     * do not need to change this class. Add the value to
     * {@code lesuccess.leads.accepted-sources} in {@code application.yml} — the
     * list is config-driven precisely so relaxing it is a one-line change rather
     * than a code edit and redeploy.</p>
     *
     * <p>Note the frontend already ships an enrolment form posting
     * {@code COURSE_ENROLL_FORM} (see {@code frontend/src/services/leadApi.js}),
     * so that value very likely needs enabling as soon as that page goes live.</p>
     */
    @Value("${lesuccess.leads.accepted-sources:SERVICE_CTA_FORM}")
    private List<LeadSource> acceptedSources = List.of(LeadSource.SERVICE_CTA_FORM);

    /**
     * Capture a lead from a public form.
     *
     * <p>Applies the same three protections as Contact — honeypot, duplicate
     * window, sanitisation — via the shared {@link LeadCaptureSupport}, so the
     * two forms cannot drift apart.</p>
     */
    @Transactional
    public LeadSubmitResult createLead(LeadRequest request, String ipAddress) {
        if (LeadCaptureSupport.isHoneypotTriggered(request.getWebsite(), ipAddress)) {
            return LeadSubmitResult.honeypot();
        }

        assertSourceAccepted(request.getSource());
        assertMobilePresentWhereRequired(request);

        String cleanMobile = LeadCaptureSupport.normalizeMobile(request.getMobile());

        /*
         * Duplicate detection is keyed on mobile, and SQL equality against NULL
         * is never true — so for a lead with no mobile the query can only miss.
         * Skipping it is the same outcome without the round trip, and says so.
         *
         * The cost is that mobile-less sources (the Service CTA) have no
         * duplicate protection: a double-clicked submit creates two rows. The
         * honeypot and the per-IP rate limit still apply. Revisit by keying on
         * (email, source) when mobile is absent, if that turns out to matter.
         */
        if (cleanMobile != null) {
            Optional<Lead> existingDuplicate = repository.findRecentDuplicate(
                    cleanMobile,
                    request.getSource(),
                    LeadCaptureSupport.duplicateWindowStart(duplicateWindowMinutes));

            if (existingDuplicate.isPresent()) {
                log.info("Duplicate lead submission detected from IP: {} for source: {}",
                        ipAddress, request.getSource());
                return LeadSubmitResult.success(LeadResponse.from(existingDuplicate.get()));
            }
        }

        Lead entity = Lead.builder()
                .name(LeadCaptureSupport.sanitizeText(request.getName().trim()))
                .mobile(cleanMobile)
                .email(request.getEmail() == null ? null : request.getEmail().trim())
                .courseId(request.getCourseId())
                .lookingFor(LeadCaptureSupport.sanitizeText(trimOrNull(request.getLookingFor())))
                .source(request.getSource())
                .status(LeadStatus.NEW)
                .ipAddress(ipAddress)
                .build();

        Lead saved = repository.save(entity);
        log.info("Lead created: id={}, source={}", saved.getId(), saved.getSource());

        eventPublisher.publishEvent(new LeadCreatedEvent(this, saved));

        return LeadSubmitResult.success(LeadResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public PageResponse<LeadResponse> listLeads(LeadStatus status, LeadSource source, Pageable pageable) {
        Page<Lead> page;

        if (status != null && source != null) {
            page = repository.findByStatusAndSource(status, source, pageable);
        } else if (status != null) {
            page = repository.findByStatus(status, pageable);
        } else if (source != null) {
            page = repository.findBySource(source, pageable);
        } else {
            page = repository.findAll(pageable);
        }

        return PageResponse.from(page.map(LeadResponse::from));
    }

    @Transactional
    public LeadResponse updateStatus(Long id, LeadStatus newStatus) {
        Lead entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead", id));

        entity.setStatus(newStatus);
        Lead saved = repository.saveAndFlush(entity);

        log.info("Lead status updated: id={}, newStatus={}", id, newStatus);
        eventPublisher.publishEvent(new LeadStatusUpdatedEvent(this, id, newStatus));

        return LeadResponse.from(saved);
    }

    /**
     * Rejected with 400 rather than silently ignored: a form posting a source the
     * backend drops on the floor would look like a working integration while
     * losing every lead.
     */
    /**
     * Sources that cannot be actioned without a phone number.
     *
     * <p>This is not on {@code LeadRequest.mobile} as a {@code @NotBlank}
     * because the requirement is per-source: the course enrolment form exists to
     * get someone a call back, while the Service page CTA asks only for a name,
     * an email and a subject. A field-level annotation cannot see the source, so
     * enforcing it there made the Service form unsubmittable.</p>
     */
    private static final Set<LeadSource> MOBILE_REQUIRED_SOURCES =
            Set.of(LeadSource.COURSE_ENROLL_FORM);

    /**
     * Rejected as a field error on {@code mobile}, so it lands on the same input
     * a {@code @NotBlank} would have — the form maps {@code fieldErrors} straight
     * onto its controls and cannot tell the two apart.
     */
    private void assertMobilePresentWhereRequired(LeadRequest request) {
        if (MOBILE_REQUIRED_SOURCES.contains(request.getSource())
                && request.getMobile() == null) {
            throw new InvalidRequestException("Validation failed", List.of(
                    InvalidRequestException.fieldError("mobile", "Mobile number is required")));
        }
    }

    private void assertSourceAccepted(LeadSource source) {
        if (!Set.copyOf(acceptedSources).contains(source)) {
            throw new InvalidRequestException("Validation failed", List.of(
                    InvalidRequestException.fieldError("source",
                            "Lead source " + source + " is not currently accepted")));
        }
    }

    private static String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /** Mirrors ContactService.ContactSubmitResult so both controllers read alike. */
    public record LeadSubmitResult(boolean isHoneypot, LeadResponse response) {
        public static LeadSubmitResult honeypot() {
            return new LeadSubmitResult(true, null);
        }

        public static LeadSubmitResult success(LeadResponse response) {
            return new LeadSubmitResult(false, response);
        }
    }
}
