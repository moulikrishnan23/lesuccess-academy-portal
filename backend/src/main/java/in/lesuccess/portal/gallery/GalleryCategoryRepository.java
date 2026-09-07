package in.lesuccess.portal.gallery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GalleryCategoryRepository extends JpaRepository<GalleryCategory, Long> {

    List<GalleryCategory> findAllByParentIdIsNullAndDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc();

    List<GalleryCategory> findAllByParentIdAndDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc(Long parentId);

    List<GalleryCategory> findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();

    Optional<GalleryCategory> findBySlugAndDeletedAtIsNull(String slug);

    Optional<GalleryCategory> findByIdAndDeletedAtIsNull(Long id);

    boolean existsBySlugAndDeletedAtIsNull(String slug);
}
