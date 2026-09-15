package in.lesuccess.portal.shared.sheets;

/**
 * Terminal state of a {@link SyncFailure} row.
 *
 * <p>Replaces the {@code resolved} boolean, which could not tell a delivered row
 * from an abandoned one: {@link SyncRetryScheduler} set {@code resolved = true}
 * both when a replay finally succeeded and when it gave up after exhausting its
 * attempts. Those rows were byte-for-byte identical afterwards, so nothing —
 * neither a query nor a dashboard — could find the submissions that had silently
 * never reached the spreadsheet.</p>
 *
 * <p>{@link #PENDING} is the only value the scheduler picks up. Every other
 * value is terminal.</p>
 */
public enum SyncStatus {

    /** Queued for replay. The only state {@link SyncRetryScheduler} re-reads. */
    PENDING,

    /** Replayed successfully; the row reached the spreadsheet. */
    SUCCEEDED,

    /**
     * Attempts exhausted. The row never reached the spreadsheet and never will
     * without operator action — the source entity is still in its own table, so
     * a replay remains possible once the cause is fixed.
     */
    ABANDONED,

    /**
     * The source entity no longer exists, so there is nothing left to replay.
     * Distinct from {@link #ABANDONED}: nothing was lost here.
     */
    ENTITY_GONE
}
