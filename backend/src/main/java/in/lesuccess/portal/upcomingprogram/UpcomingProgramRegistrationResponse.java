package in.lesuccess.portal.upcomingprogram;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpcomingProgramRegistrationResponse {

    private Long id;
    private Long programId;
    private String programTitle;
    private String name;
    private String mobileNumber;
    private LocalDateTime createdAt;

    public static UpcomingProgramRegistrationResponse from(UpcomingProgramRegistration entity) {
        return UpcomingProgramRegistrationResponse.builder()
                .id(entity.getId())
                .programId(entity.getProgram().getId())
                .programTitle(entity.getProgram().getTitle())
                .name(entity.getName())
                .mobileNumber(entity.getMobileNumber())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
