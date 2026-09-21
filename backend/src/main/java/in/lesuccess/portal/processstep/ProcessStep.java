package in.lesuccess.portal.processstep;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * One step of "How LeSuccess Drives Success" (Evaluate / Customize / Empower / Launch).
 *
 * <p>A fixed set of four rows seeded by migration: there is no create or delete
 * path, so no {@code deletedAt} column and no {@code @SQLRestriction} — unlike
 * the soft-deletable content entities.</p>
 */
@Entity
@Table(name = "process_step")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "step_number", nullable = false)
    private int stepNumber;

    @Column(nullable = false, length = 80)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url", length = 255)
    private String iconUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
