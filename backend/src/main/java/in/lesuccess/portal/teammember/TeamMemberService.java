package in.lesuccess.portal.teammember;

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
public class TeamMemberService {

    private final TeamMemberRepository repository;

    @Transactional(readOnly = true)
    public List<TeamMemberResponse> listActive() {
        return repository.findAllByIsActiveTrueOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(TeamMemberResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamMemberResponse> listAllForAdmin() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(TeamMemberResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamMemberResponse create(TeamMemberRequest req) {
        TeamMember member = TeamMember.builder()
                .name(req.getName().trim())
                .role(req.getRole().trim())
                .email(req.getEmail().trim())
                .imageUrl(req.getImageUrl() != null ? req.getImageUrl().trim() : null)
                .isFeatured(req.isFeatured())
                .displayOrder(req.getDisplayOrder())
                .isActive(req.isActive())
                .build();

        TeamMember saved = repository.save(member);
        log.info("Created team member: id={}, name={}", saved.getId(), saved.getName());
        return TeamMemberResponse.from(saved);
    }

    @Transactional
    public TeamMemberResponse update(Long id, TeamMemberRequest req) {
        TeamMember member = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", id));

        member.setName(req.getName().trim());
        member.setRole(req.getRole().trim());
        member.setEmail(req.getEmail().trim());
        member.setImageUrl(req.getImageUrl() != null ? req.getImageUrl().trim() : null);
        member.setFeatured(req.isFeatured());
        member.setDisplayOrder(req.getDisplayOrder());
        member.setActive(req.isActive());

        TeamMember saved = repository.save(member);
        log.info("Updated team member: id={}", saved.getId());
        return TeamMemberResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        TeamMember member = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", id));
        member.setDeletedAt(LocalDateTime.now());
        repository.save(member);
        log.info("Deleted team member: id={}", id);
    }
}
