package in.lesuccess.portal.upcomingprogram;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpcomingProgramResponse {

    private Long id;
    private UpcomingProgramType type;
    private String label;
    private String title;
    private String topic;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String platform;
    private String meetLink;
    private boolean certificateIncluded;
    private boolean isActive;
    private long registrationCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UpcomingProgramResponse from(UpcomingProgram entity) {
        return UpcomingProgramResponse.builder()
                .id(entity.getId())
                .type(entity.getType())
                .label(entity.getLabel())
                .title(entity.getTitle())
                .topic(entity.getTopic())
                .eventDate(entity.getEventDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .platform(entity.getPlatform())
                .meetLink(entity.getMeetLink())
                .certificateIncluded(entity.isCertificateIncluded())
                .isActive(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static UpcomingProgramResponse from(UpcomingProgram entity, long registrationCount) {
        UpcomingProgramResponse response = from(entity);
        response.setRegistrationCount(registrationCount);
        return response;
    }
}
