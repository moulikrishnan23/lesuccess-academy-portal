package in.lesuccess.portal.sheets;

import in.lesuccess.portal.shared.sheets.GoogleSheetsService;
import in.lesuccess.portal.shared.sheets.SheetRow;
import in.lesuccess.portal.shared.sheets.SheetRowSource;
import in.lesuccess.portal.shared.sheets.SheetSpec;
import in.lesuccess.portal.shared.sheets.SyncEntityType;
import in.lesuccess.portal.shared.sheets.SyncFailure;
import in.lesuccess.portal.shared.sheets.SyncFailureRepository;
import in.lesuccess.portal.shared.sheets.SyncRetryScheduler;
import in.lesuccess.portal.shared.sheets.SyncStatus;

import tools.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Covers the two bounds on the retry queue: the attempt ceiling and the backoff.
 *
 * <p>The gap these close is not that the queue was infinite — it was already
 * capped at 10 — but that exhausting the cap wrote {@code resolved = true}, the
 * same value a successful replay wrote. An abandoned submission was
 * indistinguishable from a delivered one, so the assertions below are on
 * {@link SyncStatus} specifically, not merely on the scheduler stopping.</p>
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SyncRetrySchedulerTest {

    private static final int MAX_ATTEMPTS = 20;
    private static final int BACKOFF_MINUTES = 30;

    private static final SheetSpec SPEC =
            new SheetSpec("Course Enquiry", List.of("ID", "Name", "Status"), "A", "C");

    @Mock
    private SyncFailureRepository repository;

    @Mock
    private GoogleSheetsService sheetsService;

    private SyncRetryScheduler scheduler;

    /** Stands in for CourseEnquirySheetRowSource; always resolves the entity. */
    private static class StubRowSource implements SheetRowSource {
        @Override
        public SyncEntityType entityType() {
            return SyncEntityType.COURSE_ENQUIRY;
        }

        @Override
        public SheetSpec spec() {
            return SPEC;
        }

        @Override
        public Optional<SheetRow> buildRow(Long entityId) {
            return Optional.of(new SheetRow(SPEC, SyncEntityType.COURSE_ENQUIRY, entityId,
                    List.of(entityId, "Ravi", "NEW")));
        }
    }

    @BeforeEach
    void setUp() {
        scheduler = new SyncRetryScheduler(repository, sheetsService, new ObjectMapper(),
                List.of(new StubRowSource()));
        ReflectionTestUtils.setField(scheduler, "maxSchedulerAttempts", MAX_ATTEMPTS);
        ReflectionTestUtils.setField(scheduler, "retryBackoffMinutes", BACKOFF_MINUTES);
    }

    private SyncFailure pendingFailure(int attemptCount, LocalDateTime lastAttemptAt) {
        SyncFailure failure = SyncFailure.builder()
                .entityType(SyncEntityType.COURSE_ENQUIRY)
                .entityId(7L)
                .payload("{\"entityType\":\"COURSE_ENQUIRY\",\"entityId\":7,\"operation\":\"APPEND\"}")
                .reason("SocketTimeoutException: Read timed out")
                .attemptCount(attemptCount)
                .lastAttemptAt(lastAttemptAt)
                .status(SyncStatus.PENDING)
                .build();
        failure.setId(1L);
        return failure;
    }

    private void queue(SyncFailure failure) {
        when(repository.findByStatusOrderByCreatedAtAsc(SyncStatus.PENDING))
                .thenReturn(List.of(failure));
    }

    @Test
    @DisplayName("At the ceiling -> ABANDONED, not SUCCEEDED, and no further Sheets call")
    void atCeiling_shouldAbandonRatherThanResolve() throws IOException {
        SyncFailure failure = pendingFailure(MAX_ATTEMPTS, LocalDateTime.now().minusHours(2));
        queue(failure);

        scheduler.retryFailedSyncs();

        assertThat(failure.getStatus()).isEqualTo(SyncStatus.ABANDONED);
        // The distinction this whole change exists for: giving up must not look
        // like delivering.
        assertThat(failure.getStatus()).isNotEqualTo(SyncStatus.SUCCEEDED);
        verify(sheetsService, never()).appendRow(any());
        verify(repository).save(failure);
    }

    @Test
    @DisplayName("Abandoned rows leave the queue -> PENDING query never returns them again")
    void abandonedRow_shouldNotBeRetriedOnALaterTick() throws IOException {
        SyncFailure failure = pendingFailure(MAX_ATTEMPTS, LocalDateTime.now().minusHours(2));
        queue(failure);

        scheduler.retryFailedSyncs();
        assertThat(failure.getStatus()).isEqualTo(SyncStatus.ABANDONED);

        // A real repository selects on PENDING, so the abandoned row is gone from
        // the work set. Model that and confirm the tick becomes a no-op.
        when(repository.findByStatusOrderByCreatedAtAsc(SyncStatus.PENDING)).thenReturn(List.of());
        scheduler.retryFailedSyncs();

        verify(sheetsService, never()).appendRow(any());
    }

    @Test
    @DisplayName("Within the backoff window -> skipped entirely, attempt count untouched")
    void recentAttempt_shouldBeSkippedByBackoff() throws IOException {
        SyncFailure failure = pendingFailure(4, LocalDateTime.now().minusMinutes(BACKOFF_MINUTES - 5));
        queue(failure);

        scheduler.retryFailedSyncs();

        verify(sheetsService, never()).appendRow(any());
        verify(repository, never()).save(any());
        assertThat(failure.getAttemptCount()).isEqualTo(4);
        assertThat(failure.getStatus()).isEqualTo(SyncStatus.PENDING);
    }

    @Test
    @DisplayName("Past the backoff window -> retried, and success marks SUCCEEDED")
    void agedAttempt_shouldRetryAndSucceed() throws IOException {
        SyncFailure failure = pendingFailure(4, LocalDateTime.now().minusMinutes(BACKOFF_MINUTES + 5));
        queue(failure);

        scheduler.retryFailedSyncs();

        verify(sheetsService).appendRow(any());
        assertThat(failure.getStatus()).isEqualTo(SyncStatus.SUCCEEDED);
    }

    @Test
    @DisplayName("Never-stamped row (null lastAttemptAt) -> treated as due, not stranded")
    void nullLastAttempt_shouldBeDue() throws IOException {
        SyncFailure failure = pendingFailure(4, null);
        queue(failure);

        scheduler.retryFailedSyncs();

        verify(sheetsService).appendRow(any());
    }

    @Test
    @DisplayName("Still-failing retry below the ceiling -> stays PENDING, attempt count climbs")
    void failingRetry_belowCeiling_shouldRemainPending() throws IOException {
        SyncFailure failure = pendingFailure(4, LocalDateTime.now().minusHours(1));
        queue(failure);
        doThrow(new IOException("Read timed out")).when(sheetsService).appendRow(any());

        scheduler.retryFailedSyncs();

        assertThat(failure.getAttemptCount()).isEqualTo(5);
        assertThat(failure.getStatus()).isEqualTo(SyncStatus.PENDING);
        assertThat(failure.getLastAttemptAt()).isNotNull();
        verify(repository).save(failure);
    }

    @Test
    @DisplayName("Repeated failures converge on the ceiling rather than retrying forever")
    void repeatedFailures_shouldTerminateAtTheCeiling() throws IOException {
        SyncFailure failure = pendingFailure(4, null);
        queue(failure);
        doThrow(new IOException("Read timed out")).when(sheetsService).appendRow(any());

        // Each pass backdates lastAttemptAt so backoff never blocks; this asserts
        // the ceiling terminates the loop, which is the unbounded-retry claim.
        for (int tick = 0; tick < 100 && failure.getStatus() == SyncStatus.PENDING; tick++) {
            failure.setLastAttemptAt(null);
            scheduler.retryFailedSyncs();
        }

        assertThat(failure.getStatus()).isEqualTo(SyncStatus.ABANDONED);
        assertThat(failure.getAttemptCount()).isEqualTo(MAX_ATTEMPTS);
    }

    @Test
    @DisplayName("Deleted source entity -> ENTITY_GONE, distinct from ABANDONED")
    void missingEntity_shouldBeEntityGone() throws IOException {
        SheetRowSource emptySource = new StubRowSource() {
            @Override
            public Optional<SheetRow> buildRow(Long entityId) {
                return Optional.empty();
            }
        };
        scheduler = new SyncRetryScheduler(repository, sheetsService, new ObjectMapper(),
                List.of(emptySource));
        ReflectionTestUtils.setField(scheduler, "maxSchedulerAttempts", MAX_ATTEMPTS);
        ReflectionTestUtils.setField(scheduler, "retryBackoffMinutes", BACKOFF_MINUTES);

        SyncFailure failure = pendingFailure(4, null);
        queue(failure);

        scheduler.retryFailedSyncs();

        assertThat(failure.getStatus()).isEqualTo(SyncStatus.ENTITY_GONE);
        verify(sheetsService, never()).appendRow(any());
    }
}
