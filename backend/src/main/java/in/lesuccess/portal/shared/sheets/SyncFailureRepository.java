package in.lesuccess.portal.shared.sheets;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyncFailureRepository extends JpaRepository<SyncFailure, Long> {

    /**
     * The scheduler's work queue.
     *
     * <p>Replaces {@code findByResolvedFalseOrderByCreatedAtAsc}. Querying on an
     * explicit {@link SyncStatus#PENDING} rather than "not resolved" means a row
     * the scheduler abandoned is excluded because it reached a terminal state, not
     * because a boolean happened to be flipped — and {@link SyncStatus#ABANDONED}
     * rows stay queryable for whoever has to replay them by hand.</p>
     */
    List<SyncFailure> findByStatusOrderByCreatedAtAsc(SyncStatus status);

    long countByStatus(SyncStatus status);
}
