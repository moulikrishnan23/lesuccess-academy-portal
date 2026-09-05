package in.lesuccess.portal.contact;

import com.fasterxml.jackson.annotation.JsonAlias;
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
public class ContactMessageRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 160, message = "Email must not exceed 160 characters")
    private String email;

    /**
     * The Contact page posts this field as {@code mobile}, not {@code phone}
     * (see frontend/src/pages/Contact.jsx). Rather than rename the column, the
     * entity and every admin response for one form's benefit, the alias is
     * accepted on the way in: both spellings deserialize into this field, and
     * everything downstream keeps calling it phone.
     */
    @Getter(AccessLevel.NONE)
    @JsonAlias("mobile")
    private String phone;

    /**
     * Optional from here down.
     *
     * <p>These four were @NotBlank, which the Contact page cannot satisfy: it
     * only guards name, mobile and email before submitting, so a visitor who
     * leaves "Who you are?" or the message empty got a 400 with no field-level
     * hint anywhere in the UI. The form is the contract, so the required set
     * matches it — name, email and a reachable phone number — and the rest is
     * recorded as whatever was supplied. @Size still caps every value so an
     * over-long string is rejected before it can hit the column limit.</p>
     */
    @Size(max = 120, message = "Who you are must not exceed 120 characters")
    private String whoYouAre;

    @Size(max = 120, message = "Looking for must not exceed 120 characters")
    private String lookingFor;

    @Size(max = 160, message = "Location must not exceed 160 characters")
    private String location;

    @Size(max = 5000, message = "Message must not exceed 5000 characters")
    private String message;

    /** Honeypot field — must arrive empty. */
    private String website;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\+91[6-9]\\d{9}|[6-9]\\d{9})$",
            message = "Phone must be a valid Indian mobile number (+91XXXXXXXXXX or 10 digits starting with 6-9)"
    )
    public String getPhone() {
        return phone == null ? null : phone.replaceAll("\\s+", "");
    }
}
