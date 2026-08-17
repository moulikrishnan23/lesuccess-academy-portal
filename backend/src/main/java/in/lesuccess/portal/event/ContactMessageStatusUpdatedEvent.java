package in.lesuccess.portal.event;


import in.lesuccess.portal.model.ContactMessageStatus;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published after a contact message's status is updated.
 * Consumed by the Sheets sync listener to update the status cell.
 */
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
