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

    @Size(max = 120)
    private String role;

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

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Integer displayOrder = 0;

    @Builder.Default
    private Boolean isActive = true;

    public boolean isFeatured() {
        return Boolean.TRUE.equals(isFeatured);
    }

    public boolean isActive() {
        return isActive == null || isActive;
    }

    public int getDisplayOrder() {
        return displayOrder != null ? displayOrder : 0;
    }

    public String getEffectiveCategory() {
        if (category != null && !category.trim().isEmpty() && !category.trim().equalsIgnoreCase("none")) {
            return category.trim();
        }
        if (department != null && !department.trim().isEmpty() && !department.trim().equalsIgnoreCase("none")) {
            return department.trim();
        }
        return null;
    }
}
