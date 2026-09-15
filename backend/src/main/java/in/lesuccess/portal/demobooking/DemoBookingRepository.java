package in.lesuccess.portal.demobooking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface DemoBookingRepository extends JpaRepository<DemoBooking, Long> {

    Page<DemoBooking> findByStatus(DemoBookingStatus status, Pageable pageable);

    /**
     * Matches on mobile alone within the window.
     *
     * <p>Mobile-only because there is no second axis to match on: Contact keys on
     * email+phone+message and Lead on mobile+source, but a demo booking carries
     * only a mobile number and an optional course name. Including course name
     * would make "same number, changed their mind about the course" a new row
     * while a double-clicked Book Demo stayed suppressed — the opposite of what
     * is wanted, since the second case is the one the window exists to catch.</p>
     *
     * <p>Same shape as {@code CourseEnquiryRepository#findRecentDuplicate}.</p>
     */
    @Query("SELECT d FROM DemoBooking d WHERE d.mobileNumber = :mobile AND d.createdAt > :since " +
           "ORDER BY d.createdAt DESC LIMIT 1")
    Optional<DemoBooking> findRecentDuplicate(
            @Param("mobile") String mobile,
            @Param("since") LocalDateTime since);
}
