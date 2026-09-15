package in.lesuccess.portal.courseenquiry;

import in.lesuccess.portal.shared.sheets.SheetsSyncDispatcher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Queues Course enquiry writes to Google Sheets once the transaction commits.
 *
 * <p>Same mechanism as {@code ContactMessageSheetsSyncListener}: AFTER_COMMIT,
 * no {@code @Async}. The listener runs on the commit thread but only offers a
 * task to the bounded executor, which is cheap and non-blocking — and submitting
 * an identifiable {@code SheetSyncTask} rather than an opaque {@code @Async}
 * lambda is what lets the rejection handler record a replayable failure when the
 * queue saturates.</p>
 *
 * <p>No status-update handler, unlike Contact and Lead: this tab is append-only
 * because the table has no status to update.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class CourseEnquirySheetsSyncListener {

    private final SheetsSyncDispatcher dispatcher;
    private final CourseEnquirySheetRowSource rowSource;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCreated(CourseEnquiryCreatedEvent event) {
        CourseEnquiry enquiry = event.getCourseEnquiry();
        log.info("Sheets sync: queueing CourseEnquiryCreatedEvent for id={}", enquiry.getId());
        dispatcher.submitAppend(rowSource.rowFor(enquiry));
    }
}
