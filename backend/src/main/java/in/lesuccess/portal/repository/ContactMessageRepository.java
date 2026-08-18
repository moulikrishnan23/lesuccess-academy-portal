package in.lesuccess.portal.repository;

import in.lesuccess.portal.model.ContactMessage;
import in.lesuccess.portal.model.ContactMessageStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    /**
     * Paginated list filtered by status.
     * Soft-deleted rows excluded automatically via @SQLRestriction.
     */
    Page<ContactMessage> findByStatus(ContactMessageStatus status, Pageable pageable);

    /**
     * Search by name or email (case-insensitive partial match).
     * Uses bind parameters — no string concatenation.
     */
    @Query("SELECT c FROM ContactMessage c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<ContactMessage> searchByNameOrEmail(@Param("query") String query, Pageable pageable);

    /**
     * Combined filter: status + search.
     */
    @Query("SELECT c FROM ContactMessage c WHERE c.status = :status AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ContactMessage> searchByNameOrEmailAndStatus(
            @Param("query") String query,
            @Param("status") ContactMessageStatus status,
            Pageable pageable);

    /**
     * Duplicate detection — finds an identical submission within a time window.
     * Used to guard against double-click / client retry storms.
     */
    @Query("SELECT c FROM ContactMessage c WHERE c.email = :email AND c.phone = :phone " +
           "AND c.message = :message AND c.createdAt > :since ORDER BY c.createdAt DESC")
    Optional<ContactMessage> findRecentDuplicate(
            @Param("email") String email,
            @Param("phone") String phone,
            @Param("message") String message,
            @Param("since") LocalDateTime since);
}
