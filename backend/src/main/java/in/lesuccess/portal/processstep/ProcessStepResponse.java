package in.lesuccess.portal.processstep;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessStepResponse {

    private Long id;
    private int stepNumber;
    private String title;
    private String description;
    private String iconUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProcessStepResponse from(ProcessStep entity) {
        return ProcessStepResponse.builder()
                .id(entity.getId())
                .stepNumber(entity.getStepNumber())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .iconUrl(entity.getIconUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
