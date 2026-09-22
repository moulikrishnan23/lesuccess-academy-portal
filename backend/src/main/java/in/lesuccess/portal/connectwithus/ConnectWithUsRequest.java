package in.lesuccess.portal.connectwithus;

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
public class ConnectWithUsRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    @Getter(AccessLevel.NONE)
    private String mobile;

    /**
     * Optional-but-validated, the project's existing convention for this field:
     * {@code LeadRequest.email} and {@code CourseEnquiryRequest.email} carry the
     * same {@code @Email} + {@code @Size} pair with no {@code @NotBlank}.
     *
     * <p>The Home form's own client-side guard currently treats Email ID as
     * required. Leaving the column and this DTO optional means a future copy
     * change on that section does not need a migration to go with it.</p>
     */
    @Email(message = "Please provide a valid email address")
    @Size(max = 160, message = "Email must not exceed 160 characters")
    private String email;

    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    private String message;

    /** Honeypot field — must arrive empty. Never persisted. */
    private String website;

    /**
     * Required, and normalised at binding time so "+91 98765 43210" and
     * "+919876543210" are the same value by the time validation and duplicate
     * detection see it. Same accessor-level trick, and the same regex, as
     * {@code CourseEnquiryRequest#getMobile} and {@code LeadRequest#getMobile}.
     *
     * <p>Blank collapses to null rather than passing "" through, so the
     * {@code @NotBlank} message is what a visitor sees for an empty field rather
     * than the much longer {@code @Pattern} one.</p>
     */
    @NotBlank(message = "Mobile number is required")
    @Pattern(
            regexp = "^(\\+91[6-9]\\d{9}|[6-9]\\d{9})$",
            message = "Mobile must be a valid Indian mobile number (+91XXXXXXXXXX or 10 digits starting with 6-9)"
    )
    public String getMobile() {
        if (mobile == null) {
            return null;
        }
        String stripped = mobile.replaceAll("\\s+", "");
        return stripped.isEmpty() ? null : stripped;
    }
}
