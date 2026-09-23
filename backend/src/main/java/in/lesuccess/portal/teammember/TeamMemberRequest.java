package in.lesuccess.portal.teammember;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120)
    private String name;

    @NotBlank(message = "Role is required")
    @Size(max = 120)
    private String role;

    @NotBlank(message = "Email is required")
    @Size(max = 160)
    private String email;

    @Size(max = 255)
    private String imageUrl;

    private String bio;

    @Size(max = 120)
    private String experience;

    @Size(max = 255)
    private String skills;

    @Size(max = 100)
    private String department;

    @Size(max = 100)
    private String category;

    private boolean isFeatured;
    private int displayOrder;

    @Builder.Default
    private boolean isActive = true;

    public String getEffectiveCategory() {
        if (category != null && !category.trim().isEmpty()) {
            return category.trim();
        }
        if (department != null && !department.trim().isEmpty()) {
            return department.trim();
        }
        return "Our Mentors";
    }
}
