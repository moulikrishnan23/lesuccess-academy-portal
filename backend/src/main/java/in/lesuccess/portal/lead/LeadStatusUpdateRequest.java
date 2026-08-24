package in.lesuccess.portal.lead;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private LeadStatus status;
}
