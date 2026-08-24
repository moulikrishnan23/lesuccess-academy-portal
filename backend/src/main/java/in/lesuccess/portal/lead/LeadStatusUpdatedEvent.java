package in.lesuccess.portal.lead;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class LeadStatusUpdatedEvent extends ApplicationEvent {

    private final Long leadId;
    private final LeadStatus newStatus;

    public LeadStatusUpdatedEvent(Object source, Long leadId, LeadStatus newStatus) {
        super(source);
        this.leadId = leadId;
        this.newStatus = newStatus;
    }
}
