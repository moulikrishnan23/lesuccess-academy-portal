package in.lesuccess.portal.teammember;

import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
import in.lesuccess.portal.shared.util.OrderRebalanceUtil;
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

    @Transactional(readOnly = true)
    public TeamMemberResponse getById(Long id) {
        return repository.findByIdAndDeletedAtIsNull(id)
                .map(TeamMemberResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", id));
    }

    @Transactional(readOnly = true)
    public int getNextOrder() {
        List<TeamMember> allMembers = repository.findAllByOrderByDisplayOrderAscIdAsc();
        return OrderRebalanceUtil.getNextOrder(allMembers, TeamMember::getDisplayOrder);
    }

    @Transactional
    public TeamMemberResponse create(TeamMemberRequest req) {
        List<TeamMember> allMembers = repository.findAllByOrderByDisplayOrderAscIdAsc();
        int nextOrder = OrderRebalanceUtil.getNextOrder(allMembers, TeamMember::getDisplayOrder);
        int assignedOrder = req.getDisplayOrder() > 0 ? req.getDisplayOrder() : nextOrder;

        TeamMember member = TeamMember.builder()
                .name(req.getName().trim())
                .role(req.getRole().trim())
                .email(req.getEmail().trim())
                .imageUrl(req.getImageUrl() != null ? req.getImageUrl().trim() : null)
                .bio(req.getBio() != null ? req.getBio().trim() : null)
                .experience(req.getExperience() != null ? req.getExperience().trim() : null)
                .skills(req.getSkills() != null ? req.getSkills().trim() : null)
                .department(req.getEffectiveCategory())
                .isFeatured(req.isFeatured())
                .displayOrder(assignedOrder)
                .isActive(req.isActive())
                .build();

        TeamMember saved = repository.save(member);

        // If assignedOrder is within existing items, rebalance to avoid duplicate
        if (assignedOrder <= allMembers.size()) {
            allMembers.add(saved);
            List<TeamMember> modified = OrderRebalanceUtil.reorder(
                    allMembers, saved.getId(), assignedOrder,
                    TeamMember::getId, TeamMember::getDisplayOrder, TeamMember::setDisplayOrder);
            if (!modified.isEmpty()) {
                repository.saveAll(modified);
            }
        }

        log.info("Created team member: id={}, name={}, order={}", saved.getId(), saved.getName(), saved.getDisplayOrder());
        return TeamMemberResponse.from(saved);
    }

    @Transactional
    public TeamMemberResponse update(Long id, TeamMemberRequest req) {
        TeamMember member = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", id));

        int oldOrder = member.getDisplayOrder();
        int newOrder = req.getDisplayOrder() > 0 ? req.getDisplayOrder() : oldOrder;

        member.setName(req.getName().trim());
        member.setRole(req.getRole().trim());
        member.setEmail(req.getEmail().trim());
        member.setImageUrl(req.getImageUrl() != null ? req.getImageUrl().trim() : null);
        member.setBio(req.getBio() != null ? req.getBio().trim() : null);
        member.setExperience(req.getExperience() != null ? req.getExperience().trim() : null);
        member.setSkills(req.getSkills() != null ? req.getSkills().trim() : null);
        member.setDepartment(req.getEffectiveCategory());
        member.setFeatured(req.isFeatured());
        member.setActive(req.isActive());

        if (oldOrder != newOrder) {
            List<TeamMember> allMembers = repository.findAllByOrderByDisplayOrderAscIdAsc();
            List<TeamMember> modified = OrderRebalanceUtil.reorder(
                    allMembers, id, newOrder,
                    TeamMember::getId, TeamMember::getDisplayOrder, TeamMember::setDisplayOrder);
            if (!modified.isEmpty()) {
                repository.saveAll(modified);
            }
        } else {
            repository.save(member);
        }

        TeamMember refreshed = repository.findByIdAndDeletedAtIsNull(id).orElse(member);
        log.info("Updated team member: id={}, order={}", refreshed.getId(), refreshed.getDisplayOrder());
        return TeamMemberResponse.from(refreshed);
    }

    @Transactional
    public TeamMemberResponse updateOrder(Long id, int targetOrder) {
        TeamMember member = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", id));

        List<TeamMember> allMembers = repository.findAllByOrderByDisplayOrderAscIdAsc();
        List<TeamMember> modified = OrderRebalanceUtil.reorder(
                allMembers, id, targetOrder,
                TeamMember::getId, TeamMember::getDisplayOrder, TeamMember::setDisplayOrder);

        if (!modified.isEmpty()) {
            repository.saveAll(modified);
        }

        TeamMember refreshed = repository.findByIdAndDeletedAtIsNull(id).orElse(member);
        return TeamMemberResponse.from(refreshed);
    }

    @Transactional
    public void delete(Long id) {
        TeamMember member = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", id));
        member.setDeletedAt(LocalDateTime.now());
        repository.save(member);

        // Rebalance remaining members to close gaps
        List<TeamMember> remaining = repository.findAllByOrderByDisplayOrderAscIdAsc();
        List<TeamMember> modified = OrderRebalanceUtil.rebalance(
                remaining, TeamMember::getDisplayOrder, TeamMember::setDisplayOrder);
        if (!modified.isEmpty()) {
            repository.saveAll(modified);
        }

        log.info("Deleted team member: id={}", id);
    }
}
