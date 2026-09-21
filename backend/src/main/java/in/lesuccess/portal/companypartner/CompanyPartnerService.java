package in.lesuccess.portal.companypartner;

import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyPartnerService {

    private final CompanyPartnerRepository repository;

    @Transactional(readOnly = true)
    public List<CompanyPartnerResponse> listActive() {
        return repository.findAllByIsActiveTrueOrderByRowNumberAscDisplayOrderAscIdAsc()
                .stream()
                .map(CompanyPartnerResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CompanyPartnerResponse> listAllForAdmin() {
        return repository.findAllByOrderByRowNumberAscDisplayOrderAscIdAsc()
                .stream()
                .map(CompanyPartnerResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public CompanyPartnerResponse create(CompanyPartnerRequest req) {
        CompanyPartner partner = CompanyPartner.builder()
                .name(req.getName().trim())
                .logoUrl(req.getLogoUrl().trim())
                .rowNumber(req.getRowNumber() <= 0 ? 1 : req.getRowNumber())
                .displayOrder(req.getDisplayOrder())
                .isActive(req.isActive())
                .build();

        CompanyPartner saved = repository.save(partner);
        log.info("Created company partner: id={}, name={}", saved.getId(), saved.getName());
        return CompanyPartnerResponse.from(saved);
    }

    @Transactional
    public CompanyPartnerResponse update(Long id, CompanyPartnerRequest req) {
        CompanyPartner partner = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyPartner", id));

        partner.setName(req.getName().trim());
        partner.setLogoUrl(req.getLogoUrl().trim());
        partner.setRowNumber(req.getRowNumber() <= 0 ? 1 : req.getRowNumber());
        partner.setDisplayOrder(req.getDisplayOrder());
        partner.setActive(req.isActive());

        CompanyPartner saved = repository.save(partner);
        log.info("Updated company partner: id={}", saved.getId());
        return CompanyPartnerResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        CompanyPartner partner = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyPartner", id));
        partner.setDeletedAt(LocalDateTime.now());
        repository.save(partner);
        log.info("Deleted company partner: id={}", id);
    }
}
