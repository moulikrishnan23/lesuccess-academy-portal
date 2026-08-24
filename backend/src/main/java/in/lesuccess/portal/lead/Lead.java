package in.lesuccess.portal.lead;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * A captured enquiry from any public lead form.
 *
 * <p>Deliberately one table with a {@code source} discriminator rather than a
 * table per form: Home's Demo and Connect forms and the Course enrolment form
 * all capture the same handful of fields, and the admin views want them in one
 * pipeline. Adding those forms later means accepting another {@code source}
 * value, not another migration.</p>
 *
 * <p>The table is {@code lead_capture}, not {@code lead}: LEAD became a reserved
 * word in MySQL 8.0 with the window functions, so a table called {@code lead}
 * would need backquoting in every statement that touched it.</p>
 *
 * <p>The mobile number field is {@code mobile} here. That differs from Contact's
 * {@code phone} and other modules' {@code mobileNumber} — a known inconsistency
 * across DTOs that is bigger than this change. Within this entity the name is
 * used consistently; unifying all three is a separate decision.</p>
 */
@Entity
@Table(name = "lead_capture")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 20)
    private String mobile;

    @Column(length = 160)
    private String email;

    /**
     * Plain column rather than a {@code @ManyToOne} to Course: leads outlive the
     * courses they reference, and a hard association would make deleting a
     * retired course either fail or cascade into historical lead records.
     */
    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "looking_for", length = 120)
    private String lookingFor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LeadSource source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeadStatus status;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = LeadStatus.NEW;
        }
    }
}
