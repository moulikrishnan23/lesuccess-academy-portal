package in.lesuccess.portal.demobooking;

import jakarta.validation.constraints.Email;
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
public class DemoBookingRequest {

    private Long courseId;

    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    @Email(message = "Please provide a valid email address")
    @Size(max = 160, message = "Email must not exceed 160 characters")
    private String email;

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
