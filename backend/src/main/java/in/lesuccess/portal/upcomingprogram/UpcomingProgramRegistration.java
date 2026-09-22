package in.lesuccess.portal.upcomingprogram;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "program_registration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpcomingProgramRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private UpcomingProgram program;

    @Column(name = "program_id", insertable = false, updatable = false)
    private Long programId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "mobile_number", nullable = false, length = 20)
    private String mobileNumber;

    @Column(length = 160)
    private String email;

    @Column(length = 20)
    private String mode;

    @Column(name = "venue_address", length = 255)
    private String venueAddress;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
