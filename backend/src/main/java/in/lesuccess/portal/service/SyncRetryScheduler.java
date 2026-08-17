package in.lesuccess.portal.service;


import in.lesuccess.portal.model.ContactMessage;
import in.lesuccess.portal.model.SyncFailure;
import in.lesuccess.portal.repository.ContactMessageRepository;
import in.lesuccess.portal.repository.SyncFailureRepository;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Scheduled job that retries failed Google Sheets syncs every 15 minutes.
 * Reads unresolved rows from the contact_message_sync_failure table.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class SyncRetryScheduler {

    private final SyncFailureRepository syncFailureRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final GoogleSheetsService sheetsService;
    private final ObjectMapper objectMapper;

    private static final int MAX_TOTAL_ATTEMPTS = 10;

    @Scheduled(fixedRate = 900_000) // 15 minutes
    public void retryFailedSyncs() {
        List<SyncFailure> failures = syncFailureRepository.findByResolvedFalseOrderByCreatedAtAsc();

        if (failures.isEmpty()) {
            return;
        }

        log.info("Retrying {} failed Sheets syncs", failures.size());

        for (SyncFailure failure : failures) {
            if (failure.getAttemptCount() >= MAX_TOTAL_ATTEMPTS) {
                log.warn("Max retry attempts ({}) reached for sync failure id={}, contactMessageId={}. Marking resolved (abandoned).",
                        MAX_TOTAL_ATTEMPTS, failure.getId(), failure.getContactMessageId());
                failure.setResolved(true);
                syncFailureRepository.save(failure);
                continue;
            }

            try {
                String operation = parseOperation(failure.getPayload());
                Optional<ContactMessage> messageOpt = contactMessageRepository.findById(failure.getContactMessageId());

                if (messageOpt.isEmpty()) {
                    log.warn("Contact message id={} no longer exists, marking sync failure as resolved",
                            failure.getContactMessageId());
                    failure.setResolved(true);
                    syncFailureRepository.save(failure);
                    continue;
                }

                ContactMessage message = messageOpt.get();

                if (operation.startsWith("STATUS_UPDATE:")) {
                    String newStatus = operation.substring("STATUS_UPDATE:".length());
                    sheetsService.updateStatus(message.getId(), newStatus);
                } else {
                    sheetsService.appendRow(message);
                }

                failure.setResolved(true);
                syncFailureRepository.save(failure);
                log.info("Successfully retried Sheets sync for contact message id={}", failure.getContactMessageId());

            } catch (Exception ex) {
                failure.setAttemptCount(failure.getAttemptCount() + 1);
                failure.setLastAttemptAt(LocalDateTime.now());
                String reason = ex.getClass().getSimpleName() + ": " + ex.getMessage();
                if (reason.length() > 500) {
                    reason = reason.substring(0, 500);
                }
                failure.setReason(reason);
                syncFailureRepository.save(failure);
                log.warn("Retry failed for sync failure id={}, attempt {}: {}",
                        failure.getId(), failure.getAttemptCount(), ex.getMessage());
            }
        }
    }

    private String parseOperation(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            return node.has("operation") ? node.get("operation").asString() : "APPEND";
        } catch (Exception e) {
            return "APPEND";
        }
    }
}
