package in.lesuccess.portal.teammember;

import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeamCategoryService {

    private final TeamCategoryRepository repository;

    @Transactional(readOnly = true)
    public List<TeamCategoryResponse> listAll() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(TeamCategoryResponse::from)
                .toList();
    }

    @Transactional
    public TeamCategoryResponse create(TeamCategoryRequest request) {
        String name = request.getName().trim();
        if (repository.existsByNameIgnoreCase(name)) {
            throw new InvalidRequestException("Category '" + name + "' already exists");
        }

        int order = request.getDisplayOrder() != null ? request.getDisplayOrder() : (int) repository.count() + 1;

        TeamCategory category = TeamCategory.builder()
                .name(name)
                .displayOrder(order)
                .build();

        TeamCategory saved = repository.save(category);
        log.info("Team category created: id={}, name={}", saved.getId(), saved.getName());
        return TeamCategoryResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Team category", id);
        }
        repository.deleteById(id);
        log.info("Team category deleted: id={}", id);
    }
}