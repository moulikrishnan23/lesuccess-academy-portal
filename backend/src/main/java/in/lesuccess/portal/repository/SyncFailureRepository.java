package in.lesuccess.portal.repository;

import in.lesuccess.portal.model.SyncFailure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyncFailureRepository extends JpaRepository<SyncFailure, Long> {

    /**
     * Find all unresolved sync failures for retry.
     */
    List<SyncFailure> findByResolvedFalseOrderByCreatedAtAsc();
}
