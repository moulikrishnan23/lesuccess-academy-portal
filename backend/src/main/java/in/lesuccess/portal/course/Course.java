package in.lesuccess.portal.course;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "course")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "duration_months")
    private Integer durationMonths;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CourseMode mode;

    @Column(length = 50)
    private String badge;

    @Column(name = "badge_text", length = 50)
    private String badgeText;

    @Column(name = "placement_assistance", nullable = false)
    private boolean placementAssistance;

    @Column(name = "syllabus_url", length = 255)
    private String syllabusUrl;

    @Column(name = "enroll_url", length = 255)
    private String enrollUrl;

    @Column(name = "icon_url", length = 255)
    private String iconUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 80)
    private String category;

    @Column(name = "role_heading", length = 200)
    private String roleHeading;

    @Column(name = "role_intro", columnDefinition = "TEXT")
    private String roleIntro;

    @Column(name = "role_bullets", columnDefinition = "TEXT")
    private String roleBullets;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

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
        if (this.mode == null) {
            this.mode = CourseMode.BOTH;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
