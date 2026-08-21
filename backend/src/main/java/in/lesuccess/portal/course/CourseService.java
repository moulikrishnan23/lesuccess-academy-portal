package in.lesuccess.portal.course;

import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository repository;

    @Transactional(readOnly = true)
    public List<CourseResponse> listActive() {
        return repository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(CourseResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse getById(Long id) {
        return CourseResponse.from(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> listAllForAdmin(Pageable pageable) {
        return PageResponse.from(repository.findAllForAdmin(pageable).map(CourseResponse::from));
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        Course entity = Course.builder()
                .name(request.getName().trim())
                .shortDescription(request.getShortDescription())
                .durationMonths(request.getDurationMonths())
                .mode(request.getMode())
                .badge(request.getBadge())
                .badgeText(request.getBadgeText())
                .placementAssistance(request.isPlacementAssistance())
                .syllabusUrl(request.getSyllabusUrl())
                .enrollUrl(request.getEnrollUrl())
                .isActive(request.isActive())
                .displayOrder(request.getDisplayOrder())
                .build();

        Course saved = repository.save(entity);
        log.info("Course created: id={}, name={}", saved.getId(), saved.getName());
        return CourseResponse.from(saved);
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
        Course entity = findOrThrow(id);
        entity.setName(request.getName().trim());
        entity.setShortDescription(request.getShortDescription());
        entity.setDurationMonths(request.getDurationMonths());
        entity.setMode(request.getMode());
        entity.setBadge(request.getBadge());
        entity.setBadgeText(request.getBadgeText());
        entity.setPlacementAssistance(request.isPlacementAssistance());
        entity.setSyllabusUrl(request.getSyllabusUrl());
        entity.setEnrollUrl(request.getEnrollUrl());
        entity.setActive(request.isActive());
        entity.setDisplayOrder(request.getDisplayOrder());

        Course saved = repository.saveAndFlush(entity);
        log.info("Course updated: id={}", id);
        return CourseResponse.from(saved);
    }

    @Transactional
    public CourseResponse updateOrder(Long id, CourseOrderRequest request) {
        Course entity = findOrThrow(id);
        entity.setDisplayOrder(request.getDisplayOrder());

        Course saved = repository.saveAndFlush(entity);
        log.info("Course display order updated: id={}, order={}", id, request.getDisplayOrder());
        return CourseResponse.from(saved);
    }

    @Transactional
    public void softDelete(Long id) {
        Course entity = findOrThrow(id);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setActive(false);
        repository.save(entity);
        log.info("Course soft-deleted: id={}", id);
    }

    public Course findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", id));
    }
}
