package in.lesuccess.portal.course;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByIsActiveTrueOrderByDisplayOrderAsc();

    @Query("SELECT c FROM Course c ORDER BY c.displayOrder ASC")
    Page<Course> findAllForAdmin(Pageable pageable);
}
