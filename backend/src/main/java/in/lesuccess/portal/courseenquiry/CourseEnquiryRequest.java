package in.lesuccess.portal.courseenquiry;

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
public class CourseEnquiryRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    @Getter(AccessLevel.NONE)
    private String mobile;

    /**
     * Optional — the modal marks only Name and Mobile Number as required.
     *
     * <p>Optional-but-validated is the project's existing convention for this
     * field: {@code LeadRequest.email} carries the same {@code @Email} +
     * {@code @Size} pair with no {@code @NotBlank}. Only
     * {@code ContactMessageRequest} requires an email, because the Contact page
     * asks for one outright.</p>
     */
    @Email(message = "Please provide a valid email address")
    @Size(max = 160, message = "Email must not exceed 160 characters")
    private String email;

    @Size(max = 160, message = "Location must not exceed 160 characters")
    private String location;

    /**
     * Optional. When present, {@link CourseEnquiryService} additionally requires
     * it to name a published course — an existence check needs a repository, so
     * it cannot live on an annotation here.
     */
    private Long courseId;

    @Size(max = 120, message = "Currently-you-are must not exceed 120 characters")
    private String currentStatus;

    @Size(max = 2000, message = "Query must not exceed 2000 characters")
    private String query;

    private String message;

    public String getEffectiveQuery() {
        if (query != null && !query.isBlank()) return query.trim();
        if (message != null && !message.isBlank()) return message.trim();
        return null;
    }

    /** Honeypot field — must arrive empty. Never persisted. */
    private String website;

    /**
     * Required, and normalised at binding time so "+91 98765 43210" and
     * "+919876543210" are the same value by the time validation and duplicate
     * detection see it. Same accessor-level trick, and the same regex, as
     * {@code ContactMessageRequest#getPhone} and {@code LeadRequest#getMobile}.
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
