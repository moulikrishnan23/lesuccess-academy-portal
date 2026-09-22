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
    private String courseTitle;
    private String currentStatus;
    private String query;
    private LocalDateTime createdAt;

    public String getFullName() {
        return name;
    }

    public String getMobileNumber() {
        return mobile;
    }

    public String getCourseName() {
        return courseTitle;
    }

    public String getMessage() {
        if (query != null && !query.isBlank()) return query;
        return currentStatus;
    }

    public static CourseEnquiryResponse from(CourseEnquiry entity) {
        return from(entity, null);
    }

    public static CourseEnquiryResponse from(CourseEnquiry entity, String courseTitle) {
        return CourseEnquiryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .mobile(entity.getMobile())
                .email(entity.getEmail())
                .location(entity.getLocation())
                .courseId(entity.getCourseId())
                .courseTitle(courseTitle)
                .currentStatus(entity.getCurrentStatus())
                .query(entity.getQuery())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
