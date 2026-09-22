package in.lesuccess.portal.teammember;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {
    private Long id;
    private String name;
    private String role;
    private String email;
    private String image; // alias for imageUrl to match frontend
    private String imageUrl;
    private String bio;
    private String experience;
    private String skills;
    private String department;
    private String category; // alias for department / category
    private boolean featured; // alias for isFeatured to match frontend
    @SuppressWarnings("unused") // Used by Lombok builder and JSON serialization
    private boolean isFeatured;
    private int displayOrder;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TeamMemberResponse from(TeamMember member) {
        return TeamMemberResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .role(member.getRole())
                .email(member.getEmail())
                .image(member.getImageUrl())
                .imageUrl(member.getImageUrl())
                .bio(member.getBio())
                .experience(member.getExperience())
                .skills(member.getSkills())
                .department(member.getDepartment())
                .category(member.getDepartment())
                .featured(member.isFeatured())
                .isFeatured(member.isFeatured())
                .displayOrder(member.getDisplayOrder())
                .isActive(member.isActive())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}
