package in.lesuccess.portal.contact;

import in.lesuccess.portal.shared.sheets.SheetsSyncDispatcher;
import in.lesuccess.portal.shared.sheets.SyncEntityType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Queues Contact message writes to Google Sheets once the transaction commits.
 *
 * <p>No {@code @Async} here any more: the listener runs on the commit thread but
 * only offers a task to the bounded executor, which is cheap and non-blocking.
 * Submitting an identifiable task (rather than an opaque {@code @Async} lambda)
 * is what lets the executor's rejection handler record a replayable failure when
 * the queue is saturated.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class ContactMessageSheetsSyncListener {

    private final SheetsSyncDispatcher dispatcher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCreated(ContactMessageCreatedEvent event) {
        ContactMessage message = event.getContactMessage();
        log.info("Sheets sync: queueing ContactMessageCreatedEvent for id={}", message.getId());
        dispatcher.submitAppend(ContactMessageSheetRowSource.toRow(message));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStatusUpdated(ContactMessageStatusUpdatedEvent event) {
        log.info("Sheets sync: queueing ContactMessageStatusUpdatedEvent for id={}, newStatus={}",
                event.getContactMessageId(), event.getNewStatus());

        dispatcher.submitStatusUpdate(
                ContactMessageSheetRowSource.SPEC,
                SyncEntityType.CONTACT_MESSAGE,
                event.getContactMessageId(),
                event.getNewStatus().name());
    }
}
