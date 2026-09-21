package in.lesuccess.portal.connectwithus;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/** Mirrors CourseEnquiryCreatedEvent — see ConnectWithUsSheetsSyncListener. */
@Getter
public class ConnectWithUsCreatedEvent extends ApplicationEvent {

    private final ConnectWithUs submission;

    public ConnectWithUsCreatedEvent(Object source, ConnectWithUs submission) {
        super(source);
        this.submission = submission;
    }
}
