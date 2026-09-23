package in.lesuccess.portal.upcomingprogram;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published after an {@link UpcomingProgramRegistration} is persisted.
 * The Google Sheets listener observes this AFTER_COMMIT to queue an append.
 *
 * <p>Carries the entity rather than its id so the listener can build the sheet row
 * without a second read — and, more to the point, so it can read {@code program}
 * while the association is still the initialised instance the service set. By the
 * time the listener runs the transaction has committed and the session is gone,
 * so a re-read would have to fetch-join to get the same thing.</p>
 */
@Getter
public class UpcomingProgramRegistrationCreatedEvent extends ApplicationEvent {

    private final transient UpcomingProgramRegistration registration;

    public UpcomingProgramRegistrationCreatedEvent(Object source, UpcomingProgramRegistration registration) {
        super(source);
        this.registration = registration;
    }
}
