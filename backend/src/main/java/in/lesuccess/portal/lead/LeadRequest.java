package in.lesuccess.portal.lead;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class LeadRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    @Getter(AccessLevel.NONE)
    private String mobile;

    /** Optional — the Service page CTA asks for it but does not require it. */
    @Email(message = "Please provide a valid email address")
    @Size(max = 160, message = "Email must not exceed 160 characters")
    private String email;

    /** Optional; unused by the Service form, carried for the course enrolment form. */
    private Long courseId;

    @Size(max = 120, message = "Looking for must not exceed 120 characters")
    private String lookingFor;

    @NotNull(message = "Source is required")
    private LeadSource source;

    /** Honeypot field — must arrive empty. Never persisted. */
    private String website;

    /**
     * Normalised at binding time so "+91 98765 43210" and "+919876543210" are
     * the same value by the time validation and duplicate detection see it —
     * matching ContactMessageRequest#getPhone, which solved the same problem.
     *
     * <p>Optional. The Service page CTA collects a name, an email and a subject
     * but no phone number, so a blank mobile is a valid submission there.
     * {@link LeadService} still requires one for {@code COURSE_ENROLL_FORM},
     * where a caller-back number is the point of the form — the rule is
     * per-source, which a field-level annotation cannot express.</p>
     *
     * <p>Blank collapses to null rather than passing "" through: {@code @Pattern}
     * skips a null but rejects an empty string, so returning "" would fail
     * validation for a field that is meant to be omittable.</p>
     */
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
