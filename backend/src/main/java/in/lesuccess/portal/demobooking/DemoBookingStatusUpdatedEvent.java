package in.lesuccess.portal.demobooking;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published after a DemoBooking status is updated.
 * The Google Sheets listener observes this AFTER_COMMIT to rewrite the status cell.
 */
@Getter
public class DemoBookingStatusUpdatedEvent extends ApplicationEvent {

    private final Long demoBookingId;
    private final DemoBookingStatus newStatus;

    public DemoBookingStatusUpdatedEvent(Object source, Long demoBookingId, DemoBookingStatus newStatus) {
        super(source);
        this.demoBookingId = demoBookingId;
        this.newStatus = newStatus;
    }
}
