package in.lesuccess.portal.courseenquiry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CourseEnquiryRepository extends JpaRepository<CourseEnquiry, Long> {

    Page<CourseEnquiry> findByCourseId(Long courseId, Pageable pageable);

    @Query("SELECT e FROM CourseEnquiry e WHERE " +
           "LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(e.email, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "e.mobile LIKE CONCAT('%', :query, '%')")
    Page<CourseEnquiry> searchByNameEmailOrMobile(@Param("query") String query, Pageable pageable);

    @Query("SELECT e FROM CourseEnquiry e WHERE e.courseId = :courseId AND (" +
           "LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(e.email, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "e.mobile LIKE CONCAT('%', :query, '%'))")
    Page<CourseEnquiry> searchByNameEmailOrMobileAndCourseId(
            @Param("query") String query,
            @Param("courseId") Long courseId,
            Pageable pageable);

    /**
     * Matches on mobile alone, not mobile+course: someone who double-clicks Send
     * sends the identical payload, and someone genuinely enquiring about a second
     * course minutes later is rare enough to lose to the window. Contact keys on
     * email+phone+message and Lead on mobile+source; this form has no comparable
     * second axis, so mobile within the window is it.
     */
    @Query("SELECT e FROM CourseEnquiry e WHERE e.mobile = :mobile AND e.createdAt > :since " +
           "ORDER BY e.createdAt DESC LIMIT 1")
    Optional<CourseEnquiry> findRecentDuplicate(
            @Param("mobile") String mobile,
            @Param("since") LocalDateTime since);
}
