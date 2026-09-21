package in.lesuccess.portal.contact;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ContactMessageStatusUpdatedEvent extends ApplicationEvent {

    private final Long contactMessageId;
    private final ContactMessageStatus newStatus;

    public ContactMessageStatusUpdatedEvent(Object source, Long contactMessageId, ContactMessageStatus newStatus) {
        super(source);
        this.contactMessageId = contactMessageId;
        this.newStatus = newStatus;
    }
}
