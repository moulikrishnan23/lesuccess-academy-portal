package in.lesuccess.portal.lead;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class LeadCreatedEvent extends ApplicationEvent {

    private final transient Lead lead;

    public LeadCreatedEvent(Object source, Lead lead) {
        super(source);
        this.lead = lead;
    }
}
