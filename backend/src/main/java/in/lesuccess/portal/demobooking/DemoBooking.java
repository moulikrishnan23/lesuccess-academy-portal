package in.lesuccess.portal.demobooking;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "demo_booking")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemoBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 120)
    private String name;

    @Column(name = "email", nullable = false, length = 160)
    private String email;

    @Column(name = "course_name", length = 200)
    private String courseName;

    @Column(name = "mobile_number", nullable = false, length = 20)
    private String mobileNumber;

    /**
     * Restored in V23 after V18 dropped it. It was unused then because this
     * module had no honeypot and no duplicate detection; both log against it now,
     * matching Contact, Lead and CourseEnquiry.
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DemoBookingStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = DemoBookingStatus.PENDING;
        }
    }
}
