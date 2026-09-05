package in.lesuccess.portal.contact;

import in.lesuccess.portal.shared.dto.PageResponse;
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

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository repository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Externalised from a hardcoded constant so it can be tuned per environment.
     *
     * <p>The {@code = 5} initialiser is load-bearing, not decoration: this is a
     * field rather than a constructor argument precisely so that
     * Mockito-constructed instances in ContactServiceTest keep the original
     * five-minute behaviour, while Spring overrides it from configuration at
     * runtime. Widening the constructor instead would have broken those tests.</p>
     */
    @Value("${lesuccess.lead-capture.duplicate-window-minutes:5}")
    private int duplicateWindowMinutes = 5;

    @Transactional
    public ContactSubmitResult createContactMessage(ContactMessageRequest request, String ipAddress) {
        if (LeadCaptureSupport.isHoneypotTriggered(request.getWebsite(), ipAddress)) {
            return ContactSubmitResult.honeypot();
        }

        String cleanPhone = LeadCaptureSupport.normalizeMobile(request.getPhone());

        Optional<ContactMessage> existingDuplicate = repository.findRecentDuplicate(
                request.getEmail().trim(),
                cleanPhone,
                trimToEmpty(request.getMessage()),
                LeadCaptureSupport.duplicateWindowStart(duplicateWindowMinutes)
        );

        if (existingDuplicate.isPresent()) {
            log.info("Duplicate submission detected from IP: {} for email: {}", ipAddress, request.getEmail());
            return ContactSubmitResult.success(ContactMessageResponse.from(existingDuplicate.get()));
        }

        String sanitizedMessage = trimToEmpty(LeadCaptureSupport.sanitizeText(request.getMessage()));

        ContactMessage entity = ContactMessage.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim())
                .phone(cleanPhone)
                .whoYouAre(trimToEmpty(request.getWhoYouAre()))
                .lookingFor(trimToEmpty(request.getLookingFor()))
                .location(trimToEmpty(request.getLocation()))
                .message(sanitizedMessage)
                .status(ContactMessageStatus.NEW)
                .ipAddress(ipAddress)
                .build();

        ContactMessage saved = repository.save(entity);
        log.info("Contact message created: id={}, email={}", saved.getId(), saved.getEmail());

        eventPublisher.publishEvent(new ContactMessageCreatedEvent(this, saved));

        return ContactSubmitResult.success(ContactMessageResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactMessageResponse> listContactMessages(
            ContactMessageStatus status, String search, Pageable pageable) {

        Page<ContactMessage> page;

        if (status != null && search != null && !search.isBlank()) {
            page = repository.searchByNameOrEmailAndStatus(search.trim(), status, pageable);
        } else if (status != null) {
            page = repository.findByStatus(status, pageable);
        } else if (search != null && !search.isBlank()) {
            page = repository.searchByNameOrEmail(search.trim(), pageable);
        } else {
            page = repository.findAll(pageable);
        }

        return PageResponse.from(page.map(ContactMessageResponse::from));
    }

    @Transactional(readOnly = true)
    public ContactMessageResponse getContactMessage(Long id) {
        return ContactMessageResponse.from(findOrThrow(id));
    }

    @Transactional
    public ContactMessageResponse updateStatus(Long id, ContactMessageStatus newStatus) {
        ContactMessage entity = findOrThrow(id);
        entity.setStatus(newStatus);
        ContactMessage saved = repository.saveAndFlush(entity);

        log.info("Contact message status updated: id={}, newStatus={}", id, newStatus);
        eventPublisher.publishEvent(new ContactMessageStatusUpdatedEvent(this, id, newStatus));

        return ContactMessageResponse.from(saved);
    }

    @Transactional
    public void softDelete(Long id) {
        ContactMessage entity = findOrThrow(id);
        entity.setDeletedAt(LocalDateTime.now());
        repository.save(entity);
        log.info("Contact message soft-deleted: id={}", id);
    }

    /**
     * Null- and blank-safe trim for the four optional fields.
     *
     * <p>They stopped being @NotBlank so the Contact page's own required set
     * (name, mobile, email) is the one the API enforces, which means they can
     * now arrive null. Their columns are still NOT NULL, so an omitted field is
     * stored as the empty string rather than propagating a null into the insert
     * — "the visitor left it blank" and "the visitor typed only spaces" are the
     * same fact, and both read as empty in the admin list and the synced sheet.</p>
     */
    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private ContactMessage findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message", id));
    }

    public record ContactSubmitResult(boolean isHoneypot, ContactMessageResponse response) {
        public static ContactSubmitResult honeypot() {
            return new ContactSubmitResult(true, null);
        }

        public static ContactSubmitResult success(ContactMessageResponse response) {
            return new ContactSubmitResult(false, response);
        }
    }
}
