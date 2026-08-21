package in.lesuccess.portal.contact;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyncFailureRepository extends JpaRepository<SyncFailure, Long> {

    List<SyncFailure> findByResolvedFalseOrderByCreatedAtAsc();
}
