package in.lesuccess.portal.sitesetting;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Site-wide key/value fact referenced from more than one page (phone, email,
 * address, socials, map pin, promo banner).
 *
 * <p>Exists so a value like the contact email has exactly one home — the Contact
 * page reference lists the same address twice, which is the duplication this
 * table removes.</p>
 *
 * <p>Columns are {@code setting_key} / {@code setting_value}, not {@code key} /
 * {@code value}: {@code KEY} is a reserved word in MySQL and would need
 * backquoting in every statement that touched it. The JSON contract is
 * unaffected — {@code GET /api/settings} returns a flat map, so the column
 * names never reach the wire.</p>
 */
@Entity
@Table(name = "site_setting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSetting {

    @Id
    @Column(name = "setting_key", nullable = false, length = 80)
    private String key;

    @Column(name = "setting_value", nullable = false, columnDefinition = "TEXT")
    private String value;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onWrite() {
        this.updatedAt = LocalDateTime.now();
    }
}
