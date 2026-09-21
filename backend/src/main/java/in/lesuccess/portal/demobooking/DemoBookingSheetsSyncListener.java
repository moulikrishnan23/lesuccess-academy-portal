package in.lesuccess.portal.demobooking;

import in.lesuccess.portal.shared.sheets.SheetsSyncDispatcher;
import in.lesuccess.portal.shared.sheets.SyncEntityType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Queues DemoBooking writes to the Demo Bookings tab once the transaction commits. */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class DemoBookingSheetsSyncListener {

    private final SheetsSyncDispatcher dispatcher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCreated(DemoBookingCreatedEvent event) {
        DemoBooking booking = event.getDemoBooking();
        log.info("Sheets sync: queueing DemoBookingCreatedEvent for id={}", booking.getId());
        dispatcher.submitAppend(DemoBookingSheetRowSource.toRow(booking));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStatusUpdated(DemoBookingStatusUpdatedEvent event) {
        log.info("Sheets sync: queueing DemoBookingStatusUpdatedEvent for id={}, newStatus={}",
                event.getDemoBookingId(), event.getNewStatus());

        dispatcher.submitStatusUpdate(
                DemoBookingSheetRowSource.SPEC,
                SyncEntityType.DEMO_BOOKING,
                event.getDemoBookingId(),
                event.getNewStatus().name());
    }
}
