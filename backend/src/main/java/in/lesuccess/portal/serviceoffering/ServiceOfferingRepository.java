package in.lesuccess.portal.serviceoffering;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, Long> {

    List<ServiceOffering> findByStatusOrderByDisplayOrderAsc(ServiceStatus status);

    List<ServiceOffering> findByStatusAndCategoryOrderByDisplayOrderAsc(
            ServiceStatus status, ServiceCategory category);
}
