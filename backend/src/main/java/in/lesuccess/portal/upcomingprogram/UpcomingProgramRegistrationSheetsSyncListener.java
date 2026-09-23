package in.lesuccess.portal.upcomingprogram;

import in.lesuccess.portal.shared.sheets.SheetsSyncDispatcher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Queues program registrations to the Program Registrations tab once the
 * transaction commits.
 *
 * <p>No status-update handler, unlike the demo-booking listener: a registration
 * carries no status anyone works through, so the tab is append-only.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class UpcomingProgramRegistrationSheetsSyncListener {

    private final SheetsSyncDispatcher dispatcher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCreated(UpcomingProgramRegistrationCreatedEvent event) {
        UpcomingProgramRegistration registration = event.getRegistration();
        log.info("Sheets sync: queueing UpcomingProgramRegistrationCreatedEvent for id={}",
                registration.getId());
        dispatcher.submitAppend(UpcomingProgramRegistrationSheetRowSource.toRow(registration));
    }
}
