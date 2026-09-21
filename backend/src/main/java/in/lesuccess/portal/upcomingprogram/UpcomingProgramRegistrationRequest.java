package in.lesuccess.portal.upcomingprogram;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
public class UpcomingProgramRegistrationRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

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
