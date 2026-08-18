package in.lesuccess.portal.service;

import in.lesuccess.portal.event.ContactMessageCreatedEvent;
import in.lesuccess.portal.event.ContactMessageStatusUpdatedEvent;
import in.lesuccess.portal.model.ContactMessage;
import in.lesuccess.portal.model.SyncFailure;
import in.lesuccess.portal.repository.SyncFailureRepository;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;

/**
 * Listens for contact message events and syncs to Google Sheets.
 * Runs async (after-commit) so Sheets failures never affect the user's request.
 * On final failure, records to the sync_failure table for later retry.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class ContactMessageSheetsSyncListener {

    private final GoogleSheetsService sheetsService;
    private final SyncFailureRepository syncFailureRepository;
    private final ObjectMapper objectMapper;

    private static final int MAX_RETRY_ATTEMPTS = 3;

    @Async("sheetsSyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCreated(ContactMessageCreatedEvent event) {
        ContactMessage message = event.getContactMessage();
        log.info("Sheets sync: handling ContactMessageCreatedEvent for id={}", message.getId());

        int attempts = 0;
        Exception lastException = null;

        while (attempts < MAX_RETRY_ATTEMPTS) {
            try {
                sheetsService.appendRow(message);
                return; // success
            } catch (Exception ex) {
                attempts++;
                lastException = ex;
                log.warn("Sheets appendRow attempt {}/{} failed for id={}: {}",
                        attempts, MAX_RETRY_ATTEMPTS, message.getId(), ex.getMessage());

                if (attempts < MAX_RETRY_ATTEMPTS) {
                    // Exponential backoff: 1s, 2s
                    try {
                        Thread.sleep(1000L * (1L << (attempts - 1)));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        // All retries exhausted — record failure for scheduled retry
        recordFailure(message.getId(), "APPEND", lastException);
    }

    @Async("sheetsSyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStatusUpdated(ContactMessageStatusUpdatedEvent event) {
        log.info("Sheets sync: handling ContactMessageStatusUpdatedEvent for id={}, newStatus={}",
                event.getContactMessageId(), event.getNewStatus());

        int attempts = 0;
        Exception lastException = null;

        while (attempts < MAX_RETRY_ATTEMPTS) {
            try {
                sheetsService.updateStatus(event.getContactMessageId(), event.getNewStatus().name());
                return; // success
            } catch (Exception ex) {
                attempts++;
                lastException = ex;
                log.warn("Sheets updateStatus attempt {}/{} failed for id={}: {}",
                        attempts, MAX_RETRY_ATTEMPTS, event.getContactMessageId(), ex.getMessage());

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

        recordFailure(event.getContactMessageId(), "STATUS_UPDATE:" + event.getNewStatus(), lastException);
    }

    private void recordFailure(Long contactMessageId, String operation, Exception ex) {
        String reason = ex != null ? ex.getClass().getSimpleName() + ": " + ex.getMessage() : "Unknown error";
        if (reason.length() > 500) {
            reason = reason.substring(0, 500);
        }

        String payload;
        try {
            payload = objectMapper.writeValueAsString(new SyncPayload(contactMessageId, operation));
        } catch (JacksonException jpe) {
            payload = "{\"contactMessageId\":" + contactMessageId + ",\"operation\":\"" + operation + "\"}";
        }

        SyncFailure failure = SyncFailure.builder()
                .contactMessageId(contactMessageId)
                .payload(payload)
                .reason(reason)
                .attemptCount(MAX_RETRY_ATTEMPTS)
                .lastAttemptAt(LocalDateTime.now())
                .build();

        syncFailureRepository.save(failure);
        log.error("Sheets sync failed after {} retries for contact message id={}. Recorded in sync_failure table.",
                MAX_RETRY_ATTEMPTS, contactMessageId, ex);
    }

    private record SyncPayload(Long contactMessageId, String operation) {}
}
