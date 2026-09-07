package in.lesuccess.portal.gallery;

import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GalleryService {

    private final GalleryCategoryRepository categoryRepository;
    private final GalleryImageRepository imageRepository;

    /* =========================================================
       PUBLIC READ OPERATIONS
    ========================================================= */

    @Transactional(readOnly = true)
    public List<GalleryCategoryResponse> listPublicCategories() {
        return categoryRepository.findAllByParentIdIsNullAndDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GalleryCategoryResponse> listPublicSubcategories(Long parentId) {
        return categoryRepository.findAllByParentIdAndDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc(parentId)
                .stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GalleryCategoryResponse getCategory(String slugOrId) {
        GalleryCategory category;
        try {
            Long id = Long.parseLong(slugOrId);
            category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                    .orElseGet(() -> categoryRepository.findBySlugAndDeletedAtIsNull(slugOrId)
                            .orElseThrow(() -> new ResourceNotFoundException("Gallery category not found: " + slugOrId)));
        } catch (NumberFormatException e) {
            category = categoryRepository.findBySlugAndDeletedAtIsNull(slugOrId)
                    .orElseThrow(() -> new ResourceNotFoundException("Gallery category not found: " + slugOrId));
        }

        return toCategoryResponse(category);
    }

    @Transactional(readOnly = true)
    public List<GalleryImageResponse> listCategoryImages(Long categoryId) {
        return imageRepository.findAllByCategoryIdAndDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc(categoryId)
                .stream()
                .map(GalleryImageResponse::from)
                .collect(Collectors.toList());
    }

    /* =========================================================
       ADMIN OPERATIONS
    ========================================================= */

    @Transactional(readOnly = true)
    public List<GalleryCategoryResponse> listAllCategoriesForAdmin() {
        return categoryRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GalleryImageResponse> listAllImagesForAdmin(Long categoryId) {
        return imageRepository.findAllByCategoryIdAndDeletedAtIsNullOrderByDisplayOrderAscIdAsc(categoryId)
                .stream()
                .map(GalleryImageResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public GalleryCategoryResponse createCategory(GalleryCategoryRequest request) {
        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = slugify(request.getName());
        } else {
            slug = slugify(slug);
        }

        if (categoryRepository.existsBySlugAndDeletedAtIsNull(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        GalleryCategory category = GalleryCategory.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .coverImageUrl(request.getCoverImageUrl() != null ? request.getCoverImageUrl().trim() : null)
                .parentId(request.getParentId())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        GalleryCategory saved = categoryRepository.save(category);
        log.info("Gallery category created: id={}, name={}, slug={}", saved.getId(), saved.getName(), saved.getSlug());
        return toCategoryResponse(saved);
    }

    @Transactional
    public GalleryCategoryResponse updateCategory(Long id, GalleryCategoryRequest request) {
        GalleryCategory category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("GalleryCategory", id));

        category.setName(request.getName().trim());
        if (request.getSlug() != null && !request.getSlug().trim().isEmpty()) {
            String newSlug = slugify(request.getSlug());
            if (!newSlug.equals(category.getSlug()) && categoryRepository.existsBySlugAndDeletedAtIsNull(newSlug)) {
                throw new InvalidRequestException("Category slug '" + newSlug + "' is already in use");
            }
            category.setSlug(newSlug);
        }
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        category.setCoverImageUrl(request.getCoverImageUrl() != null ? request.getCoverImageUrl().trim() : null);
        category.setParentId(request.getParentId());
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            category.setActive(request.getIsActive());
        }

        GalleryCategory saved = categoryRepository.save(category);
        log.info("Gallery category updated: id={}", saved.getId());
        return toCategoryResponse(saved);
    }

    @Transactional
    public void deleteCategory(Long id) {
        GalleryCategory category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("GalleryCategory", id));

        category.setDeletedAt(LocalDateTime.now());
        categoryRepository.save(category);
        log.info("Gallery category deleted: id={}", id);
    }

    @Transactional
    public GalleryImageResponse createImage(GalleryImageRequest request) {
        categoryRepository.findByIdAndDeletedAtIsNull(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("GalleryCategory", request.getCategoryId()));

        GalleryImage image = GalleryImage.builder()
                .categoryId(request.getCategoryId())
                .title(request.getTitle() != null ? request.getTitle().trim() : null)
                .imageUrl(request.getImageUrl().trim())
                .caption(request.getCaption() != null ? request.getCaption().trim() : null)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        GalleryImage saved = imageRepository.save(image);
        log.info("Gallery image created: id={}, categoryId={}", saved.getId(), saved.getCategoryId());
        return GalleryImageResponse.from(saved);
    }

    @Transactional
    public List<GalleryImageResponse> createBatchImages(Long categoryId, List<String> imageUrls) {
        categoryRepository.findByIdAndDeletedAtIsNull(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("GalleryCategory", categoryId));

        if (imageUrls == null || imageUrls.isEmpty()) {
            return List.of();
        }

        List<GalleryImage> images = imageUrls.stream()
                .filter(url -> url != null && !url.trim().isEmpty())
                .map(url -> GalleryImage.builder()
                        .categoryId(categoryId)
                        .imageUrl(url.trim())
                        .displayOrder(0)
                        .isActive(true)
                        .build())
                .collect(Collectors.toList());

        List<GalleryImage> saved = imageRepository.saveAll(images);
        log.info("Batch created {} gallery images for categoryId={}", saved.size(), categoryId);

        return saved.stream()
                .map(GalleryImageResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public GalleryImageResponse updateImage(Long id, GalleryImageRequest request) {
        GalleryImage image = imageRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("GalleryImage", id));

        if (request.getCategoryId() != null) {
            categoryRepository.findByIdAndDeletedAtIsNull(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("GalleryCategory", request.getCategoryId()));
            image.setCategoryId(request.getCategoryId());
        }

        if (request.getTitle() != null) {
            image.setTitle(request.getTitle().trim());
        }
        if (request.getImageUrl() != null) {
            image.setImageUrl(request.getImageUrl().trim());
        }
        if (request.getCaption() != null) {
            image.setCaption(request.getCaption().trim());
        }
        if (request.getDisplayOrder() != null) {
            image.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            image.setActive(request.getIsActive());
        }

        GalleryImage saved = imageRepository.save(image);
        log.info("Gallery image updated: id={}", saved.getId());
        return GalleryImageResponse.from(saved);
    }

    @Transactional
    public void deleteImage(Long id) {
        GalleryImage image = imageRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("GalleryImage", id));

        image.setDeletedAt(LocalDateTime.now());
        imageRepository.save(image);
        log.info("Gallery image deleted: id={}", id);
    }

    /* =========================================================
       HELPERS
    ========================================================= */

    private GalleryCategoryResponse toCategoryResponse(GalleryCategory category) {
        long imageCount = imageRepository.countByCategoryIdAndDeletedAtIsNullAndIsActiveTrue(category.getId());
        long subCategoryCount = categoryRepository.findAllByParentIdAndDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc(category.getId()).size();
        return GalleryCategoryResponse.from(category, imageCount, subCategoryCount);
    }

    private String slugify(String text) {
        if (text == null) return "";
        return text.trim()
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }
}
