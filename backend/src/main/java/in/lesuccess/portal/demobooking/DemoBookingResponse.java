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
    private String courseName;
    private String mobileNumber;
    private DemoBookingStatus status;
    private LocalDateTime createdAt;

    public static DemoBookingResponse from(DemoBooking entity) {
        return DemoBookingResponse.builder()
                .id(entity.getId())
                .courseName(entity.getCourseName())
                .mobileNumber(entity.getMobileNumber())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
