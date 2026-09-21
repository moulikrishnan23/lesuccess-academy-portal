package in.lesuccess.portal.service;

import in.lesuccess.portal.lead.Lead;
import in.lesuccess.portal.lead.LeadCreatedEvent;
import in.lesuccess.portal.lead.LeadRepository;
import in.lesuccess.portal.lead.LeadRequest;
import in.lesuccess.portal.lead.LeadService;
import in.lesuccess.portal.lead.LeadSource;
import in.lesuccess.portal.lead.LeadStatus;
import in.lesuccess.portal.lead.LeadStatusUpdatedEvent;
import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

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
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeadServiceTest {

    @Mock
    private LeadRepository repository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private LeadService leadService;

    private LeadRequest validRequest;

    @BeforeEach
    void setUp() {
        // @Value fields are not populated outside a Spring context; set the accepted
        // source list explicitly so these tests pin behaviour rather than a default.
        ReflectionTestUtils.setField(leadService, "acceptedSources",
                List.of(LeadSource.SERVICE_CTA_FORM));

        validRequest = LeadRequest.builder()
                .name("Ravi Kumar")
                .mobile("+919876543210")
                .email("ravi@example.com")
                .lookingFor("Corporate Training")
                .source(LeadSource.SERVICE_CTA_FORM)
                .website("")
                .build();
    }

    @Nested
    @DisplayName("Honeypot handling")
    class HoneypotTests {

        @Test
        @DisplayName("Filled honeypot -> silent success, no DB write, no event")
        void honeypotFilled_shouldNotPersist() {
            validRequest.setWebsite("http://spam-link.com");

            LeadService.LeadSubmitResult result = leadService.createLead(validRequest, "1.2.3.4");

            assertThat(result.isHoneypot()).isTrue();
            assertThat(result.response()).isNull();
            verifyNoInteractions(repository);
            verifyNoInteractions(eventPublisher);
        }

        @Test
        @DisplayName("Honeypot is checked before source validation, so bots learn nothing")
        void honeypotBeatsSourceValidation() {
            validRequest.setWebsite("http://spam-link.com");
            validRequest.setSource(LeadSource.HOME_DEMO_FORM); // would otherwise be rejected

            LeadService.LeadSubmitResult result = leadService.createLead(validRequest, "1.2.3.4");

            // A 400 here would tell a bot its honeypot value was the problem.
            assertThat(result.isHoneypot()).isTrue();
        }

        @Test
        @DisplayName("Whitespace-only honeypot -> proceeds normally")
        void honeypotBlank_shouldProceed() {
            validRequest.setWebsite("   ");
            stubNoDuplicateAndSave();

            assertThat(leadService.createLead(validRequest, "1.2.3.4").isHoneypot()).isFalse();
            verify(repository).save(any());
        }

        @Test
        @DisplayName("Null honeypot -> proceeds normally")
        void honeypotNull_shouldProceed() {
            validRequest.setWebsite(null);
            stubNoDuplicateAndSave();

            assertThat(leadService.createLead(validRequest, "1.2.3.4").isHoneypot()).isFalse();
            verify(repository).save(any());
        }
    }

    @Nested
    @DisplayName("Source validation")
    class SourceTests {

        @Test
        @DisplayName("SERVICE_CTA_FORM is accepted")
        void serviceCtaForm_shouldBeAccepted() {
            stubNoDuplicateAndSave();

            assertThat(leadService.createLead(validRequest, "1.2.3.4").response()).isNotNull();
        }

        @Test
        @DisplayName("A source whose form does not exist yet -> 400, nothing written")
        void unacceptedSource_shouldThrow() {
            validRequest.setSource(LeadSource.HOME_DEMO_FORM);

            assertThatThrownBy(() -> leadService.createLead(validRequest, "1.2.3.4"))
                    .isInstanceOf(InvalidRequestException.class)
                    .satisfies(ex -> assertThat(((InvalidRequestException) ex).getFieldErrors())
                            .extracting("field").containsExactly("source"));

            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("Relaxing the accepted list is pure config - no code change needed")
        void wideningAcceptedSources_shouldAdmitCourseEnrollForm() {
            // This is exactly what whoever ships the course enrolment form will do.
            ReflectionTestUtils.setField(leadService, "acceptedSources",
                    List.of(LeadSource.SERVICE_CTA_FORM, LeadSource.COURSE_ENROLL_FORM));
            validRequest.setSource(LeadSource.COURSE_ENROLL_FORM);
            validRequest.setCourseId(7L);
            stubNoDuplicateAndSave();

            assertThat(leadService.createLead(validRequest, "1.2.3.4").response()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Duplicate detection")
    class DuplicateTests {

        @Test
        @DisplayName("Duplicate within the window -> returns existing, no new row, no event")
        void duplicate_shouldReturnExisting() {
            Lead existing = buildEntity(42L);
            when(repository.findRecentDuplicate(anyString(), any(), any()))
                    .thenReturn(Optional.of(existing));

            LeadService.LeadSubmitResult result = leadService.createLead(validRequest, "1.2.3.4");

            assertThat(result.response().getId()).isEqualTo(42L);
            verify(repository, never()).save(any());
            verifyNoInteractions(eventPublisher);
        }

        @Test
        @DisplayName("Duplicate lookup uses the whitespace-stripped mobile")
        void duplicateLookup_shouldUseNormalizedMobile() {
            validRequest.setMobile("+91 98765 43210");
            stubNoDuplicateAndSave();

            leadService.createLead(validRequest, "1.2.3.4");

            verify(repository).findRecentDuplicate(
                    org.mockito.ArgumentMatchers.eq("+919876543210"),
                    org.mockito.ArgumentMatchers.eq(LeadSource.SERVICE_CTA_FORM),
                    any());
        }

        @Test
        @DisplayName("No duplicate -> persists and publishes LeadCreatedEvent")
        void noDuplicate_shouldPersistAndPublish() {
            stubNoDuplicateAndSave();

            leadService.createLead(validRequest, "1.2.3.4");

            verify(repository).save(any());
            ArgumentCaptor<LeadCreatedEvent> captor = ArgumentCaptor.forClass(LeadCreatedEvent.class);
            verify(eventPublisher).publishEvent(captor.capture());
            assertThat(captor.getValue().getLead().getId()).isEqualTo(1L);
        }
    }

    @Nested
    @DisplayName("Sanitization and normalization")
    class SanitizationTests {

        @Test
        @DisplayName("HTML in name and lookingFor is stripped before persistence")
        void htmlIsStripped() {
            validRequest.setName("<script>alert('x')</script>Ravi");
            validRequest.setLookingFor("<b>Corporate</b> Training");
            stubNoDuplicateAndSave();

            leadService.createLead(validRequest, "1.2.3.4");

            ArgumentCaptor<Lead> captor = ArgumentCaptor.forClass(Lead.class);
            verify(repository).save(captor.capture());
            assertThat(captor.getValue().getName()).doesNotContain("<script>").contains("Ravi");
            assertThat(captor.getValue().getLookingFor()).doesNotContain("<b>").contains("Corporate");
        }

        @Test
        @DisplayName("Blank optional lookingFor is stored as null, not empty string")
        void blankLookingFor_shouldBecomeNull() {
            validRequest.setLookingFor("   ");
            stubNoDuplicateAndSave();

            leadService.createLead(validRequest, "1.2.3.4");

            ArgumentCaptor<Lead> captor = ArgumentCaptor.forClass(Lead.class);
            verify(repository).save(captor.capture());
            assertThat(captor.getValue().getLookingFor()).isNull();
        }

        @Test
        @DisplayName("Client IP is recorded on the lead")
        void ipAddressIsRecorded() {
            stubNoDuplicateAndSave();

            leadService.createLead(validRequest, "203.0.113.7");

            ArgumentCaptor<Lead> captor = ArgumentCaptor.forClass(Lead.class);
            verify(repository).save(captor.capture());
            assertThat(captor.getValue().getIpAddress()).isEqualTo("203.0.113.7");
        }
    }

    @Nested
    @DisplayName("Status update")
    class StatusUpdateTests {

        @Test
        @DisplayName("Valid update -> saves and publishes LeadStatusUpdatedEvent")
        void validUpdate_shouldSaveAndPublish() {
            Lead entity = buildEntity(1L);
            when(repository.findById(1L)).thenReturn(Optional.of(entity));
            when(repository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));

            assertThat(leadService.updateStatus(1L, LeadStatus.CONTACTED).getStatus())
                    .isEqualTo(LeadStatus.CONTACTED);

            verify(eventPublisher).publishEvent(any(LeadStatusUpdatedEvent.class));
        }

        @Test
        @DisplayName("Unknown id -> ResourceNotFoundException")
        void unknownId_shouldThrow() {
            when(repository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> leadService.updateStatus(999L, LeadStatus.CLOSED))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // --- Helpers ---

    private void stubNoDuplicateAndSave() {
        when(repository.findRecentDuplicate(anyString(), any(), any())).thenReturn(Optional.empty());
        when(repository.save(any())).thenReturn(buildEntity(1L));
    }

    private Lead buildEntity(Long id) {
        return Lead.builder()
                .id(id)
                .name("Ravi Kumar")
                .mobile("+919876543210")
                .email("ravi@example.com")
                .lookingFor("Corporate Training")
                .source(LeadSource.SERVICE_CTA_FORM)
                .status(LeadStatus.NEW)
                .ipAddress("1.2.3.4")
                .createdAt(LocalDateTime.now())
                .build();
    }
}
