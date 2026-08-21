package in.lesuccess.portal.serviceoffering;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOfferingResponse {

    private Long id;
    private ServiceCategory category;
    private String title;
    private String description;
    private String iconUrl;
    private ServiceStatus status;
    private int displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ServiceOfferingResponse from(ServiceOffering entity) {
        return ServiceOfferingResponse.builder()
                .id(entity.getId())
                .category(entity.getCategory())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .iconUrl(entity.getIconUrl())
                .status(entity.getStatus())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
