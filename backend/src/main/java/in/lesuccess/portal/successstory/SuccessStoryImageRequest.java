package in.lesuccess.portal.successstory;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SuccessStoryImageRequest {
    @NotBlank(message = "Image URL is required")
    private String imageUrl;
    
    private String caption;
    private Integer displayOrder;

    @JsonProperty("isActive")
    @JsonAlias({"active", "isActive", "enabled", "status"})
    private Boolean isActive;
}
