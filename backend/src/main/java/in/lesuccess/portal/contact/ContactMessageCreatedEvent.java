package in.lesuccess.portal.contact;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ContactMessageCreatedEvent extends ApplicationEvent {

    private final ContactMessage contactMessage;

    public ContactMessageCreatedEvent(Object source, ContactMessage contactMessage) {
        super(source);
        this.contactMessage = contactMessage;
    }
}
