package in.lesuccess.portal.courseenquiry;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/** Mirrors ContactMessageCreatedEvent — see CourseEnquirySheetsSyncListener. */
@Getter
public class CourseEnquiryCreatedEvent extends ApplicationEvent {

    private final CourseEnquiry courseEnquiry;

    public CourseEnquiryCreatedEvent(Object source, CourseEnquiry courseEnquiry) {
        super(source);
        this.courseEnquiry = courseEnquiry;
    }
}
