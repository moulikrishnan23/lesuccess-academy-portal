package in.lesuccess.portal.courseenquiry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnquiryResponse {

    private Long id;
    private String name;
    private String mobile;
    private String email;
    private String location;
    private Long courseId;
    private String currentStatus;
    private LocalDateTime createdAt;

    public static CourseEnquiryResponse from(CourseEnquiry entity) {
        return CourseEnquiryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .mobile(entity.getMobile())
                .email(entity.getEmail())
                .location(entity.getLocation())
                .courseId(entity.getCourseId())
                .currentStatus(entity.getCurrentStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
