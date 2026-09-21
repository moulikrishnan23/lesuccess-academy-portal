package in.lesuccess.portal.announcement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementRequest {

    @NotBlank(message = "Announcement text is required")
    @Size(max = 500, message = "Text must not exceed 500 characters")
    private String text;

    @Size(max = 50, message = "Link label must not exceed 50 characters")
    private String linkLabel;

    @Size(max = 255, message = "Link URL must not exceed 255 characters")
    private String linkUrl;
}
