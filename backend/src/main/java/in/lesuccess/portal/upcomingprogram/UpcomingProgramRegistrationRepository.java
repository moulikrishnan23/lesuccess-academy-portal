package in.lesuccess.portal.upcomingprogram;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UpcomingProgramRegistrationRepository extends JpaRepository<UpcomingProgramRegistration, Long> {

    Page<UpcomingProgramRegistration> findByProgramId(Long programId, Pageable pageable);

    /**
     * Used only by {@link UpcomingProgramRegistrationSheetRowSource#buildRow}, which
     * the Sheets retry scheduler calls from a background thread with no open
     * transaction. A plain {@code findById} would hand back a lazy {@code program}
     * proxy and the row build would die on LazyInitializationException, which the
     * scheduler would record as one more failed attempt every tick.
     */
    @Query("select r from UpcomingProgramRegistration r join fetch r.program where r.id = :id")
    Optional<UpcomingProgramRegistration> findByIdWithProgram(@Param("id") Long id);

    long countByProgramId(Long programId);

    Page<UpcomingProgramRegistration> findByNameContainingIgnoreCaseOrMobileNumberContaining(String name, String mobileNumber, Pageable pageable);

    Page<UpcomingProgramRegistration> findByNameContainingIgnoreCaseOrMobileNumberContainingOrEmailContainingIgnoreCase(
            String name, String mobileNumber, String email, Pageable pageable);
}
