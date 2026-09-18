package in.lesuccess.portal.service;

import in.lesuccess.portal.demobooking.DemoBooking;
import in.lesuccess.portal.demobooking.DemoBookingCreatedEvent;
import in.lesuccess.portal.demobooking.DemoBookingRepository;
import in.lesuccess.portal.demobooking.DemoBookingRequest;
import in.lesuccess.portal.demobooking.DemoBookingService;
import in.lesuccess.portal.demobooking.DemoBookingStatus;

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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * The protections this module previously had none of.
 *
 * <p>Shaped like {@code ContactServiceTest} and {@code LeadServiceTest} so the
 * four public forms read as one suite. Note {@code @InjectMocks} leaves
 * {@code duplicateWindowMinutes} at its field initialiser of 5 — that default is
 * load-bearing for exactly this reason, and is why the window is a field rather
 * than a constructor argument.</p>
 */
@ExtendWith(MockitoExtension.class)
class DemoBookingServiceTest {

    @Mock
    private DemoBookingRepository repository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private DemoBookingService service;

    private DemoBookingRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = DemoBookingRequest.builder()
                .name("Student User")
                .email("student@example.com")
                .courseName("Data Analytics")
                .mobileNumber("9876543210")
                .website("") // empty honeypot
                .build();
    }

    /** Stands in for whatever the repository would have returned after save. */
    private static DemoBooking persisted(String courseName, String mobile) {
        return DemoBooking.builder()
                .id(1L)
                .courseName(courseName)
                .mobileNumber(mobile)
                .status(DemoBookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private void stubSaveEchoingTheEntity() {
        when(repository.save(any(DemoBooking.class))).thenAnswer(invocation -> {
            DemoBooking passed = invocation.getArgument(0);
            passed.setId(1L);
            passed.setCreatedAt(LocalDateTime.now());
            passed.setStatus(DemoBookingStatus.PENDING);
            return passed;
        });
    }

    @Nested
    @DisplayName("Honeypot handling")
    class HoneypotTests {

        @Test
        @DisplayName("Non-empty honeypot → silent success, no DB write")
        void honeypotFilled_shouldReturnSuccessWithoutPersisting() {
            validRequest.setWebsite("http://spam-link.com");

            DemoBookingService.DemoBookingSubmitResult result =
                    service.create(validRequest, "1.2.3.4");

            assertThat(result.isHoneypot()).isTrue();
            assertThat(result.response()).isNull();
            verifyNoInteractions(repository);
            verifyNoInteractions(eventPublisher);
        }

        @Test
        @DisplayName("Empty honeypot → normal submission")
        void emptyHoneypot_shouldPersist() {
            when(repository.findRecentDuplicate(any(), any())).thenReturn(Optional.empty());
            stubSaveEchoingTheEntity();

            DemoBookingService.DemoBookingSubmitResult result =
                    service.create(validRequest, "1.2.3.4");

            assertThat(result.isHoneypot()).isFalse();
            assertThat(result.response()).isNotNull();
            verify(repository).save(any(DemoBooking.class));
        }

        @Test
        @DisplayName("Null honeypot is not a hit — the field is optional on the wire")
        void nullHoneypot_shouldPersist() {
            validRequest.setWebsite(null);
            when(repository.findRecentDuplicate(any(), any())).thenReturn(Optional.empty());
            stubSaveEchoingTheEntity();

            assertThat(service.create(validRequest, "1.2.3.4").isHoneypot()).isFalse();
            verify(repository).save(any(DemoBooking.class));
        }

        /** A bot must not be able to tell a trapped submission from a real one. */
        @Test
        @DisplayName("Honeypot result carries no data a bot could probe")
        void honeypotResult_isIndistinguishableFromSuccess() {
            validRequest.setWebsite("x");

            DemoBookingService.DemoBookingSubmitResult result =
                    service.create(validRequest, "1.2.3.4");

            assertThat(result.response()).isNull();
        }
    }

    @Nested
    @DisplayName("Duplicate detection")
    class DuplicateTests {

        @Test
        @DisplayName("Duplicate within the window → existing row returned, no second write")
        void duplicate_shouldReturnExistingWithoutSaving() {
            DemoBooking existing = persisted("Data Analytics", "9876543210");
            when(repository.findRecentDuplicate(eq("9876543210"), any()))
                    .thenReturn(Optional.of(existing));

            DemoBookingService.DemoBookingSubmitResult result =
                    service.create(validRequest, "1.2.3.4");

            assertThat(result.isHoneypot()).isFalse();
            assertThat(result.response().getId()).isEqualTo(1L);
            verify(repository, never()).save(any());
            verifyNoInteractions(eventPublisher);
        }

        @Test
        @DisplayName("No duplicate → row saved and creation event published")
        void noDuplicate_shouldSaveAndPublish() {
            when(repository.findRecentDuplicate(any(), any())).thenReturn(Optional.empty());
            stubSaveEchoingTheEntity();

            service.create(validRequest, "1.2.3.4");

            verify(repository).save(any(DemoBooking.class));
            verify(eventPublisher).publishEvent(any(DemoBookingCreatedEvent.class));
        }

        /**
         * The window boundary is computed from the configured minutes, which
         * @InjectMocks leaves at the field default of 5. A constructor argument
         * would have arrived null/0 here and silently disabled the lookback.
         */
        @Test
        @DisplayName("Lookback boundary is roughly five minutes ago, from the field default")
        void lookbackUsesTheFieldDefault() {
            when(repository.findRecentDuplicate(any(), any())).thenReturn(Optional.empty());
            stubSaveEchoingTheEntity();

            service.create(validRequest, "1.2.3.4");

            ArgumentCaptor<LocalDateTime> since = ArgumentCaptor.forClass(LocalDateTime.class);
            verify(repository).findRecentDuplicate(any(), since.capture());

            assertThat(since.getValue())
                    .isBefore(LocalDateTime.now().minusMinutes(4))
                    .isAfter(LocalDateTime.now().minusMinutes(6));
        }
    }

    @Nested
    @DisplayName("Sanitization and normalization")
    class SanitizationTests {

        @Test
        @DisplayName("HTML in the course name is stripped before persisting")
        void courseNameHtml_shouldBeStripped() {
            validRequest.setCourseName("<script>alert('xss')</script><b>Data Analytics</b>");
            when(repository.findRecentDuplicate(any(), any())).thenReturn(Optional.empty());
            stubSaveEchoingTheEntity();

            service.create(validRequest, "1.2.3.4");

            ArgumentCaptor<DemoBooking> captor = ArgumentCaptor.forClass(DemoBooking.class);
            verify(repository).save(captor.capture());

            assertThat(captor.getValue().getCourseName())
                    .doesNotContain("<script>", "<b>")
                    .contains("Data Analytics");
        }

        @Test
        @DisplayName("Whitespace in the mobile is normalised before storage")
        void mobile_shouldBeNormalisedBeforeStorage() {
            validRequest.setMobileNumber("+91 98765 43210");
            when(repository.findRecentDuplicate(any(), any())).thenReturn(Optional.empty());
            stubSaveEchoingTheEntity();

            service.create(validRequest, "1.2.3.4");

            ArgumentCaptor<DemoBooking> captor = ArgumentCaptor.forClass(DemoBooking.class);
            verify(repository).save(captor.capture());

            assertThat(captor.getValue().getMobileNumber()).isEqualTo("+919876543210");
        }

        /**
         * The duplicate query matches on exact string equality, so it has to see
         * the same normalised value that gets stored — otherwise "+91 98765 43210"
         * and "+919876543210" are two rows for one person double-clicking.
         */
        @Test
        @DisplayName("The duplicate query is keyed on the normalised mobile, not the raw one")
        void duplicateQuery_usesNormalisedMobile() {
            validRequest.setMobileNumber("+91 98765 43210");
            when(repository.findRecentDuplicate(any(), any())).thenReturn(Optional.empty());
            stubSaveEchoingTheEntity();

            service.create(validRequest, "1.2.3.4");

            verify(repository).findRecentDuplicate(eq("+919876543210"), any());
        }

        @Test
        @DisplayName("A blank course name is stored as null, not an empty string")
        void blankCourseName_becomesNull() {
            validRequest.setCourseName("   ");
            when(repository.findRecentDuplicate(any(), any())).thenReturn(Optional.empty());
            stubSaveEchoingTheEntity();

            service.create(validRequest, "1.2.3.4");

            ArgumentCaptor<DemoBooking> captor = ArgumentCaptor.forClass(DemoBooking.class);
            verify(repository).save(captor.capture());

            assertThat(captor.getValue().getCourseName()).isNull();
        }
    }

    @Nested
    @DisplayName("IP address capture")
    class IpAddressTests {

        /** Restored in V23 specifically so honeypot and duplicate hits are attributable. */
        @Test
        @DisplayName("The caller IP is recorded on the persisted booking")
        void ipAddress_isPersisted() {
            when(repository.findRecentDuplicate(any(), any())).thenReturn(Optional.empty());
            stubSaveEchoingTheEntity();

            service.create(validRequest, "203.0.113.42");

            ArgumentCaptor<DemoBooking> captor = ArgumentCaptor.forClass(DemoBooking.class);
            verify(repository).save(captor.capture());

            assertThat(captor.getValue().getIpAddress()).isEqualTo("203.0.113.42");
        }
    }
}
