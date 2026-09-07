package in.lesuccess.portal.companypartner;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyPartnerRepository extends JpaRepository<CompanyPartner, Long> {
    List<CompanyPartner> findAllByIsActiveTrueOrderByRowNumberAscDisplayOrderAscIdAsc();
    List<CompanyPartner> findAllByOrderByRowNumberAscDisplayOrderAscIdAsc();
    Optional<CompanyPartner> findByIdAndDeletedAtIsNull(Long id);
}
