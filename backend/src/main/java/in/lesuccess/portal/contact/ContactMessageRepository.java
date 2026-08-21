package in.lesuccess.portal.contact;

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

    Page<ContactMessage> findByStatus(ContactMessageStatus status, Pageable pageable);

    @Query("SELECT c FROM ContactMessage c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<ContactMessage> searchByNameOrEmail(@Param("query") String query, Pageable pageable);

    @Query("SELECT c FROM ContactMessage c WHERE c.status = :status AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ContactMessage> searchByNameOrEmailAndStatus(
            @Param("query") String query,
            @Param("status") ContactMessageStatus status,
            Pageable pageable);

    @Query("SELECT c FROM ContactMessage c WHERE c.email = :email AND c.phone = :phone " +
           "AND c.message = :message AND c.createdAt > :since ORDER BY c.createdAt DESC")
    Optional<ContactMessage> findRecentDuplicate(
            @Param("email") String email,
            @Param("phone") String phone,
            @Param("message") String message,
            @Param("since") LocalDateTime since);
}
