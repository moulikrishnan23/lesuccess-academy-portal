package in.lesuccess.portal.teammember;

import in.lesuccess.portal.shared.media.CloudinaryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamMemberServiceTest {

    @Mock
    private TeamMemberRepository repository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private TeamMemberService teamMemberService;

    @Test
    @DisplayName("Should create team member with only mandatory Name and all optional fields null/empty")
    void shouldCreateMemberWithOnlyName() {
        TeamMemberRequest request = TeamMemberRequest.builder()
                .name("Jane Doe")
                .role(null)
                .email(null)
                .imageUrl(null)
                .bio(null)
                .experience(null)
                .skills(null)
                .category(null)
                .department(null)
                .isFeatured(false)
                .build();

        when(repository.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(new ArrayList<>());
        when(repository.save(any(TeamMember.class))).thenAnswer(invocation -> {
            TeamMember m = invocation.getArgument(0);
            m.setId(101L);
            return m;
        });

        TeamMemberResponse response = teamMemberService.create(request);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Jane Doe");
        assertThat(response.getRole()).isNull();
        assertThat(response.getEmail()).isNull();
        assertThat(response.getCategory()).isNull(); // None / no category
    }

    @Test
    @DisplayName("Should create team member with category 'None' and result in null department")
    void shouldCreateMemberWithCategoryNone() {
        TeamMemberRequest request = TeamMemberRequest.builder()
                .name("Alex Smith")
                .category("None")
                .department("None")
                .build();

        when(repository.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(new ArrayList<>());
        when(repository.save(any(TeamMember.class))).thenAnswer(invocation -> {
            TeamMember m = invocation.getArgument(0);
            m.setId(105L);
            return m;
        });

        TeamMemberResponse response = teamMemberService.create(request);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Alex Smith");
        assertThat(response.getCategory()).isNull();
    }

    @Test
    @DisplayName("Should create Management Visionaries member with Featured badge")
    void shouldCreateManagementVisionariesFeaturedMember() {
        TeamMemberRequest request = TeamMemberRequest.builder()
                .name("Rathinavel Rajagopal")
                .role("Director")
                .department("Management Visionaries")
                .isFeatured(true)
                .build();

        when(repository.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(new ArrayList<>());
        when(repository.save(any(TeamMember.class))).thenAnswer(invocation -> {
            TeamMember m = invocation.getArgument(0);
            m.setId(102L);
            return m;
        });

        TeamMemberResponse response = teamMemberService.create(request);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Rathinavel Rajagopal");
        assertThat(response.getRole()).isEqualTo("Director");
        assertThat(response.getCategory()).isEqualTo("Management Visionaries");
        assertThat(response.isFeatured()).isTrue();
        assertThat(response.isFeatured()).isEqualTo(response.isFeatured());
    }

    @Test
    @DisplayName("Should create Tech Visionaries member with Featured badge")
    void shouldCreateTechVisionariesFeaturedMember() {
        TeamMemberRequest request = TeamMemberRequest.builder()
                .name("Arun Kumar K")
                .role("Technical Lead")
                .department("Tech Visionaries")
                .isFeatured(true)
                .build();

        when(repository.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(new ArrayList<>());
        when(repository.save(any(TeamMember.class))).thenAnswer(invocation -> {
            TeamMember m = invocation.getArgument(0);
            m.setId(103L);
            return m;
        });

        TeamMemberResponse response = teamMemberService.create(request);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Arun Kumar K");
        assertThat(response.getCategory()).isEqualTo("Tech Visionaries");
        assertThat(response.isFeatured()).isTrue();
    }

    @Test
    @DisplayName("Should update team member category, featured status, and optional fields")
    void shouldUpdateMemberFields() {
        TeamMember existing = TeamMember.builder()
                .id(1L)
                .name("Old Name")
                .role("Old Role")
                .email("old@example.com")
                .department("Management Visionaries")
                .isFeatured(false)
                .displayOrder(1)
                .isActive(true)
                .build();

        when(repository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(TeamMember.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TeamMemberRequest updateRequest = TeamMemberRequest.builder()
                .name("Updated Name")
                .role("") // empty string should become null
                .email(null)
                .department("Tech Visionaries")
                .isFeatured(true)
                .build();

        TeamMemberResponse updated = teamMemberService.update(1L, updateRequest);

        assertThat(updated.getName()).isEqualTo("Updated Name");
        assertThat(updated.getRole()).isNull();
        assertThat(updated.getEmail()).isNull();
        assertThat(updated.getCategory()).isEqualTo("Tech Visionaries");
        assertThat(updated.isFeatured()).isTrue();
    }
}
