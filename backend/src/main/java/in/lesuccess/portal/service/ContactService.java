package in.lesuccess.portal.service;


import in.lesuccess.portal.dto.ContactMessageRequest;
import in.lesuccess.portal.dto.ContactMessageResponse;
import in.lesuccess.portal.dto.PageResponse;
import in.lesuccess.portal.event.ContactMessageCreatedEvent;
import in.lesuccess.portal.event.ContactMessageStatusUpdatedEvent;
import in.lesuccess.portal.exception.ResourceNotFoundException;
import in.lesuccess.portal.model.ContactMessage;
import in.lesuccess.portal.model.ContactMessageStatus;
import in.lesuccess.portal.repository.ContactMessageRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
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

    /** Duration window for duplicate detection (minutes). */
    private static final int DUPLICATE_WINDOW_MINUTES = 5;

    /**
     * Processes a public contact form submission.
     *
     * @return the response DTO, or a "fake" success response if honeypot triggered
     *         or a duplicate was detected within the window.
     */
    @Transactional
    public ContactSubmitResult createContactMessage(ContactMessageRequest request, String ipAddress) {
        // 1. Honeypot check — silent discard, looks like success to the caller
        if (request.getWebsite() != null && !request.getWebsite().isBlank()) {
            log.warn("Honeypot triggered from IP: {}. Honeypot value: '{}'", ipAddress, request.getWebsite());
            return ContactSubmitResult.honeypot();
        }

        // 2. Strip whitespace from phone before any further processing
        String cleanPhone = request.getPhone().replaceAll("\\s+", "");

        // 3. Duplicate detection — same (email, phone, message) within 5 minutes
        Optional<ContactMessage> existingDuplicate = repository.findRecentDuplicate(
                request.getEmail().trim(),
                cleanPhone,
                request.getMessage().trim(),
                LocalDateTime.now().minusMinutes(DUPLICATE_WINDOW_MINUTES)
        );

        if (existingDuplicate.isPresent()) {
            log.info("Duplicate submission detected from IP: {} for email: {}", ipAddress, request.getEmail());
            return ContactSubmitResult.success(ContactMessageResponse.from(existingDuplicate.get()));
        }

        // 4. Sanitize message — strip all HTML tags (defense in depth)
        String sanitizedMessage = Jsoup.clean(request.getMessage(), Safelist.none());

        // 5. Build and persist entity
        ContactMessage entity = ContactMessage.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim())
                .phone(cleanPhone)
                .whoYouAre(request.getWhoYouAre().trim())
                .lookingFor(request.getLookingFor().trim())
                .location(request.getLocation().trim())
                .message(sanitizedMessage)
                .status(ContactMessageStatus.NEW)
                .ipAddress(ipAddress)
                .build();

        ContactMessage saved = repository.save(entity);
        log.info("Contact message created: id={}, email={}", saved.getId(), saved.getEmail());

        // 6. Publish event for async listeners (Sheets sync, etc.)
        eventPublisher.publishEvent(new ContactMessageCreatedEvent(this, saved));

        return ContactSubmitResult.success(ContactMessageResponse.from(saved));
    }

    /**
     * Paginated admin list — filterable by status, searchable by name/email.
     */
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

    /**
     * Get a single contact message by ID.
     */
    @Transactional(readOnly = true)
    public ContactMessageResponse getContactMessage(Long id) {
        ContactMessage entity = findOrThrow(id);
        return ContactMessageResponse.from(entity);
    }

    /**
     * Update the status of a contact message.
     */
    @Transactional
    public ContactMessageResponse updateStatus(Long id, ContactMessageStatus newStatus) {
        ContactMessage entity = findOrThrow(id);
        entity.setStatus(newStatus);
        // saveAndFlush, not save: @PreUpdate only fires when Hibernate flushes, which
        // otherwise happens at commit — after the response DTO has been built. That
        // made the returned updatedAt the *pre-update* timestamp while the database
        // held the correct one. Flushing here runs the callback before we read it.
        ContactMessage saved = repository.saveAndFlush(entity);

        log.info("Contact message status updated: id={}, newStatus={}", id, newStatus);
        eventPublisher.publishEvent(new ContactMessageStatusUpdatedEvent(this, id, newStatus));

        return ContactMessageResponse.from(saved);
    }

    /**
     * Soft-delete a contact message by setting deletedAt.
     */
    @Transactional
    public void softDelete(Long id) {
        ContactMessage entity = findOrThrow(id);
        entity.setDeletedAt(LocalDateTime.now());
        repository.save(entity);
        log.info("Contact message soft-deleted: id={}", id);
    }

    private ContactMessage findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message", id));
    }

    /**
     * Encapsulates the result of a contact submission attempt,
     * distinguishing between honeypot discard and genuine success.
     */
    public record ContactSubmitResult(boolean isHoneypot, ContactMessageResponse response) {
        public static ContactSubmitResult honeypot() {
            return new ContactSubmitResult(true, null);
        }

        public static ContactSubmitResult success(ContactMessageResponse response) {
            return new ContactSubmitResult(false, response);
        }
    }
}
