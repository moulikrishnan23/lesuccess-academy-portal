package in.lesuccess.portal.announcement;

import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository repository;

    @Transactional(readOnly = true)
    public Optional<AnnouncementResponse> getActive() {
        return repository.findByIsActiveTrue().map(AnnouncementResponse::from);
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAllActive() {
        return repository.findAllByIsActiveTrueOrderByCreatedAtAsc()
                .stream()
                .map(AnnouncementResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<AnnouncementResponse> listAll(Pageable pageable) {
        return PageResponse.from(repository.findAll(pageable).map(AnnouncementResponse::from));
    }

    @Transactional
    public AnnouncementResponse create(AnnouncementRequest request) {
        Announcement entity = Announcement.builder()
                .text(request.getText().trim())
                .linkLabel(request.getLinkLabel() != null ? request.getLinkLabel().trim() : null)
                .linkUrl(request.getLinkUrl() != null ? request.getLinkUrl().trim() : null)
                .isActive(false)
                .build();

        Announcement saved = repository.save(entity);
        log.info("Announcement created: id={}", saved.getId());
        return AnnouncementResponse.from(saved);
    }

    @Transactional
    public AnnouncementResponse update(Long id, AnnouncementRequest request) {
        Announcement entity = findOrThrow(id);
        entity.setText(request.getText().trim());
        entity.setLinkLabel(request.getLinkLabel() != null ? request.getLinkLabel().trim() : null);
        entity.setLinkUrl(request.getLinkUrl() != null ? request.getLinkUrl().trim() : null);

        Announcement saved = repository.saveAndFlush(entity);
        log.info("Announcement updated: id={}", id);
        return AnnouncementResponse.from(saved);
    }

    @Transactional
    public AnnouncementResponse activate(Long id) {
        Announcement entity = findOrThrow(id);
        entity.setActive(true);

        Announcement saved = repository.saveAndFlush(entity);
        log.info("Announcement activated: id={}", id);
        return AnnouncementResponse.from(saved);
    }

    @Transactional
    public void softDelete(Long id) {
        Announcement entity = findOrThrow(id);
        entity.setDeletedAt(LocalDateTime.now());
        repository.save(entity);
        log.info("Announcement soft-deleted: id={}", id);
    }

    private Announcement findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
    }
}
