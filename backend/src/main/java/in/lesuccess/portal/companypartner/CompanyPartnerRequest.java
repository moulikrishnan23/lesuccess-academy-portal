package in.lesuccess.portal.companypartner;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyPartnerRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 120)
    private String name;

    @NotBlank(message = "Logo URL is required")
    @Size(max = 255)
    private String logoUrl;

    @Min(1)
    @Max(2)
    @Builder.Default
    private int rowNumber = 1;

    private int displayOrder;

    @Builder.Default
    private boolean isActive = true;
}
