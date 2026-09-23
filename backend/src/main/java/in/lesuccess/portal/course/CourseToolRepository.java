package in.lesuccess.portal.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface CourseToolRepository extends JpaRepository<CourseTool, Long> {

    List<CourseTool> findByCourseIdOrderByDisplayOrderAsc(Long courseId);

    /**
     * Every tool belonging to any of these courses, in one query.
     *
     * <p>Exists so {@code listActive} can serve the whole catalog's tech stacks
     * without calling {@link #findByCourseIdOrderByDisplayOrderAsc} once per
     * course - twenty courses would otherwise be twenty extra round trips on the
     * busiest public endpoint on the site.</p>
     */
    List<CourseTool> findByCourseIdInOrderByCourseIdAscDisplayOrderAsc(Collection<Long> courseIds);

    void deleteByCourseId(Long courseId);
}