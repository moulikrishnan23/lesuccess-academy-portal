package in.lesuccess.portal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Public-facing contact form submission payload.
 * The 'website' field is a honeypot — real users never see it.
 * Bots that auto-fill every input will populate it.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 160, message = "Email must not exceed 160 characters")
    private String email;

    private String phone;

    @NotBlank(message = "Please tell us who you are")
    @Size(max = 120, message = "Who you are must not exceed 120 characters")
    private String whoYouAre;

    @NotBlank(message = "Please tell us what you are looking for")
    @Size(max = 120, message = "Looking for must not exceed 120 characters")
    private String lookingFor;

    @NotBlank(message = "Location is required")
    @Size(max = 160, message = "Location must not exceed 160 characters")
    private String location;

    @NotBlank(message = "Message is required")
    @Size(max = 5000, message = "Message must not exceed 5000 characters")
    private String message;

    /**
     * Honeypot field — must arrive empty. No validation annotations;
     * any value is accepted but triggers silent discard in the service.
     */
    private String website;

    /**
     * Returns the phone number with all whitespace removed, and carries the phone
     * constraints so they are evaluated against the normalised value.
     * <p>
     * The constraints live on this getter rather than on the field deliberately.
     * Bean Validation runs when {@code @Valid} is resolved — before the controller,
     * and therefore before any service code — so normalising downstream in
     * ContactService meant a realistically formatted "+91 98765 43210" was rejected
     * with 400 and the stripping logic was never reached. Property-level constraints
     * are validated against what the getter returns, which makes the ordering
     * guaranteed no matter how Jackson binds the field (setter or constructor).
     * <p>
     * The regex itself is unchanged.
     */
    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\+91[6-9]\\d{9}|[6-9]\\d{9})$",
            message = "Phone must be a valid Indian mobile number (+91XXXXXXXXXX or 10 digits starting with 6-9)"
    )
    public String getPhone() {
        return phone == null ? null : phone.replaceAll("\\s+", "");
    }
}
