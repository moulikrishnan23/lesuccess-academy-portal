package in.lesuccess.portal.shared.sheets;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Single writer for the sync-failure queue.
 *
 * <p>Shared by the sync task (retries exhausted) and by the executor's rejection
 * handler (queue saturated), so a dropped Sheets write is recorded the same way
 * whatever caused it.</p>
 *
 * <p>Not conditional on {@code lesuccess.sheets.enabled}: it only touches the
 * local database, and {@code SheetsAsyncConfig} wires it into the executor's
 * rejection handler regardless of whether Sheets is switched on.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SyncFailureRecorder {

    private final SyncFailureRepository repository;
    private final ObjectMapper objectMapper;

    private static final int MAX_REASON_LENGTH = 500;

    /**
     * REQUIRES_NEW because both callers run after the originating transaction has
     * already committed — there is no ambient transaction to join, and the
     * failure record must be durable on its own.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(SyncEntityType entityType, Long entityId, String operation,
                       int attemptCount, Throwable cause) {

        String reason = cause != null
                ? cause.getClass().getSimpleName() + ": " + cause.getMessage()
                : "Unknown error";
        if (reason.length() > MAX_REASON_LENGTH) {
            reason = reason.substring(0, MAX_REASON_LENGTH);
        }

        SyncFailure failure = SyncFailure.builder()
                .entityType(entityType)
                .entityId(entityId)
                .payload(buildPayload(entityType, entityId, operation))
                .reason(reason)
                .attemptCount(attemptCount)
                .lastAttemptAt(LocalDateTime.now())
                .build();

        repository.save(failure);
        log.error("Sheets sync failed for {} id={} (operation={}). Recorded in sync_failure table.",
                entityType, entityId, operation, cause);
    }

    private String buildPayload(SyncEntityType entityType, Long entityId, String operation) {
        try {
            return objectMapper.writeValueAsString(new SyncPayload(entityType.name(), entityId, operation));
        } catch (JacksonException ex) {
            return "{\"entityType\":\"" + entityType.name() + "\",\"entityId\":" + entityId
                    + ",\"operation\":\"" + operation + "\"}";
        }
    }

    private record SyncPayload(String entityType, Long entityId, String operation) {}
}
