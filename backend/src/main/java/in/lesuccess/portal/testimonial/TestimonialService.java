package in.lesuccess.portal.testimonial;

import in.lesuccess.portal.course.Course;
import in.lesuccess.portal.course.CourseRepository;
import in.lesuccess.portal.course.Testimonial;
import in.lesuccess.portal.course.TestimonialRepository;
import in.lesuccess.portal.course.TestimonialRequest;
import in.lesuccess.portal.course.TestimonialResponse;
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
public class TestimonialService {

    private final TestimonialRepository repository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<TestimonialResponse> listActive() {
        return repository.findAllByIsActiveTrueOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(TestimonialResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestimonialResponse> listAllForAdmin() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(TestimonialResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestimonialResponse getById(Long id) {
        return repository.findByIdAndDeletedAtIsNull(id)
                .map(TestimonialResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial", id));
    }

    @Transactional
    public TestimonialResponse create(TestimonialRequest req) {
        Course course = null;
        if (req.getCourseId() != null) {
            course = courseRepository.findById(req.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course", req.getCourseId()));
        }

        List<Testimonial> allItems = repository.findAllByOrderByDisplayOrderAscIdAsc();
        int nextOrder = OrderRebalanceUtil.getNextOrder(allItems, Testimonial::getDisplayOrder);
        int assignedOrder = req.getDisplayOrder() > 0 ? req.getDisplayOrder() : nextOrder;

        Testimonial entity = Testimonial.builder()
                .course(course)
                .studentName(req.getStudentName().trim())
                .reviewText(req.getReviewText().trim())
                .rating(req.getRating())
                .source(req.getSource() != null ? req.getSource().trim() : "Google")
                .reviewDate(req.getReviewDate() != null ? req.getReviewDate().trim() : null)
                .reviewerRole(req.getReviewerRole() != null ? req.getReviewerRole().trim() : null)
                .likesCount(req.getLikesCount())
                .photoUrl(req.getPhotoUrl() != null ? req.getPhotoUrl().trim() : null)
                .displayOrder(assignedOrder)
                .isActive(req.isActive())
                .build();

        Testimonial saved = repository.save(entity);

        if (assignedOrder <= allItems.size()) {
            List<Testimonial> toReorder = new ArrayList<>(allItems);
            toReorder.add(saved);
            List<Testimonial> modified = OrderRebalanceUtil.reorder(
                    toReorder, saved.getId(), assignedOrder,
                    Testimonial::getId, Testimonial::getDisplayOrder, Testimonial::setDisplayOrder);
            if (!modified.isEmpty()) {
                repository.saveAll(modified);
            }
        }

        log.info("Created testimonial/review: id={}, student={}, order={}", saved.getId(), saved.getStudentName(), saved.getDisplayOrder());
        return TestimonialResponse.from(saved);
    }

    @Transactional
    public TestimonialResponse update(Long id, TestimonialRequest req) {
        Testimonial entity = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial", id));

        int oldOrder = entity.getDisplayOrder();
        int newOrder = req.getDisplayOrder() > 0 ? req.getDisplayOrder() : oldOrder;

        if (req.getCourseId() != null) {
            Course course = courseRepository.findById(req.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course", req.getCourseId()));
            entity.setCourse(course);
        } else {
            entity.setCourse(null);
        }

        entity.setStudentName(req.getStudentName().trim());
        entity.setReviewText(req.getReviewText().trim());
        entity.setRating(req.getRating());
        entity.setSource(req.getSource() != null ? req.getSource().trim() : "Google");
        entity.setReviewDate(req.getReviewDate() != null ? req.getReviewDate().trim() : null);
        entity.setReviewerRole(req.getReviewerRole() != null ? req.getReviewerRole().trim() : null);
        entity.setLikesCount(req.getLikesCount());
        entity.setPhotoUrl(req.getPhotoUrl() != null ? req.getPhotoUrl().trim() : null);
        entity.setActive(req.isActive());
        entity.setUpdatedAt(LocalDateTime.now());

        if (oldOrder != newOrder) {
            List<Testimonial> allItems = repository.findAllByOrderByDisplayOrderAscIdAsc();
            List<Testimonial> modified = OrderRebalanceUtil.reorder(
                    allItems, id, newOrder,
                    Testimonial::getId, Testimonial::getDisplayOrder, Testimonial::setDisplayOrder);
            if (!modified.isEmpty()) {
                repository.saveAll(modified);
            }
        } else {
            repository.save(entity);
        }

        Testimonial refreshed = repository.findByIdAndDeletedAtIsNull(id).orElse(entity);
        log.info("Updated testimonial/review: id={}, order={}", refreshed.getId(), refreshed.getDisplayOrder());
        return TestimonialResponse.from(refreshed);
    }

    @Transactional
    public void delete(Long id) {
        Testimonial entity = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial", id));
        entity.setDeletedAt(LocalDateTime.now());
        entity.setActive(false);
        repository.save(entity);

        List<Testimonial> remaining = repository.findAllByOrderByDisplayOrderAscIdAsc();
        List<Testimonial> modified = OrderRebalanceUtil.rebalance(
                remaining, Testimonial::getDisplayOrder, Testimonial::setDisplayOrder);
        if (!modified.isEmpty()) {
            repository.saveAll(modified);
        }

        log.info("Soft-deleted testimonial/review: id={}", id);
    }
}
