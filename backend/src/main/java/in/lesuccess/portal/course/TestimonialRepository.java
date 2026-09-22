package in.lesuccess.portal.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {

    List<Testimonial> findByCourseIdAndIsActiveTrueOrderByDisplayOrderAsc(Long courseId);

    List<Testimonial> findAllByIsActiveTrueOrderByDisplayOrderAscIdAsc();

    List<Testimonial> findAllByOrderByDisplayOrderAscIdAsc();

    java.util.Optional<Testimonial> findByIdAndDeletedAtIsNull(Long id);

    long countByDeletedAtIsNull();
}
