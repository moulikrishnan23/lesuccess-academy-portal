package in.lesuccess.portal.demobooking;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoBookingStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private DemoBookingStatus status;
}
