package in.lesuccess.portal.demobooking;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published after a DemoBooking is persisted to the database.
 * The Google Sheets listener observes this AFTER_COMMIT to queue an append.
 */
@Getter
public class DemoBookingCreatedEvent extends ApplicationEvent {

    private final transient DemoBooking demoBooking;

    public DemoBookingCreatedEvent(Object source, DemoBooking demoBooking) {
        super(source);
        this.demoBooking = demoBooking;
    }
}
