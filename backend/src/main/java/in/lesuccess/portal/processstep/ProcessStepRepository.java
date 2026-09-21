package in.lesuccess.portal.processstep;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessStepRepository extends JpaRepository<ProcessStep, Long> {

    List<ProcessStep> findAllByOrderByStepNumberAsc();
}
