package in.lesuccess.portal.announcement;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    Optional<Announcement> findByIsActiveTrue();

    List<Announcement> findAllByIsActiveTrueOrderByCreatedAtAsc();

    Page<Announcement> findAll(Pageable pageable);
}
