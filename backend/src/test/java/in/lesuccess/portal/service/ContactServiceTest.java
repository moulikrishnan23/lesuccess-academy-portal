package in.lesuccess.portal.service;

import in.lesuccess.portal.contact.ContactMessageRequest;
import in.lesuccess.portal.contact.ContactMessageCreatedEvent;
import in.lesuccess.portal.contact.ContactMessageStatusUpdatedEvent;
import in.lesuccess.portal.contact.ContactMessage;
import in.lesuccess.portal.contact.ContactMessageStatus;
import in.lesuccess.portal.contact.ContactMessageRepository;
import in.lesuccess.portal.contact.ContactService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactMessageRepository repository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ContactService contactService;

    private ContactMessageRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = ContactMessageRequest.builder()
                .name("Ravi Kumar")
                .email("ravi@example.com")
                .phone("+919876543210")
                .whoYouAre("Student")
                .lookingFor("UPSC Coaching")
                .location("Chennai")
                .message("I want to learn more about your courses.")
                .website("")  // empty honeypot
                .build();
    }

    @Nested
    @DisplayName("Honeypot handling")
    class HoneypotTests {

        @Test
        @DisplayName("Non-empty honeypot → silent success, no DB write")
        void honeypotFilled_shouldReturnSuccessWithoutPersisting() {
            validRequest.setWebsite("http://spam-link.com");

            ContactService.ContactSubmitResult result =
                    contactService.createContactMessage(validRequest, "1.2.3.4");

            assertThat(result.isHoneypot()).isTrue();
            assertThat(result.response()).isNull();
            verifyNoInteractions(repository);
            verifyNoInteractions(eventPublisher);
        }

        @Test
        @DisplayName("Blank honeypot → proceeds normally")
        void honeypotBlank_shouldProceed() {
            validRequest.setWebsite("   ");

            ContactMessage saved = buildSavedEntity(1L);
            when(repository.findRecentDuplicate(anyString(), anyString(), anyString(), any()))
                    .thenReturn(Optional.empty());
            when(repository.save(any())).thenReturn(saved);

            ContactService.ContactSubmitResult result =
                    contactService.createContactMessage(validRequest, "1.2.3.4");

            // Whitespace-only honeypot passes isBlank() → proceeds as legitimate
            assertThat(result.isHoneypot()).isFalse();
            verify(repository).save(any());
        }

        @Test
        @DisplayName("Null honeypot → proceeds normally")
        void honeypotNull_shouldProceed() {
            validRequest.setWebsite(null);

            ContactMessage saved = buildSavedEntity(1L);
            when(repository.findRecentDuplicate(anyString(), anyString(), anyString(), any()))
                    .thenReturn(Optional.empty());
            when(repository.save(any())).thenReturn(saved);

            ContactService.ContactSubmitResult result =
                    contactService.createContactMessage(validRequest, "1.2.3.4");

            assertThat(result.isHoneypot()).isFalse();
            verify(repository).save(any());
        }
    }

    @Nested
    @DisplayName("Duplicate detection")
    class DuplicateTests {

        @Test
        @DisplayName("Duplicate within 5-min window → returns existing record, no new save")
        void duplicateWithinWindow_shouldReturnExisting() {
            validRequest.setWebsite(null);
            ContactMessage existing = buildSavedEntity(42L);

            when(repository.findRecentDuplicate(anyString(), anyString(), anyString(), any()))
                    .thenReturn(Optional.of(existing));

            ContactService.ContactSubmitResult result =
                    contactService.createContactMessage(validRequest, "1.2.3.4");

            assertThat(result.isHoneypot()).isFalse();
            assertThat(result.response().getId()).isEqualTo(42L);
            verify(repository, never()).save(any());
            verifyNoInteractions(eventPublisher);
        }

        @Test
        @DisplayName("No duplicate → persists new record")
        void noDuplicate_shouldPersist() {
            validRequest.setWebsite(null);
            ContactMessage saved = buildSavedEntity(1L);

            when(repository.findRecentDuplicate(anyString(), anyString(), anyString(), any()))
                    .thenReturn(Optional.empty());
            when(repository.save(any())).thenReturn(saved);

            ContactService.ContactSubmitResult result =
                    contactService.createContactMessage(validRequest, "1.2.3.4");

            assertThat(result.isHoneypot()).isFalse();
            assertThat(result.response().getId()).isEqualTo(1L);
            verify(repository).save(any());
        }
    }

    @Nested
    @DisplayName("Message sanitization")
    class SanitizationTests {

        @Test
        @DisplayName("HTML in message is stripped before persistence")
        void htmlInMessage_shouldBeStripped() {
            validRequest.setWebsite(null);
            validRequest.setMessage("<script>alert('xss')</script>Hello <b>world</b>");

            ContactMessage saved = buildSavedEntity(1L);
            when(repository.findRecentDuplicate(anyString(), anyString(), anyString(), any()))
                    .thenReturn(Optional.empty());
            when(repository.save(any())).thenReturn(saved);

            contactService.createContactMessage(validRequest, "1.2.3.4");

            ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
            verify(repository).save(captor.capture());
            // Jsoup.clean with Safelist.none() strips all tags
            assertThat(captor.getValue().getMessage()).doesNotContain("<script>", "<b>", "</b>");
            assertThat(captor.getValue().getMessage()).contains("Hello", "world");
        }
    }

    @Nested
    @DisplayName("Optional fields")
    class OptionalFieldTests {

        /**
         * whoYouAre, lookingFor, location and message stopped being @NotBlank so
         * the API's required set matches what the Contact page actually enforces.
         * That makes them reachable as null here for the first time — and the
         * service used to call .trim() on each one unguarded, relying on bean
         * validation to have rejected null before it ever got this far. Their
         * columns are still NOT NULL, so an omitted field has to land as "" and
         * not as a null that fails at insert time.
         */
        @Test
        @DisplayName("Null optional fields are stored as empty strings, not nulls")
        void nullOptionalFields_shouldBeStoredAsEmptyStrings() {
            validRequest.setWebsite(null);
            validRequest.setWhoYouAre(null);
            validRequest.setLookingFor(null);
            validRequest.setLocation(null);
            validRequest.setMessage(null);

            when(repository.findRecentDuplicate(anyString(), anyString(), anyString(), any()))
                    .thenReturn(Optional.empty());
            when(repository.save(any())).thenReturn(buildSavedEntity(1L));

            contactService.createContactMessage(validRequest, "1.2.3.4");

            ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
            verify(repository).save(captor.capture());
            ContactMessage entity = captor.getValue();
            assertThat(entity.getWhoYouAre()).isEmpty();
            assertThat(entity.getLookingFor()).isEmpty();
            assertThat(entity.getLocation()).isEmpty();
            assertThat(entity.getMessage()).isEmpty();
            // The required three still arrive intact.
            assertThat(entity.getName()).isEqualTo("Ravi Kumar");
            assertThat(entity.getEmail()).isEqualTo("ravi@example.com");
            assertThat(entity.getPhone()).isEqualTo("+919876543210");
        }
    }

    @Nested
    @DisplayName("Event publishing")
    class EventTests {

        @Test
        @DisplayName("Successful create → publishes ContactMessageCreatedEvent")
        void successfulCreate_shouldPublishEvent() {
            validRequest.setWebsite(null);
            ContactMessage saved = buildSavedEntity(1L);

            when(repository.findRecentDuplicate(anyString(), anyString(), anyString(), any()))
                    .thenReturn(Optional.empty());
            when(repository.save(any())).thenReturn(saved);

            contactService.createContactMessage(validRequest, "1.2.3.4");

            ArgumentCaptor<ContactMessageCreatedEvent> eventCaptor =
                    ArgumentCaptor.forClass(ContactMessageCreatedEvent.class);
            verify(eventPublisher).publishEvent(eventCaptor.capture());
            assertThat(eventCaptor.getValue().getContactMessage().getId()).isEqualTo(1L);
        }
    }

    @Nested
    @DisplayName("Status update")
    class StatusUpdateTests {

        @Test
        @DisplayName("Valid status update → updates and publishes event")
        void validStatusUpdate_shouldUpdateAndPublish() {
            ContactMessage entity = buildSavedEntity(1L);
            entity.setStatus(ContactMessageStatus.NEW);

            when(repository.findById(1L)).thenReturn(Optional.of(entity));
            // saveAndFlush, not save: updateStatus flushes so the status is visible to
            // the AFTER_COMMIT Sheets listener. Stubbing save() left saveAndFlush()
            // unstubbed, returning null, and the test NPE'd on the response mapping.
            when(repository.saveAndFlush(any())).thenReturn(entity);

            contactService.updateStatus(1L, ContactMessageStatus.IN_PROGRESS);

            verify(repository).saveAndFlush(any());
            verify(eventPublisher).publishEvent(any(ContactMessageStatusUpdatedEvent.class));
        }
    }

    @Nested
    @DisplayName("Soft delete")
    class SoftDeleteTests {

        @Test
        @DisplayName("Soft delete → sets deletedAt timestamp")
        void softDelete_shouldSetDeletedAt() {
            ContactMessage entity = buildSavedEntity(1L);
            assertThat(entity.getDeletedAt()).isNull();

            when(repository.findById(1L)).thenReturn(Optional.of(entity));
            when(repository.save(any())).thenReturn(entity);

            contactService.softDelete(1L);

            ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
            verify(repository).save(captor.capture());
            assertThat(captor.getValue().getDeletedAt()).isNotNull();
        }
    }

    // NOTE: the former "phone whitespace stripping" test lived here and passed by
    // calling the service directly, bypassing Bean Validation. It certified a path
    // unreachable over HTTP — @Pattern rejects a spaced number with 400 long before
    // the service runs. Normalisation now happens in ContactMessageRequest#setPhone
    // at binding time, and is proven end-to-end by
    // ContactControllerTest.CreateTests#phoneWithSpaces_shouldBeAcceptedAndStripped.

    // --- Helpers ---

    private ContactMessage buildSavedEntity(Long id) {
        return ContactMessage.builder()
                .id(id)
                .name("Ravi Kumar")
                .email("ravi@example.com")
                .phone("+919876543210")
                .whoYouAre("Student")
                .lookingFor("UPSC Coaching")
                .location("Chennai")
                .message("I want to learn more about your courses.")
                .status(ContactMessageStatus.NEW)
                .ipAddress("1.2.3.4")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
