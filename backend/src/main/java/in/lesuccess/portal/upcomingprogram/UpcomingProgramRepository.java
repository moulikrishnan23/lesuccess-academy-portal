package in.lesuccess.portal.upcomingprogram;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UpcomingProgramRepository extends JpaRepository<UpcomingProgram, Long> {

    @Query("SELECT p FROM UpcomingProgram p WHERE p.isActive = true AND p.eventDate >= :today ORDER BY p.eventDate ASC")
    List<UpcomingProgram> findUpcoming(@Param("today") LocalDate today);

    @Query("SELECT p FROM UpcomingProgram p WHERE p.isActive = true AND p.type = :type AND p.eventDate >= :today ORDER BY p.eventDate ASC")
    List<UpcomingProgram> findUpcomingByType(@Param("type") UpcomingProgramType type, @Param("today") LocalDate today);

    Page<UpcomingProgram> findAll(Pageable pageable);

    Page<UpcomingProgram> findByType(UpcomingProgramType type, Pageable pageable);
}
