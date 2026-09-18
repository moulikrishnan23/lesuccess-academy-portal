package in.lesuccess.portal.connectwithus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ConnectWithUsRepository extends JpaRepository<ConnectWithUs, Long> {

    @Query("SELECT c FROM ConnectWithUs c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "c.mobile LIKE CONCAT('%', :query, '%')")
    Page<ConnectWithUs> searchByNameEmailOrMobile(@Param("query") String query, Pageable pageable);

    /**
     * Matches on mobile alone within the window, the same key
     * {@code CourseEnquiryRepository} uses: someone who double-clicks Submit
     * sends the identical payload, and this form has no second axis — no course,
     * no source, no message body — to distinguish two genuine submissions by.
     */
    @Query("SELECT c FROM ConnectWithUs c WHERE c.mobile = :mobile AND c.createdAt > :since " +
           "ORDER BY c.createdAt DESC LIMIT 1")
    Optional<ConnectWithUs> findRecentDuplicate(
            @Param("mobile") String mobile,
            @Param("since") LocalDateTime since);
}
