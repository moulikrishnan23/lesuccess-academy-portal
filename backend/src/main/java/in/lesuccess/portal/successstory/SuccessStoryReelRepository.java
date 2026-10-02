package in.lesuccess.portal.successstory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuccessStoryReelRepository extends JpaRepository<SuccessStoryReel, Long> {
    List<SuccessStoryReel> findAllByDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc();
    List<SuccessStoryReel> findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
    Optional<SuccessStoryReel> findByIdAndDeletedAtIsNull(Long id);
    long countByDeletedAtIsNullAndIsActiveTrue();
}
