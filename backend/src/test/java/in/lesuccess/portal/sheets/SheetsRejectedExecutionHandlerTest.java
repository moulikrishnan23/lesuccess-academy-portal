package in.lesuccess.portal.sheets;

import in.lesuccess.portal.shared.sheets.GoogleSheetsService;
import in.lesuccess.portal.shared.sheets.SheetRow;
import in.lesuccess.portal.shared.sheets.SheetSpec;
import in.lesuccess.portal.shared.sheets.SheetSyncTask;
import in.lesuccess.portal.shared.sheets.SheetsRejectedExecutionHandler;
import in.lesuccess.portal.shared.sheets.SyncEntityType;
import in.lesuccess.portal.shared.sheets.SyncFailureRecorder;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Covers the AbortPolicy gap: at queue saturation a Sheets write must leave a
 * replayable {@code sync_failure} row rather than vanishing.
 */
@ExtendWith(MockitoExtension.class)
class SheetsRejectedExecutionHandlerTest {

    @Mock
    private SyncFailureRecorder failureRecorder;

    @Mock
    private GoogleSheetsService sheetsService;

    private static final SheetSpec SPEC =
            new SheetSpec("Leads", List.of("ID", "Name", "Status"), "A", "C");

    @Test
    @DisplayName("Rejected sync task -> failure recorded with the entity's identity")
    void rejectedSyncTask_shouldRecordReplayableFailure() {
        SheetsRejectedExecutionHandler handler = new SheetsRejectedExecutionHandler(failureRecorder);

        SheetRow row = new SheetRow(SPEC, SyncEntityType.LEAD, 42L, List.of(42L, "Ravi", "NEW"));
        SheetSyncTask task = SheetSyncTask.append(sheetsService, failureRecorder, row);

        handler.rejectedExecution(task, saturatedExecutor());

        ArgumentCaptor<String> operation = ArgumentCaptor.forClass(String.class);
        verify(failureRecorder).record(
                eq(SyncEntityType.LEAD), eq(42L), operation.capture(), anyInt(), any());

        // Identity survives the rejection, which is the whole point: the retry
        // scheduler can rebuild and replay this exact row.
        assertThat(operation.getValue()).isEqualTo(SheetSyncTask.OP_APPEND);
        verifyNoInteractions(sheetsService);
    }

    @Test
    @DisplayName("Rejected status-update task records the target status in the operation")
    void rejectedStatusUpdate_shouldRecordOperationDetail() {
        SheetsRejectedExecutionHandler handler = new SheetsRejectedExecutionHandler(failureRecorder);

        SheetSyncTask task = SheetSyncTask.statusUpdate(
                sheetsService, failureRecorder, SPEC, SyncEntityType.CONTACT_MESSAGE, 7L, "RESOLVED");

        handler.rejectedExecution(task, saturatedExecutor());

        verify(failureRecorder).record(
                eq(SyncEntityType.CONTACT_MESSAGE), eq(7L),
                eq(SheetSyncTask.OP_STATUS_UPDATE_PREFIX + "RESOLVED"), anyInt(), any());
    }

    @Test
    @DisplayName("Unrecognised task -> logged, not recorded as an unreplayable row")
    void unknownTask_shouldNotRecordFailure() {
        SheetsRejectedExecutionHandler handler = new SheetsRejectedExecutionHandler(failureRecorder);

        handler.rejectedExecution(() -> { /* not one of ours */ }, saturatedExecutor());

        verify(failureRecorder, never()).record(any(), any(), any(), anyInt(), any());
    }

    /** A real executor purely so the handler can read queue/active counts for its log line. */
    private ThreadPoolExecutor saturatedExecutor() {
        return new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS, new ArrayBlockingQueue<>(1));
    }
}
