package in.lesuccess.portal.serviceoffering;

import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceOfferingService {

    private final ServiceOfferingRepository repository;

    /**
     * Public read — PUBLISHED rows only, ordered by displayOrder.
     * A null category means "all categories" rather than "no categories".
     */
    @Transactional(readOnly = true)
    public List<ServiceOfferingResponse> listPublished(ServiceCategory category) {
        List<ServiceOffering> rows = (category == null)
                ? repository.findByStatusOrderByDisplayOrderAsc(ServiceStatus.PUBLISHED)
                : repository.findByStatusAndCategoryOrderByDisplayOrderAsc(ServiceStatus.PUBLISHED, category);

        return rows.stream().map(ServiceOfferingResponse::from).toList();
    }

    /** Admin read — any status, including DRAFT. */
    @Transactional(readOnly = true)
    public ServiceOfferingResponse getById(Long id) {
        return ServiceOfferingResponse.from(findOrThrow(id));
    }

    @Transactional
    public ServiceOfferingResponse create(ServiceOfferingRequest request) {
        ServiceOffering entity = ServiceOffering.builder()
                .category(request.getCategory())
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .iconUrl(request.getIconUrl())
                .status(request.getStatus())  // null falls back to DRAFT in @PrePersist
                .displayOrder(request.getDisplayOrder())
                .build();

        ServiceOffering saved = repository.save(entity);
        log.info("Service offering created: id={}, category={}, title={}",
                saved.getId(), saved.getCategory(), saved.getTitle());
        return ServiceOfferingResponse.from(saved);
    }

    @Transactional
    public ServiceOfferingResponse update(Long id, ServiceOfferingRequest request) {
        ServiceOffering entity = findOrThrow(id);
        entity.setCategory(request.getCategory());
        entity.setTitle(request.getTitle().trim());
        entity.setDescription(request.getDescription().trim());
        entity.setIconUrl(request.getIconUrl());
        // On update an absent status means "leave it where it is" — @PrePersist has
        // already run, so there is no default to fall back to.
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        entity.setDisplayOrder(request.getDisplayOrder());

        ServiceOffering saved = repository.saveAndFlush(entity);
        log.info("Service offering updated: id={}", id);
        return ServiceOfferingResponse.from(saved);
    }

    @Transactional
    public void softDelete(Long id) {
        ServiceOffering entity = findOrThrow(id);
        entity.setDeletedAt(LocalDateTime.now());
        repository.save(entity);
        log.info("Service offering soft-deleted: id={}", id);
    }

    private ServiceOffering findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", id));
    }
}
