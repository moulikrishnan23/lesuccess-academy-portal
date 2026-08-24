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
    private final CourseModuleRepository moduleRepository;
    private final TestimonialRepository testimonialRepository;

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

    // ── Modules ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CourseModuleResponse> listModules(Long courseId) {
        findOrThrow(courseId);
        return moduleRepository.findByCourseIdOrderByDisplayOrderAsc(courseId)
                .stream().map(CourseModuleResponse::from).toList();
    }

    @Transactional
    public CourseModuleResponse createModule(Long courseId, CourseModuleRequest request) {
        Course course = findOrThrow(courseId);
        CourseModule entity = CourseModule.builder()
                .course(course)
                .title(request.getTitle().trim())
                .content(request.getContent())
                .displayOrder(request.getDisplayOrder())
                .build();
        CourseModule saved = moduleRepository.save(entity);
        log.info("Course module created: id={}, courseId={}", saved.getId(), courseId);
        return CourseModuleResponse.from(saved);
    }

    @Transactional
    public CourseModuleResponse updateModule(Long moduleId, CourseModuleRequest request) {
        CourseModule entity = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Course module", moduleId));
        entity.setTitle(request.getTitle().trim());
        entity.setContent(request.getContent());
        entity.setDisplayOrder(request.getDisplayOrder());
        CourseModule saved = moduleRepository.saveAndFlush(entity);
        log.info("Course module updated: id={}", moduleId);
        return CourseModuleResponse.from(saved);
    }

    @Transactional
    public void deleteModule(Long moduleId) {
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException("Course module", moduleId);
        }
        moduleRepository.deleteById(moduleId);
        log.info("Course module deleted: id={}", moduleId);
    }

    // ── Testimonials ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TestimonialResponse> listTestimonials(Long courseId) {
        findOrThrow(courseId);
        return testimonialRepository.findByCourseIdAndIsActiveTrueOrderByDisplayOrderAsc(courseId)
                .stream().map(TestimonialResponse::from).toList();
    }

    @Transactional
    public TestimonialResponse createTestimonial(Long courseId, TestimonialRequest request) {
        Course course = findOrThrow(courseId);
        Testimonial entity = Testimonial.builder()
                .course(course)
                .studentName(request.getStudentName().trim())
                .reviewText(request.getReviewText().trim())
                .rating(request.getRating())
                .photoUrl(request.getPhotoUrl())
                .displayOrder(request.getDisplayOrder())
                .isActive(request.isActive())
                .build();
        Testimonial saved = testimonialRepository.save(entity);
        log.info("Testimonial created: id={}, courseId={}", saved.getId(), courseId);
        return TestimonialResponse.from(saved);
    }

    @Transactional
    public TestimonialResponse updateTestimonial(Long id, TestimonialRequest request) {
        Testimonial entity = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial", id));
        entity.setStudentName(request.getStudentName().trim());
        entity.setReviewText(request.getReviewText().trim());
        entity.setRating(request.getRating());
        entity.setPhotoUrl(request.getPhotoUrl());
        entity.setDisplayOrder(request.getDisplayOrder());
        entity.setActive(request.isActive());
        Testimonial saved = testimonialRepository.saveAndFlush(entity);
        log.info("Testimonial updated: id={}", id);
        return TestimonialResponse.from(saved);
    }

    @Transactional
    public void deleteTestimonial(Long id) {
        Testimonial entity = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial", id));
        entity.setDeletedAt(LocalDateTime.now());
        testimonialRepository.save(entity);
        log.info("Testimonial soft-deleted: id={}", id);
    }
}
