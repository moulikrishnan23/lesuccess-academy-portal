package in.lesuccess.portal.successstory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuccessStoryImageRepository extends JpaRepository<SuccessStoryImage, Long> {
    List<SuccessStoryImage> findAllByDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc();
    List<SuccessStoryImage> findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
    Optional<SuccessStoryImage> findByIdAndDeletedAtIsNull(Long id);
    long countByDeletedAtIsNullAndIsActiveTrue();
}
