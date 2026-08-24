package in.lesuccess.portal.announcement;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    Optional<Announcement> findByIsActiveTrue();

    Page<Announcement> findAll(Pageable pageable);

    /** Deactivates every announcement except the one being activated. */
    @Modifying
    @Query("UPDATE Announcement a SET a.isActive = false WHERE a.id <> :excludeId")
    void deactivateAllExcept(@Param("excludeId") Long excludeId);
}
