package in.lesuccess.portal.connectwithus;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A submission from the Home page "Connect with Us" section.
 *
 * <p>Its own table rather than a {@code lead_capture.source}: the three fields
 * would have fitted there, but this form is worked from its own sheet tab rather
 * than filtered out of the shared Leads tab. See V25 for the full reasoning.</p>
 *
 * <p>No {@code status} column and no {@code deleted_at}, for the same reason as
 * {@link in.lesuccess.portal.courseenquiry.CourseEnquiry}: there is no admin
 * workflow on this table, so neither column would ever be set.</p>
 */
@Entity
@Table(name = "connect_with_us")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConnectWithUs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 20)
    private String mobile;

    @Column(length = 160)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
