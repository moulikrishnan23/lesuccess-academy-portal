package in.lesuccess.portal.shared.sheets;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
 * <p>Entity-agnostic: it dispatches through the {@link SheetRowSource}
 * registered for each row's {@link SyncEntityType}, so Contact messages and
 * Leads share one queue and one scheduler. Previously this class held a direct
 * {@code ContactMessageRepository} reference and could only replay one table.</p>
 *
 * <p><strong>Two bounds, not one.</strong> {@link SheetSyncTask} retries three
 * times inside a single append; this class then retries the recorded failure up
 * to {@code maxSchedulerAttempts} in total. A row that exhausts the second
 * budget is marked {@link SyncStatus#ABANDONED} rather than resolved, so it stops
 * consuming ticks without being mistaken for a delivered row.</p>
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class SyncRetryScheduler {

    private final SyncFailureRepository syncFailureRepository;
    private final GoogleSheetsService sheetsService;
    private final ObjectMapper objectMapper;
    private final Map<SyncEntityType, SheetRowSource> rowSources = new EnumMap<>(SyncEntityType.class);

    /**
     * Total attempt budget per row, across both retry layers.
     *
     * <p>Externalised rather than the old {@code MAX_TOTAL_ATTEMPTS = 10}
     * constant so a prolonged Sheets outage can be ridden out by raising the
     * ceiling instead of redeploying. Counted against
     * {@link SyncFailure#getAttemptCount()}, which already starts at 3 — the
     * in-task retries — so the default 20 buys roughly 17 scheduler passes.</p>
     */
    @Value("${lesuccess.sheets.max-scheduler-attempts:20}")
    private int maxSchedulerAttempts = 20;

    /**
     * Minimum quiet period between two attempts on the <em>same</em> row.
     *
     * <p>Without this, every tick retried every pending row, so a Sheets endpoint
     * that was down stayed hammered by the full backlog every 15 minutes — each
     * call burning a 10s read timeout on the sync executor. A flat interval is
     * deliberate: exponential backoff is the better long-term answer, but a
     * single timestamp comparison removes the hammering now and adds no state to
     * carry or migrate.</p>
     *
     * <p>Set above the 15-minute tick to have any effect; at or below it every
     * row is already eligible on every pass.</p>
     */
    @Value("${lesuccess.sheets.retry-backoff-minutes:30}")
    private int retryBackoffMinutes = 30;

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
        List<SyncFailure> failures =
                syncFailureRepository.findByStatusOrderByCreatedAtAsc(SyncStatus.PENDING);

        if (failures.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        List<SyncFailure> due = failures.stream().filter(failure -> isDue(failure, now)).toList();

        if (due.isEmpty()) {
            log.debug("{} pending Sheets sync(s), none past the {}-minute backoff yet",
                    failures.size(), retryBackoffMinutes);
            return;
        }

        log.info("Retrying {} of {} failed Sheets syncs ({} still backing off)",
                due.size(), failures.size(), failures.size() - due.size());

        for (SyncFailure failure : due) {
            retryOne(failure);
        }
    }

    /**
     * Has this row waited out its backoff?
     *
     * <p>A null {@code lastAttemptAt} counts as due: the column is nullable, and a
     * row that has somehow never been stamped should not be stranded forever.</p>
     */
    private boolean isDue(SyncFailure failure, LocalDateTime now) {
        LocalDateTime last = failure.getLastAttemptAt();
        return last == null || !last.isAfter(now.minusMinutes(retryBackoffMinutes));
    }

    private void retryOne(SyncFailure failure) {
        if (failure.getAttemptCount() >= maxSchedulerAttempts) {
            // ERROR, not WARN: this line says a real submission never reached the
            // spreadsheet and no longer will on its own. The transient read-timeout
            // case below stays WARN because the next tick may well fix it; this one
            // needs a human.
            log.error("Giving up on Sheets sync failure id={} after {} attempts ({} id={}, last reason: {}). "
                            + "Marked {} - the source row is intact and can be replayed once the cause is fixed.",
                    failure.getId(), failure.getAttemptCount(), failure.getEntityType(),
                    failure.getEntityId(), failure.getReason(), SyncStatus.ABANDONED);
            finish(failure, SyncStatus.ABANDONED);
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
                log.warn("{} id={} no longer exists; marking sync failure id={} as {}",
                        failure.getEntityType(), failure.getEntityId(), failure.getId(), SyncStatus.ENTITY_GONE);
                finish(failure, SyncStatus.ENTITY_GONE);
                return;
            }

            String operation = parseOperation(failure.getPayload());
            if (operation.startsWith(SheetSyncTask.OP_STATUS_UPDATE_PREFIX)) {
                String newStatus = operation.substring(SheetSyncTask.OP_STATUS_UPDATE_PREFIX.length());
                sheetsService.updateStatus(source.spec(), failure.getEntityId(), newStatus);
            } else {
                sheetsService.appendRow(row.get());
            }

            finish(failure, SyncStatus.SUCCEEDED);
            log.info("Successfully retried Sheets sync for {} id={} (failure id={})",
                    failure.getEntityType(), failure.getEntityId(), failure.getId());

        } catch (Exception ex) {
            failure.setAttemptCount(failure.getAttemptCount() + 1);
            failure.setLastAttemptAt(LocalDateTime.now());
            String reason = ex.getClass().getSimpleName() + ": " + ex.getMessage();
            if (reason.length() > 500) {
                reason = reason.substring(0, 500);
            }
            failure.setReason(reason);
            syncFailureRepository.save(failure);

            // Report the ceiling alongside the count so the log says how much budget
            // is left, not just how much has been spent.
            log.warn("Retry failed for sync failure id={}, attempt {}/{}: {}",
                    failure.getId(), failure.getAttemptCount(), maxSchedulerAttempts, ex.getMessage());
        }
    }

    /** Move a row to a terminal state and stamp the attempt that got it there. */
    private void finish(SyncFailure failure, SyncStatus status) {
        failure.setStatus(status);
        failure.setLastAttemptAt(LocalDateTime.now());
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
