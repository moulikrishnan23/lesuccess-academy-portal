package in.lesuccess.portal.demobooking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemoBookingRepository extends JpaRepository<DemoBooking, Long> {

    Page<DemoBooking> findByStatus(DemoBookingStatus status, Pageable pageable);
}
