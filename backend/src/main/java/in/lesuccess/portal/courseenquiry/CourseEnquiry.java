package in.lesuccess.portal.courseenquiry;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * An enquiry from the global "Course Enquiry" modal behind the navbar Enquire
 * button.
 *
 * <p>Its own table rather than a fifth {@code lead_capture.source}: this form
 * captures a location and a "currently you are a" status that {@code Lead} has
 * no columns for, and it is worked from its own sheet tab. See V22 for the full
 * reasoning.</p>
 *
 * <p>No {@code status} column and no {@code deleted_at}, unlike Contact and
 * Lead. There is no admin workflow on this table yet — the admin listing is
 * read-only — so a status enum with a single NEW value and a soft-delete column
 * nothing sets would be scaffolding pretending to be a feature. Both are
 * additive migrations if a workflow arrives.</p>
 */
@Entity
@Table(name = "course_enquiry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseEnquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 20)
    private String mobile;

    @Column(length = 160)
    private String email;

    @Column(length = 160)
    private String location;

    /**
     * Plain column rather than a {@code @ManyToOne} to Course, matching
     * {@link in.lesuccess.portal.lead.Lead}: the admin listing wants the id and
     * the sheet row wants the name, and neither needs a managed association that
     * would drag a Course into every enquiry load.
     *
     * <p>The database does carry an FK here (unlike {@code lead_capture}), with
     * ON DELETE SET NULL. {@code CourseEnquiryService} validates the id against a
     * live course before insert, so a dangling value would mean the row
     * contradicts the rule that admitted it.</p>
     */
    @Column(name = "course_id")
    private Long courseId;

    /**
     * The "Currently you are a" answer — Student, Working Professional, and so
     * on. Free text at the column level on purpose: the option list is copy that
     * marketing changes, and an enum would turn every wording tweak into a
     * migration plus a deploy.
     */
    @Column(name = "current_status", length = 120)
    private String currentStatus;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
