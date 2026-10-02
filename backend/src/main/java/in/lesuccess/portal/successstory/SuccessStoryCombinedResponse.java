package in.lesuccess.portal.successstory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuccessStoryCombinedResponse {
    private List<SuccessStoryImageResponse> images;
    private List<SuccessStoryReelResponse> reels;
}
