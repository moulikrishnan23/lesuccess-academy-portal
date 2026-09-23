package in.lesuccess.portal.upcomingprogram;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpcomingProgramRequest {

    @NotNull(message = "Program type is required")
    private UpcomingProgramType type;

    @Size(max = 50, message = "Label must not exceed 50 characters")
    private String label;

    @NotBlank(message = "Title is required")
    @Size(max = 120, message = "Title must not exceed 120 characters")
    private String title;

    @Size(max = 255, message = "Topic must not exceed 255 characters")
    private String topic;

    @NotNull(message = "Event date is required")
    private LocalDate eventDate;

    private LocalTime startTime;
    private LocalTime endTime;

    @Size(max = 50, message = "Platform must not exceed 50 characters")
    private String platform;

    @Size(max = 20, message = "Mode must not exceed 20 characters")
    @lombok.Builder.Default
    private String mode = "ONLINE";

    @Size(max = 255, message = "Meet link must not exceed 255 characters")
    private String meetLink;

    @Size(max = 255, message = "Venue address must not exceed 255 characters")
    private String venueAddress;

    @Size(max = 120, message = "Organization name must not exceed 120 characters")
    private String organizationName;

    @Size(max = 120, message = "Venue name must not exceed 120 characters")
    private String venueName;

    @Size(max = 120, message = "Speaker name must not exceed 120 characters")
    private String speakerName;

    @Size(max = 255, message = "Image URL must not exceed 255 characters")
    private String imageUrl;

    @JsonProperty("certificateIncluded")
    @lombok.Builder.Default
    private Boolean certificateIncluded = false;

    public boolean isCertificateIncluded() {
        return Boolean.TRUE.equals(certificateIncluded);
    }

    @JsonProperty("isActive")
    @JsonAlias({"active", "visibleOnSite", "is_active"})
    @lombok.Builder.Default
    private Boolean isActive = true;

    public boolean isActive() {
        return isActive == null || isActive;
    }
}
