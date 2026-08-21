package in.lesuccess.portal.contact;

import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

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

    private static final int DUPLICATE_WINDOW_MINUTES = 5;

    @Transactional
    public ContactSubmitResult createContactMessage(ContactMessageRequest request, String ipAddress) {
        if (request.getWebsite() != null && !request.getWebsite().isBlank()) {
            log.warn("Honeypot triggered from IP: {}. Honeypot value: '{}'", ipAddress, request.getWebsite());
            return ContactSubmitResult.honeypot();
        }

        String cleanPhone = request.getPhone().replaceAll("\\s+", "");

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

        String sanitizedMessage = Jsoup.clean(request.getMessage(), Safelist.none());

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
