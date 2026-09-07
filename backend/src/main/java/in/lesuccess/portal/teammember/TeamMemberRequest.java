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

    private boolean isFeatured;
    private int displayOrder;

    @Builder.Default
    private boolean isActive = true;
}
