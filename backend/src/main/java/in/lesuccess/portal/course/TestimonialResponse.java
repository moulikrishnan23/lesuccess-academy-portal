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
    private String quoteText;   // alias for reviewText (frontend compatibility)
    private int rating;
    private int ratingValue;    // alias for rating (frontend compatibility)
    private String source;
    private String reviewDate;
    private String reviewerRole;
    private int likesCount;
    private String photoUrl;
    private int displayOrder;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TestimonialResponse from(Testimonial entity) {
        return TestimonialResponse.builder()
                .id(entity.getId())
                .courseId(entity.getCourse() != null ? entity.getCourse().getId() : null)
                .studentName(entity.getStudentName())
                .reviewText(entity.getReviewText())
                .quoteText(entity.getReviewText())
                .rating(entity.getRating())
                .ratingValue(entity.getRating())
                .source(entity.getSource() != null ? entity.getSource() : "Google")
                .reviewDate(entity.getReviewDate())
                .reviewerRole(entity.getReviewerRole())
                .likesCount(entity.getLikesCount())
                .photoUrl(entity.getPhotoUrl())
                .displayOrder(entity.getDisplayOrder())
                .isActive(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
