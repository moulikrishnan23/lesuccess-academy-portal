package in.lesuccess.portal.demobooking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoBookingRequest {

    private Long courseId;

    @Getter(AccessLevel.NONE)
    private String mobileNumber;

    @NotBlank(message = "Mobile number is required")
    @Pattern(
            regexp = "^(\\+91[6-9]\\d{9}|[6-9]\\d{9})$",
            message = "Mobile must be a valid Indian number (+91XXXXXXXXXX or 10 digits starting with 6-9)"
    )
    public String getMobileNumber() {
        return mobileNumber == null ? null : mobileNumber.replaceAll("\\s+", "");
    }
}
