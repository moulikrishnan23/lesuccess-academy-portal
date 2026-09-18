package in.lesuccess.portal.teammember;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findAllByIsActiveTrueOrderByDisplayOrderAscIdAsc();
    List<TeamMember> findAllByOrderByDisplayOrderAscIdAsc();
    Optional<TeamMember> findByIdAndDeletedAtIsNull(Long id);
}
