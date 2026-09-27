package in.lesuccess.portal.successstory;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SuccessStoryReelRequest {
    @NotBlank(message = "Reel URL is required")
    private String reelUrl;
    
    private String title;
    private Integer displayOrder;

    @JsonProperty("isActive")
    @JsonAlias({"active", "isActive", "enabled", "status"})
    private Boolean isActive;
}
