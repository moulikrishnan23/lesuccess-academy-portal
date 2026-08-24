package in.lesuccess.portal.shared.sheets;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyncFailureRepository extends JpaRepository<SyncFailure, Long> {

    List<SyncFailure> findByResolvedFalseOrderByCreatedAtAsc();
}
