package in.lesuccess.portal.contact;

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

    @Getter(AccessLevel.NONE)
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
