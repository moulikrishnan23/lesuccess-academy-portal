package in.lesuccess.portal.shared.sheets;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * What happens when the bounded Sheets executor is saturated.
 *
 * <p>The executor previously had no handler at all, so it fell back to
 * {@link ThreadPoolExecutor.AbortPolicy}: submission threw
 * {@code RejectedExecutionException} out of the async proxy, the exception was
 * swallowed by the event-publishing machinery, and the write vanished with no
 * {@code sync_failure} row to retry from — a silent data loss under exactly the
 * load spike where it matters most.</p>
 *
 * <p>{@code CallerRunsPolicy} is deliberately not used: the caller here is the
 * transaction-commit thread, and running a retrying, network-bound Sheets call
 * on it would stall request handling and worsen the very backlog that triggered
 * the rejection. Recording the failure is cheap, local and replayable — the
 * retry scheduler picks it up within 15 minutes.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class SheetsRejectedExecutionHandler implements RejectedExecutionHandler {

    private final SyncFailureRecorder failureRecorder;

    @Override
    public void rejectedExecution(Runnable task, ThreadPoolExecutor executor) {
        if (task instanceof SheetSyncTask syncTask) {
            log.warn("Sheets sync executor saturated (queue={}, active={}); queueing {} id={} for retry",
                    executor.getQueue().size(), executor.getActiveCount(),
                    syncTask.entityType(), syncTask.entityId());

            syncTask.recordAsFailed(0, new java.util.concurrent.RejectedExecutionException(
                    "Sheets sync executor saturated; task queued for scheduled retry"));
            return;
        }

        // Not one of ours - nothing identifies the work, so the best available
        // action is a loud log rather than a sync_failure row that cannot be replayed.
        log.error("Sheets sync executor rejected an unrecognised task type: {}",
                task.getClass().getName());
    }
}
