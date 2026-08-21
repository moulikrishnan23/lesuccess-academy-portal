package in.lesuccess.portal.lead;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    Page<Lead> findByStatus(LeadStatus status, Pageable pageable);

    Page<Lead> findBySource(LeadSource source, Pageable pageable);

    Page<Lead> findByStatusAndSource(LeadStatus status, LeadSource source, Pageable pageable);

    /**
     * A repeat submission of the same form by the same number inside the window.
     *
     * <p>Keyed on mobile plus source rather than the whole payload: the same
     * person enquiring through a different form is a genuinely different lead,
     * but a double-clicked submit is not.</p>
     */
    @Query("SELECT l FROM Lead l WHERE l.mobile = :mobile AND l.source = :source "
            + "AND l.createdAt > :since ORDER BY l.createdAt DESC LIMIT 1")
    Optional<Lead> findRecentDuplicate(
            @Param("mobile") String mobile,
            @Param("source") LeadSource source,
            @Param("since") LocalDateTime since);
}
