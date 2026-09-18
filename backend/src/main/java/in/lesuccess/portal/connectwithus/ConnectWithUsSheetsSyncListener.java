package in.lesuccess.portal.connectwithus;

import in.lesuccess.portal.shared.sheets.SheetsSyncDispatcher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Queues Connect-with-us writes to Google Sheets once the transaction commits.
 *
 * <p>Same mechanism as {@code CourseEnquirySheetsSyncListener}: AFTER_COMMIT, no
 * {@code @Async}. The listener runs on the commit thread but only offers a task
 * to the bounded executor, which is cheap and non-blocking — and submitting an
 * identifiable {@code SheetSyncTask} rather than an opaque {@code @Async} lambda
 * is what lets the rejection handler record a replayable failure when the queue
 * saturates.</p>
 *
 * <p>No status-update handler: this tab is append-only because the table has no
 * status to update.</p>
 *
 * <p>{@link ConnectWithUsSheetRowSource#toRow} is called statically rather than
 * through an injected row source, unlike the Course Enquiry listener: that one
 * injects its source because building a row needs a course-name lookup. Nothing
 * on this row comes from anywhere but the entity, so there is nothing to
 * inject. The bean still exists — the retry scheduler and the header initialiser
 * discover it by interface.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class ConnectWithUsSheetsSyncListener {

    private final SheetsSyncDispatcher dispatcher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCreated(ConnectWithUsCreatedEvent event) {
        ConnectWithUs submission = event.getSubmission();
        log.info("Sheets sync: queueing ConnectWithUsCreatedEvent for id={}", submission.getId());
        dispatcher.submitAppend(ConnectWithUsSheetRowSource.toRow(submission));
    }
}
