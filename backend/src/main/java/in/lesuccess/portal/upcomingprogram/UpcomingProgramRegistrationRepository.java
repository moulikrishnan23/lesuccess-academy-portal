package in.lesuccess.portal.upcomingprogram;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UpcomingProgramRegistrationRepository extends JpaRepository<UpcomingProgramRegistration, Long> {

    Page<UpcomingProgramRegistration> findByProgramId(Long programId, Pageable pageable);

    long countByProgramId(Long programId);
}
