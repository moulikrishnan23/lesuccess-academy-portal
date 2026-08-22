package in.lesuccess.portal.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialResponse {

    private Long id;
    private Long courseId;
    private String studentName;
    private String reviewText;
    private int rating;
    private String photoUrl;
    private int displayOrder;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TestimonialResponse from(Testimonial entity) {
        return TestimonialResponse.builder()
                .id(entity.getId())
                .courseId(entity.getCourse().getId())
                .studentName(entity.getStudentName())
                .reviewText(entity.getReviewText())
                .rating(entity.getRating())
                .photoUrl(entity.getPhotoUrl())
                .displayOrder(entity.getDisplayOrder())
                .isActive(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
