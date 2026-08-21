package in.lesuccess.portal.demobooking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoBookingResponse {

    private Long id;
    private Long courseId;
    private String courseName;
    private String mobileNumber;
    private DemoBookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DemoBookingResponse from(DemoBooking entity) {
        return DemoBookingResponse.builder()
                .id(entity.getId())
                .courseId(entity.getCourse() != null ? entity.getCourse().getId() : null)
                .courseName(entity.getCourse() != null ? entity.getCourse().getName() : null)
                .mobileNumber(entity.getMobileNumber())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
