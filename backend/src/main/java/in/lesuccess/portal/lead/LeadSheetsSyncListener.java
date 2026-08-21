package in.lesuccess.portal.lead;

import in.lesuccess.portal.shared.sheets.SheetsSyncDispatcher;
import in.lesuccess.portal.shared.sheets.SyncEntityType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Queues Lead writes to the Leads tab once the transaction commits. */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class LeadSheetsSyncListener {

    private final SheetsSyncDispatcher dispatcher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCreated(LeadCreatedEvent event) {
        Lead lead = event.getLead();
        log.info("Sheets sync: queueing LeadCreatedEvent for id={}", lead.getId());
        dispatcher.submitAppend(LeadSheetRowSource.toRow(lead));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStatusUpdated(LeadStatusUpdatedEvent event) {
        log.info("Sheets sync: queueing LeadStatusUpdatedEvent for id={}, newStatus={}",
                event.getLeadId(), event.getNewStatus());

        dispatcher.submitStatusUpdate(
                LeadSheetRowSource.SPEC,
                SyncEntityType.LEAD,
                event.getLeadId(),
                event.getNewStatus().name());
    }
}
