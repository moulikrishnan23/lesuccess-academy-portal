package in.lesuccess.portal.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseToolRepository extends JpaRepository<CourseTool, Long> {

    List<CourseTool> findByCourseIdOrderByDisplayOrderAsc(Long courseId);

    void deleteByCourseId(Long courseId);
}