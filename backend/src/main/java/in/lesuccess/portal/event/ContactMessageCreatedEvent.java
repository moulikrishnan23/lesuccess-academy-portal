package in.lesuccess.portal.event;


import in.lesuccess.portal.model.ContactMessage;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published after a new contact message is persisted.
 * Consumed by the Sheets sync listener (async, after-commit).
 */
@Getter
public class ContactMessageCreatedEvent extends ApplicationEvent {

    private final ContactMessage contactMessage;

    public ContactMessageCreatedEvent(Object source, ContactMessage contactMessage) {
        super(source);
        this.contactMessage = contactMessage;
    }
}
