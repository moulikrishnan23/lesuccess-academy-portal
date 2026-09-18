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

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    @Email(message = "Email must be a valid email address")
    @Size(max = 160, message = "Email must not exceed 160 characters")
    private String email;

    @Size(max = 200, message = "Course name must not exceed 200 characters")
    private String courseName;

    @Getter(AccessLevel.NONE)
    private String mobileNumber;

    /** Honeypot field — must arrive empty. Never persisted. */
    private String website;

    @NotBlank(message = "Mobile number is required")
    @Pattern(
            regexp = "^(\\+91[6-9]\\d{9}|[6-9]\\d{9})$",
            message = "Mobile must be a valid Indian number (+91XXXXXXXXXX or 10 digits starting with 6-9)"
    )
    public String getMobileNumber() {
        return mobileNumber == null ? null : mobileNumber.replaceAll("\\s+", "");
    }
}
