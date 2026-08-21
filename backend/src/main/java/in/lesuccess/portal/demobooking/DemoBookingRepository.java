package in.lesuccess.portal.demobooking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DemoBookingRepository extends JpaRepository<DemoBooking, Long> {

    Page<DemoBooking> findByStatus(DemoBookingStatus status, Pageable pageable);

    @Query("SELECT d FROM DemoBooking d WHERE d.course.id = :courseId")
    Page<DemoBooking> findByCourseId(@Param("courseId") Long courseId, Pageable pageable);

    @Query("SELECT d FROM DemoBooking d WHERE d.course.id = :courseId AND d.status = :status")
    Page<DemoBooking> findByCourseIdAndStatus(
            @Param("courseId") Long courseId,
            @Param("status") DemoBookingStatus status,
            Pageable pageable);
}
