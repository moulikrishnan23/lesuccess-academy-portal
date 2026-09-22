package in.lesuccess.portal.gallery;

import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
import in.lesuccess.portal.shared.util.OrderRebalanceUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
        categoryRepository.findByIdAndDeletedAtIsNull(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("GalleryCategory", categoryId));

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
    public List<GalleryImageResponse> listCategoryImagesForAdmin(Long categoryId) {
        categoryRepository.findByIdAndDeletedAtIsNull(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("GalleryCategory", categoryId));

        return imageRepository.findAllByCategoryIdAndDeletedAtIsNullOrderByDisplayOrderAscIdAsc(categoryId)
                .stream()
                .map(GalleryImageResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GalleryImageResponse> listAllImagesForAdmin(Long categoryId) {
        return listCategoryImagesForAdmin(categoryId);
    }

    @Transactional
    public GalleryCategoryResponse createCategory(GalleryCategoryRequest request) {
        String slug = request.getSlug() != null && !request.getSlug().trim().isEmpty()
                ? slugify(request.getSlug())
                : slugify(request.getName());

        if (categoryRepository.existsBySlugAndDeletedAtIsNull(slug)) {
            throw new InvalidRequestException("Category slug '" + slug + "' is already in use");
        }

        List<GalleryCategory> allCats = categoryRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
        int nextOrder = OrderRebalanceUtil.getNextOrder(allCats, GalleryCategory::getDisplayOrder);
        int assignedOrder = request.getDisplayOrder() != null && request.getDisplayOrder() > 0 ? request.getDisplayOrder() : nextOrder;

        GalleryCategory category = GalleryCategory.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .coverImageUrl(request.getCoverImageUrl() != null ? request.getCoverImageUrl().trim() : null)
                .parentId(request.getParentId())
                .displayOrder(assignedOrder)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        GalleryCategory saved = categoryRepository.save(category);

        if (assignedOrder <= allCats.size()) {
            List<GalleryCategory> toReorder = new ArrayList<>(allCats);
            toReorder.add(saved);
            List<GalleryCategory> modified = OrderRebalanceUtil.reorder(
                    toReorder, saved.getId(), assignedOrder,
                    GalleryCategory::getId, GalleryCategory::getDisplayOrder, GalleryCategory::setDisplayOrder);
            if (!modified.isEmpty()) {
                categoryRepository.saveAll(modified);
            }
        }

        log.info("Gallery category created: id={}, name={}, slug={}", saved.getId(), saved.getName(), saved.getSlug());
        return toCategoryResponse(saved);
    }

    @Transactional
    public GalleryCategoryResponse updateCategory(Long id, GalleryCategoryRequest request) {
        GalleryCategory category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("GalleryCategory", id));

        int oldOrder = category.getDisplayOrder();
        int newOrder = request.getDisplayOrder() != null && request.getDisplayOrder() > 0 ? request.getDisplayOrder() : oldOrder;

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
        if (request.getIsActive() != null) {
            category.setActive(request.getIsActive());
        }

        if (oldOrder != newOrder) {
            List<GalleryCategory> allCats = categoryRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
            List<GalleryCategory> modified = OrderRebalanceUtil.reorder(
                    allCats, id, newOrder,
                    GalleryCategory::getId, GalleryCategory::getDisplayOrder, GalleryCategory::setDisplayOrder);
            if (!modified.isEmpty()) {
                categoryRepository.saveAll(modified);
            }
        } else {
            categoryRepository.save(category);
        }

        GalleryCategory refreshed = categoryRepository.findByIdAndDeletedAtIsNull(id).orElse(category);
        log.info("Gallery category updated: id={}", refreshed.getId());
        return toCategoryResponse(refreshed);
    }

    @Transactional
    public void deleteCategory(Long id) {
        GalleryCategory category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("GalleryCategory", id));

        category.setDeletedAt(LocalDateTime.now());
        categoryRepository.save(category);

        List<GalleryCategory> remaining = categoryRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
        List<GalleryCategory> modified = OrderRebalanceUtil.rebalance(
                remaining, GalleryCategory::getDisplayOrder, GalleryCategory::setDisplayOrder);
        if (!modified.isEmpty()) {
            categoryRepository.saveAll(modified);
        }

        log.info("Gallery category deleted: id={}", id);
    }

    @Transactional
    public GalleryImageResponse createImage(GalleryImageRequest request) {
        categoryRepository.findByIdAndDeletedAtIsNull(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("GalleryCategory", request.getCategoryId()));

        List<GalleryImage> categoryImages = imageRepository.findAllByCategoryIdAndDeletedAtIsNullOrderByDisplayOrderAscIdAsc(request.getCategoryId());
        int nextOrder = OrderRebalanceUtil.getNextOrder(categoryImages, GalleryImage::getDisplayOrder);
        int assignedOrder = request.getDisplayOrder() != null && request.getDisplayOrder() > 0 ? request.getDisplayOrder() : nextOrder;

        GalleryImage image = GalleryImage.builder()
                .categoryId(request.getCategoryId())
                .title(request.getTitle() != null ? request.getTitle().trim() : null)
                .imageUrl(request.getImageUrl().trim())
                .caption(request.getCaption() != null ? request.getCaption().trim() : null)
                .displayOrder(assignedOrder)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        GalleryImage saved = imageRepository.save(image);

        if (assignedOrder <= categoryImages.size()) {
            List<GalleryImage> toReorder = new ArrayList<>(categoryImages);
            toReorder.add(saved);
            List<GalleryImage> modified = OrderRebalanceUtil.reorder(
                    toReorder, saved.getId(), assignedOrder,
                    GalleryImage::getId, GalleryImage::getDisplayOrder, GalleryImage::setDisplayOrder);
            if (!modified.isEmpty()) {
                imageRepository.saveAll(modified);
            }
        }

        log.info("Gallery image created: id={}, categoryId={}, order={}", saved.getId(), saved.getCategoryId(), saved.getDisplayOrder());
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
        int oldOrder = image.getDisplayOrder();
        int newOrder = request.getDisplayOrder() != null && request.getDisplayOrder() > 0 ? request.getDisplayOrder() : oldOrder;

        if (request.getIsActive() != null) {
            image.setActive(request.getIsActive());
        }

        if (oldOrder != newOrder) {
            List<GalleryImage> categoryImages = imageRepository.findAllByCategoryIdAndDeletedAtIsNullOrderByDisplayOrderAscIdAsc(image.getCategoryId());
            List<GalleryImage> modified = OrderRebalanceUtil.reorder(
                    categoryImages, id, newOrder,
                    GalleryImage::getId, GalleryImage::getDisplayOrder, GalleryImage::setDisplayOrder);
            if (!modified.isEmpty()) {
                imageRepository.saveAll(modified);
            }
        } else {
            imageRepository.save(image);
        }

        GalleryImage refreshed = imageRepository.findByIdAndDeletedAtIsNull(id).orElse(image);
        log.info("Gallery image updated: id={}, order={}", refreshed.getId(), refreshed.getDisplayOrder());
        return GalleryImageResponse.from(refreshed);
    }

    @Transactional
    public void deleteImage(Long id) {
        GalleryImage image = imageRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("GalleryImage", id));

        image.setDeletedAt(LocalDateTime.now());
        imageRepository.save(image);

        List<GalleryImage> remaining = imageRepository.findAllByCategoryIdAndDeletedAtIsNullOrderByDisplayOrderAscIdAsc(image.getCategoryId());
        List<GalleryImage> modified = OrderRebalanceUtil.rebalance(
                remaining, GalleryImage::getDisplayOrder, GalleryImage::setDisplayOrder);
        if (!modified.isEmpty()) {
            imageRepository.saveAll(modified);
        }

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
