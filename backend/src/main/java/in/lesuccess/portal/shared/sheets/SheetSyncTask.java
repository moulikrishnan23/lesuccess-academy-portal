package in.lesuccess.portal.shared.sheets;

import lombok.extern.slf4j.Slf4j;

/**
 * A single Sheets write, submitted to the bounded sync executor.
 *
 * <p>This is an explicit {@code Runnable} rather than a {@code @Async} method
 * for one specific reason: {@code @Async} hands the executor an opaque
 * interceptor lambda, so a {@code RejectedExecutionHandler} firing at queue
 * saturation has no way to tell which entity was dropped. Carrying the identity
 * on the task itself is what makes the rejection path able to write a
 * <em>replayable</em> {@link SyncFailure} row instead of an anonymous one.</p>
 */
@Slf4j
public final class SheetSyncTask implements Runnable {

    /** What the task does, and the string recorded in the failure payload. */
    public static final String OP_APPEND = "APPEND";
    public static final String OP_STATUS_UPDATE_PREFIX = "STATUS_UPDATE:";

    private static final int MAX_RETRY_ATTEMPTS = 3;

    private final GoogleSheetsService sheetsService;
    private final SyncFailureRecorder failureRecorder;

    private final SyncEntityType entityType;
    private final Long entityId;
    private final SheetSpec spec;

    /** Non-null for an append; null for a status update. */
    private final SheetRow row;
    /** Non-null for a status update; null for an append. */
    private final String newStatus;

    private SheetSyncTask(GoogleSheetsService sheetsService, SyncFailureRecorder failureRecorder,
                          SyncEntityType entityType, Long entityId, SheetSpec spec,
                          SheetRow row, String newStatus) {
        this.sheetsService = sheetsService;
        this.failureRecorder = failureRecorder;
        this.entityType = entityType;
        this.entityId = entityId;
        this.spec = spec;
        this.row = row;
        this.newStatus = newStatus;
    }

    public static SheetSyncTask append(GoogleSheetsService sheetsService,
                                       SyncFailureRecorder failureRecorder,
                                       SheetRow row) {
        return new SheetSyncTask(sheetsService, failureRecorder,
                row.entityType(), row.entityId(), row.spec(), row, null);
    }

    public static SheetSyncTask statusUpdate(GoogleSheetsService sheetsService,
                                            SyncFailureRecorder failureRecorder,
                                            SheetSpec spec, SyncEntityType entityType,
                                            Long entityId, String newStatus) {
        return new SheetSyncTask(sheetsService, failureRecorder,
                entityType, entityId, spec, null, newStatus);
    }

    public SyncEntityType entityType() {
        return entityType;
    }

    public Long entityId() {
        return entityId;
    }

    /** Operation label, matching what {@link SyncRetryScheduler} parses back out. */
    public String operation() {
        return row != null ? OP_APPEND : OP_STATUS_UPDATE_PREFIX + newStatus;
    }

    /** Hands the failure to the shared recorder — used by the rejection handler. */
    public void recordAsFailed(int attemptCount, Throwable cause) {
        failureRecorder.record(entityType, entityId, operation(), attemptCount, cause);
    }

    @Override
    public void run() {
        int attempts = 0;
        Exception lastException = null;

        while (attempts < MAX_RETRY_ATTEMPTS) {
            try {
                if (row != null) {
                    sheetsService.appendRow(row);
                } else {
                    sheetsService.updateStatus(spec, entityId, newStatus);
                }
                return;
            } catch (Exception ex) {
                attempts++;
                lastException = ex;
                log.warn("Sheets {} attempt {}/{} failed for {} id={}: {}",
                        operation(), attempts, MAX_RETRY_ATTEMPTS, entityType, entityId, ex.getMessage());

                if (attempts < MAX_RETRY_ATTEMPTS) {
                    try {
                        Thread.sleep(1000L * (1L << (attempts - 1)));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        recordAsFailed(MAX_RETRY_ATTEMPTS, lastException);
    }
}
