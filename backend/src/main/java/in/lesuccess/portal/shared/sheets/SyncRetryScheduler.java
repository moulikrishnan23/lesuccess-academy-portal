package in.lesuccess.portal.shared.sheets;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Replays queued {@link SyncFailure} rows on a timer.
 *
 * <p>Now entity-agnostic: it dispatches through the {@link SheetRowSource}
 * registered for each row's {@link SyncEntityType}, so Contact messages and
 * Leads share one queue and one scheduler. Previously this class held a direct
 * {@code ContactMessageRepository} reference and could only replay one table.</p>
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class SyncRetryScheduler {

    private static final int MAX_TOTAL_ATTEMPTS = 10;

    private final SyncFailureRepository syncFailureRepository;
    private final GoogleSheetsService sheetsService;
    private final ObjectMapper objectMapper;
    private final Map<SyncEntityType, SheetRowSource> rowSources = new EnumMap<>(SyncEntityType.class);

    public SyncRetryScheduler(SyncFailureRepository syncFailureRepository,
                              GoogleSheetsService sheetsService,
                              ObjectMapper objectMapper,
                              List<SheetRowSource> sources) {
        this.syncFailureRepository = syncFailureRepository;
        this.sheetsService = sheetsService;
        this.objectMapper = objectMapper;
        sources.forEach(source -> this.rowSources.put(source.entityType(), source));
    }

    @Scheduled(fixedRate = 900_000) // 15 minutes
    public void retryFailedSyncs() {
        List<SyncFailure> failures = syncFailureRepository.findByResolvedFalseOrderByCreatedAtAsc();

        if (failures.isEmpty()) {
            return;
        }

        log.info("Retrying {} failed Sheets syncs", failures.size());

        for (SyncFailure failure : failures) {
            retryOne(failure);
        }
    }

    private void retryOne(SyncFailure failure) {
        if (failure.getAttemptCount() >= MAX_TOTAL_ATTEMPTS) {
            log.warn("Max retry attempts ({}) reached for sync failure id={}, {} id={}. Marking resolved (abandoned).",
                    MAX_TOTAL_ATTEMPTS, failure.getId(), failure.getEntityType(), failure.getEntityId());
            resolve(failure);
            return;
        }

        SheetRowSource source = rowSources.get(failure.getEntityType());
        if (source == null) {
            log.error("No SheetRowSource registered for {}; cannot replay sync failure id={}",
                    failure.getEntityType(), failure.getId());
            return;
        }

        try {
            Optional<SheetRow> row = source.buildRow(failure.getEntityId());

            if (row.isEmpty()) {
                log.warn("{} id={} no longer exists, marking sync failure as resolved",
                        failure.getEntityType(), failure.getEntityId());
                resolve(failure);
                return;
            }

            String operation = parseOperation(failure.getPayload());
            if (operation.startsWith(SheetSyncTask.OP_STATUS_UPDATE_PREFIX)) {
                String newStatus = operation.substring(SheetSyncTask.OP_STATUS_UPDATE_PREFIX.length());
                sheetsService.updateStatus(source.spec(), failure.getEntityId(), newStatus);
            } else {
                sheetsService.appendRow(row.get());
            }

            resolve(failure);
            log.info("Successfully retried Sheets sync for {} id={}",
                    failure.getEntityType(), failure.getEntityId());

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

    private void resolve(SyncFailure failure) {
        failure.setResolved(true);
        syncFailureRepository.save(failure);
    }

    private String parseOperation(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            return node.has("operation")
                    ? node.get("operation").asString()
                    : SheetSyncTask.OP_APPEND;
        } catch (Exception e) {
            return SheetSyncTask.OP_APPEND;
        }
    }
}
