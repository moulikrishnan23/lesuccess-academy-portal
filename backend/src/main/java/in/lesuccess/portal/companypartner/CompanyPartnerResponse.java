package in.lesuccess.portal.companypartner;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyPartnerResponse {
    private Long id;
    private String name;
    private String logo; // alias for logoUrl
    private String logoUrl;
    private int rowNumber;
    private int displayOrder;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CompanyPartnerResponse from(CompanyPartner partner) {
        return CompanyPartnerResponse.builder()
                .id(partner.getId())
                .name(partner.getName())
                .logo(partner.getLogoUrl())
                .logoUrl(partner.getLogoUrl())
                .rowNumber(partner.getRowNumber())
                .displayOrder(partner.getDisplayOrder())
                .isActive(partner.isActive())
                .createdAt(partner.getCreatedAt())
                .updatedAt(partner.getUpdatedAt())
                .build();
    }
}
