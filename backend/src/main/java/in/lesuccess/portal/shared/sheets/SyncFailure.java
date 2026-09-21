package in.lesuccess.portal.shared.sheets;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A Sheets write that could not be completed, queued for retry.
 *
 * <p>Generalised from the original ContactMessage-only shape: the FK column
 * {@code contact_message_id} became the polymorphic pair
 * {@code entity_type} + {@code entity_id}, so Lead syncs share one queue,
 * one retry scheduler and one set of operational dashboards rather than
 * growing a parallel table per module.</p>
 *
 * <p>The database foreign key was dropped as part of that change — a single
 * column cannot reference two tables. That is an acceptable trade here: this is
 * an operational retry queue rather than a domain relation, and
 * {@link SyncRetryScheduler} already treats a missing entity as "resolved,
 * nothing to replay" instead of an error.</p>
 */
@Entity
@Table(name = "sync_failure")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncFailure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 32)
    private SyncEntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(nullable = false, columnDefinition = "JSON")
    private String payload;

    @Column(nullable = false, length = 500)
    private String reason;

    /**
     * Total attempts across both retry layers, not just the scheduler's.
     *
     * <p>A row is created by {@link SyncFailureRecorder} with this already set to
     * {@code SheetSyncTask.MAX_RETRY_ATTEMPTS} (3), because the in-task retries
     * ran first. {@link SyncRetryScheduler} increments from there, so its ceiling
     * is a total budget, not a count of scheduler passes.</p>
     */
    @Column(name = "attempt_count", nullable = false)
    @Builder.Default
    private int attemptCount = 0;

    @Column(name = "last_attempt_at")
    private LocalDateTime lastAttemptAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Terminal state. Only {@link SyncStatus#PENDING} rows are retried.
     *
     * <p>Was a {@code resolved} boolean, which conflated "replayed successfully"
     * with "gave up" — see {@link SyncStatus}.</p>
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private SyncStatus status = SyncStatus.PENDING;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
