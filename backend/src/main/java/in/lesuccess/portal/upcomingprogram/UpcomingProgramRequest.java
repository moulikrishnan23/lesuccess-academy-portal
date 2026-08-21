package in.lesuccess.portal.upcomingprogram;

import jakarta.validation.constraints.FutureOrPresent;
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
    @FutureOrPresent(message = "Event date must be today or in the future")
    private LocalDate eventDate;

    private LocalTime startTime;
    private LocalTime endTime;

    @Size(max = 50, message = "Platform must not exceed 50 characters")
    private String platform;

    @Size(max = 255, message = "Meet link must not exceed 255 characters")
    private String meetLink;

    private boolean certificateIncluded;
    @lombok.Builder.Default
    private boolean isActive = true;
}
