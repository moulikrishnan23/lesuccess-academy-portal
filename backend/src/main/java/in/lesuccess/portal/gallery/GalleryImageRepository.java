package in.lesuccess.portal.gallery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {

    List<GalleryImage> findAllByCategoryIdAndDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc(Long categoryId);

    List<GalleryImage> findAllByCategoryIdAndDeletedAtIsNullOrderByDisplayOrderAscIdAsc(Long categoryId);

    long countByCategoryIdAndDeletedAtIsNullAndIsActiveTrue(Long categoryId);

    Optional<GalleryImage> findByIdAndDeletedAtIsNull(Long id);
}
