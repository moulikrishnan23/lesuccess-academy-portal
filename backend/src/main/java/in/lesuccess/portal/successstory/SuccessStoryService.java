package in.lesuccess.portal.successstory;

import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
import in.lesuccess.portal.shared.util.OrderRebalanceUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuccessStoryService {

    private final SuccessStoryImageRepository imageRepository;
    private final SuccessStoryReelRepository reelRepository;

    /* =========================================================
       PUBLIC READ OPERATIONS
    ========================================================= */

    @Transactional(readOnly = true)
    public List<SuccessStoryImageResponse> listActiveImages() {
        return imageRepository.findAllByDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(SuccessStoryImageResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SuccessStoryReelResponse> listActiveReels() {
        return reelRepository.findAllByDeletedAtIsNullAndIsActiveTrueOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(SuccessStoryReelResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SuccessStoryCombinedResponse getCombinedActiveStories() {
        return SuccessStoryCombinedResponse.builder()
                .images(listActiveImages())
                .reels(listActiveReels())
                .build();
    }

    /* =========================================================
       ADMIN OPERATIONS
    ========================================================= */

    @Transactional(readOnly = true)
    public List<SuccessStoryImageResponse> listAllImagesForAdmin() {
        return imageRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(SuccessStoryImageResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SuccessStoryReelResponse> listAllReelsForAdmin() {
        return reelRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(SuccessStoryReelResponse::from)
                .collect(Collectors.toList());
    }

    /* --- Image CRUD --- */

    @Transactional
    public SuccessStoryImageResponse createImage(SuccessStoryImageRequest request) {
        List<SuccessStoryImage> allImages = imageRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
        int nextOrder = OrderRebalanceUtil.getNextOrder(allImages, SuccessStoryImage::getDisplayOrder);
        int assignedOrder = request.getDisplayOrder() != null && request.getDisplayOrder() > 0 ? request.getDisplayOrder() : nextOrder;

        SuccessStoryImage image = SuccessStoryImage.builder()
                .imageUrl(request.getImageUrl().trim())
                .caption(request.getCaption() != null ? request.getCaption().trim() : null)
                .displayOrder(assignedOrder)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        SuccessStoryImage saved = imageRepository.save(image);

        if (assignedOrder <= allImages.size()) {
            List<SuccessStoryImage> toReorder = new ArrayList<>(allImages);
            toReorder.add(saved);
            List<SuccessStoryImage> modified = OrderRebalanceUtil.reorder(
                    toReorder, saved.getId(), assignedOrder,
                    SuccessStoryImage::getId, SuccessStoryImage::getDisplayOrder, SuccessStoryImage::setDisplayOrder);
            if (!modified.isEmpty()) {
                imageRepository.saveAll(modified);
            }
        }

        log.info("Success story image created: id={}, order={}", saved.getId(), saved.getDisplayOrder());
        return SuccessStoryImageResponse.from(saved);
    }

    @Transactional
    public SuccessStoryImageResponse updateImage(Long id, SuccessStoryImageRequest request) {
        SuccessStoryImage image = imageRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("SuccessStoryImage", id));

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
            List<SuccessStoryImage> allImages = imageRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
            List<SuccessStoryImage> modified = OrderRebalanceUtil.reorder(
                    allImages, id, newOrder,
                    SuccessStoryImage::getId, SuccessStoryImage::getDisplayOrder, SuccessStoryImage::setDisplayOrder);
            if (!modified.isEmpty()) {
                imageRepository.saveAll(modified);
            }
        } else {
            imageRepository.save(image);
        }

        SuccessStoryImage refreshed = imageRepository.findByIdAndDeletedAtIsNull(id).orElse(image);
        log.info("Success story image updated: id={}, order={}", refreshed.getId(), refreshed.getDisplayOrder());
        return SuccessStoryImageResponse.from(refreshed);
    }

    @Transactional
    public void deleteImage(Long id) {
        SuccessStoryImage image = imageRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("SuccessStoryImage", id));

        image.setDeletedAt(LocalDateTime.now());
        imageRepository.save(image);

        List<SuccessStoryImage> remaining = imageRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
        List<SuccessStoryImage> modified = OrderRebalanceUtil.rebalance(
                remaining, SuccessStoryImage::getDisplayOrder, SuccessStoryImage::setDisplayOrder);
        if (!modified.isEmpty()) {
            imageRepository.saveAll(modified);
        }

        log.info("Success story image deleted: id={}", id);
    }

    /* --- Reel CRUD --- */

    @Transactional
    public SuccessStoryReelResponse createReel(SuccessStoryReelRequest request) {
        List<SuccessStoryReel> allReels = reelRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
        int nextOrder = OrderRebalanceUtil.getNextOrder(allReels, SuccessStoryReel::getDisplayOrder);
        int assignedOrder = request.getDisplayOrder() != null && request.getDisplayOrder() > 0 ? request.getDisplayOrder() : nextOrder;

        SuccessStoryReel reel = SuccessStoryReel.builder()
                .reelUrl(request.getReelUrl().trim())
                .title(request.getTitle() != null ? request.getTitle().trim() : null)
                .displayOrder(assignedOrder)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        SuccessStoryReel saved = reelRepository.save(reel);

        if (assignedOrder <= allReels.size()) {
            List<SuccessStoryReel> toReorder = new ArrayList<>(allReels);
            toReorder.add(saved);
            List<SuccessStoryReel> modified = OrderRebalanceUtil.reorder(
                    toReorder, saved.getId(), assignedOrder,
                    SuccessStoryReel::getId, SuccessStoryReel::getDisplayOrder, SuccessStoryReel::setDisplayOrder);
            if (!modified.isEmpty()) {
                reelRepository.saveAll(modified);
            }
        }

        log.info("Success story reel created: id={}, order={}", saved.getId(), saved.getDisplayOrder());
        return SuccessStoryReelResponse.from(saved);
    }

    @Transactional
    public SuccessStoryReelResponse updateReel(Long id, SuccessStoryReelRequest request) {
        SuccessStoryReel reel = reelRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("SuccessStoryReel", id));

        if (request.getReelUrl() != null) {
            reel.setReelUrl(request.getReelUrl().trim());
        }
        if (request.getTitle() != null) {
            reel.setTitle(request.getTitle().trim());
        }

        int oldOrder = reel.getDisplayOrder();
        int newOrder = request.getDisplayOrder() != null && request.getDisplayOrder() > 0 ? request.getDisplayOrder() : oldOrder;

        if (request.getIsActive() != null) {
            reel.setActive(request.getIsActive());
        }

        if (oldOrder != newOrder) {
            List<SuccessStoryReel> allReels = reelRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
            List<SuccessStoryReel> modified = OrderRebalanceUtil.reorder(
                    allReels, id, newOrder,
                    SuccessStoryReel::getId, SuccessStoryReel::getDisplayOrder, SuccessStoryReel::setDisplayOrder);
            if (!modified.isEmpty()) {
                reelRepository.saveAll(modified);
            }
        } else {
            reelRepository.save(reel);
        }

        SuccessStoryReel refreshed = reelRepository.findByIdAndDeletedAtIsNull(id).orElse(reel);
        log.info("Success story reel updated: id={}, order={}", refreshed.getId(), refreshed.getDisplayOrder());
        return SuccessStoryReelResponse.from(refreshed);
    }

    @Transactional
    public void deleteReel(Long id) {
        SuccessStoryReel reel = reelRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("SuccessStoryReel", id));

        reel.setDeletedAt(LocalDateTime.now());
        reelRepository.save(reel);

        List<SuccessStoryReel> remaining = reelRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscIdAsc();
        List<SuccessStoryReel> modified = OrderRebalanceUtil.rebalance(
                remaining, SuccessStoryReel::getDisplayOrder, SuccessStoryReel::setDisplayOrder);
        if (!modified.isEmpty()) {
            reelRepository.saveAll(modified);
        }

        log.info("Success story reel deleted: id={}", id);
    }
}
