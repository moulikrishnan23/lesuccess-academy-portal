package in.lesuccess.portal.lead;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadResponse {

    private Long id;
    private String name;
    private String mobile;
    private String email;
    private Long courseId;
    private String courseName;
    private String learningMode;
    private String lookingFor;
    private LeadSource source;
    private LeadStatus status;
    private LocalDateTime createdAt;

    public String getPhoneNumber() {
        return mobile;
    }

    public String getPreferredCourse() {
        return courseName;
    }

    public static LeadResponse from(Lead entity) {
        return LeadResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .mobile(entity.getMobile())
                .email(entity.getEmail())
                .courseId(entity.getCourseId())
                .courseName(entity.getCourseName())
                .learningMode(entity.getLearningMode())
                .lookingFor(entity.getLookingFor())
                .source(entity.getSource())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
