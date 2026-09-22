package in.lesuccess.portal.companypartner;

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
        int targetRow = req.getRowNumber() <= 0 ? 1 : req.getRowNumber();
        List<CompanyPartner> rowPartners = repository.findAllByOrderByRowNumberAscDisplayOrderAscIdAsc()
                .stream()
                .filter(p -> p.getRowNumber() == targetRow)
                .collect(Collectors.toList());

        int nextOrder = OrderRebalanceUtil.getNextOrder(rowPartners, CompanyPartner::getDisplayOrder);
        int assignedOrder = req.getDisplayOrder() > 0 ? req.getDisplayOrder() : nextOrder;

        CompanyPartner partner = CompanyPartner.builder()
                .name(req.getName().trim())
                .logoUrl(req.getLogoUrl().trim())
                .rowNumber(targetRow)
                .displayOrder(assignedOrder)
                .isActive(req.isActive())
                .build();

        CompanyPartner saved = repository.save(partner);

        if (assignedOrder <= rowPartners.size()) {
            List<CompanyPartner> toReorder = new ArrayList<>(rowPartners);
            toReorder.add(saved);
            List<CompanyPartner> modified = OrderRebalanceUtil.reorder(
                    toReorder, saved.getId(), assignedOrder,
                    CompanyPartner::getId, CompanyPartner::getDisplayOrder, CompanyPartner::setDisplayOrder);
            if (!modified.isEmpty()) {
                repository.saveAll(modified);
            }
        }

        log.info("Created company partner: id={}, name={}, order={}", saved.getId(), saved.getName(), saved.getDisplayOrder());
        return CompanyPartnerResponse.from(saved);
    }

    @Transactional
    public CompanyPartnerResponse update(Long id, CompanyPartnerRequest req) {
        CompanyPartner partner = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyPartner", id));

        int oldOrder = partner.getDisplayOrder();
        int newOrder = req.getDisplayOrder() > 0 ? req.getDisplayOrder() : oldOrder;
        int targetRow = req.getRowNumber() <= 0 ? 1 : req.getRowNumber();

        partner.setName(req.getName().trim());
        partner.setLogoUrl(req.getLogoUrl().trim());
        partner.setRowNumber(targetRow);
        partner.setActive(req.isActive());

        if (oldOrder != newOrder) {
            List<CompanyPartner> rowPartners = repository.findAllByOrderByRowNumberAscDisplayOrderAscIdAsc()
                    .stream()
                    .filter(p -> p.getRowNumber() == targetRow)
                    .collect(Collectors.toList());
            List<CompanyPartner> modified = OrderRebalanceUtil.reorder(
                    rowPartners, id, newOrder,
                    CompanyPartner::getId, CompanyPartner::getDisplayOrder, CompanyPartner::setDisplayOrder);
            if (!modified.isEmpty()) {
                repository.saveAll(modified);
            }
        } else {
            repository.save(partner);
        }

        CompanyPartner refreshed = repository.findByIdAndDeletedAtIsNull(id).orElse(partner);
        log.info("Updated company partner: id={}, order={}", refreshed.getId(), refreshed.getDisplayOrder());
        return CompanyPartnerResponse.from(refreshed);
    }

    @Transactional
    public void delete(Long id) {
        CompanyPartner partner = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyPartner", id));
        partner.setDeletedAt(LocalDateTime.now());
        repository.save(partner);

        List<CompanyPartner> remaining = repository.findAllByOrderByRowNumberAscDisplayOrderAscIdAsc()
                .stream()
                .filter(p -> p.getRowNumber() == partner.getRowNumber())
                .collect(Collectors.toList());
        List<CompanyPartner> modified = OrderRebalanceUtil.rebalance(
                remaining, CompanyPartner::getDisplayOrder, CompanyPartner::setDisplayOrder);
        if (!modified.isEmpty()) {
            repository.saveAll(modified);
        }

        log.info("Deleted company partner: id={}", id);
    }
}
