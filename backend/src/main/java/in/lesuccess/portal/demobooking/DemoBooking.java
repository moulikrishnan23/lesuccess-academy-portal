package in.lesuccess.portal.demobooking;

import in.lesuccess.portal.course.Course;

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

    // nullable: course may be soft-deleted after a booking is created
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "mobile_number", nullable = false, length = 20)
    private String mobileNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DemoBookingStatus status;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = DemoBookingStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
