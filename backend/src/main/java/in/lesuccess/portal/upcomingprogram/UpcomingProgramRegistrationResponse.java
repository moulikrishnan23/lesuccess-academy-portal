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
    private String programType;
    private String name;
    private String email;
    private String mobileNumber;
    private String mode;
    private String meetLink;
    private String venueAddress;
    private String locationInfo;
    private LocalDateTime createdAt;

    public String getFullName() {
        return name;
    }

    public String getPhoneNumber() {
        return mobileNumber;
    }

    public String getMobile() {
        return mobileNumber;
    }

    public static UpcomingProgramRegistrationResponse from(UpcomingProgramRegistration entity) {
        String pType = "";
        String pMode = entity.getMode();
        String pMeet = null;
        String pVenue = entity.getVenueAddress();

        if (entity.getProgram() != null) {
            if (entity.getProgram().getType() != null) {
                pType = entity.getProgram().getType().name();
            }
            if (pMode == null || pMode.isBlank()) {
                pMode = entity.getProgram().getMode() != null ? entity.getProgram().getMode() : "ONLINE";
            }
            pMeet = entity.getProgram().getMeetLink();
            if (pVenue == null || pVenue.isBlank()) {
                pVenue = entity.getProgram().getVenueAddress();
            }
        }

        String loc = "ONLINE".equalsIgnoreCase(pMode)
                ? (pMeet != null && !pMeet.isBlank() ? pMeet : "Google Meet")
                : (pVenue != null && !pVenue.isBlank() ? pVenue : "Campus / Offline");

        Long progId = entity.getProgram() != null ? entity.getProgram().getId() : entity.getProgramId();
        String progTitle = entity.getProgram() != null ? entity.getProgram().getTitle() : null;

        return UpcomingProgramRegistrationResponse.builder()
                .id(entity.getId())
                .programId(progId)
                .programTitle(progTitle)
                .programType(pType)
                .name(entity.getName())
                .email(entity.getEmail())
                .mobileNumber(entity.getMobileNumber())
                .mode(pMode)
                .meetLink(pMeet)
                .venueAddress(pVenue)
                .locationInfo(loc)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
