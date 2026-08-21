package in.lesuccess.portal.demobooking;

import in.lesuccess.portal.course.Course;
import in.lesuccess.portal.course.CourseRepository;
import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemoBookingService {

    private final DemoBookingRepository repository;
    private final CourseRepository courseRepository;

    @Transactional
    public DemoBookingResponse create(DemoBookingRequest request, String ipAddress) {
        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId()).orElse(null);
        }

        DemoBooking entity = DemoBooking.builder()
                .course(course)
                .mobileNumber(request.getMobileNumber())
                .status(DemoBookingStatus.PENDING)
                .ipAddress(ipAddress)
                .build();

        DemoBooking saved = repository.save(entity);
        log.info("Demo booking created: id={}, mobile={}", saved.getId(), saved.getMobileNumber());
        return DemoBookingResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<DemoBookingResponse> listAll(Long courseId, DemoBookingStatus status, Pageable pageable) {
        Page<DemoBooking> page;

        if (courseId != null && status != null) {
            page = repository.findByCourseIdAndStatus(courseId, status, pageable);
        } else if (courseId != null) {
            page = repository.findByCourseId(courseId, pageable);
        } else if (status != null) {
            page = repository.findByStatus(status, pageable);
        } else {
            page = repository.findAll(pageable);
        }

        return PageResponse.from(page.map(DemoBookingResponse::from));
    }

    @Transactional(readOnly = true)
    public DemoBookingResponse getById(Long id) {
        return DemoBookingResponse.from(findOrThrow(id));
    }

    @Transactional
    public DemoBookingResponse updateStatus(Long id, DemoBookingStatusUpdateRequest request) {
        DemoBooking entity = findOrThrow(id);
        entity.setStatus(request.getStatus());

        DemoBooking saved = repository.saveAndFlush(entity);
        log.info("Demo booking status updated: id={}, status={}", id, request.getStatus());
        return DemoBookingResponse.from(saved);
    }

    private DemoBooking findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo booking", id));
    }
}
