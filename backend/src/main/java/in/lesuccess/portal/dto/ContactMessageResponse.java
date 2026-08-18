package in.lesuccess.portal.dto;

import in.lesuccess.portal.model.ContactMessage;
import in.lesuccess.portal.model.ContactMessageStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Admin-facing view of a contact message.
 * Excludes ipAddress (internal-only) and deletedAt.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String whoYouAre;
    private String lookingFor;
    private String location;
    private String message;
    private ContactMessageStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ContactMessageResponse from(ContactMessage entity) {
        return ContactMessageResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .whoYouAre(entity.getWhoYouAre())
                .lookingFor(entity.getLookingFor())
                .location(entity.getLocation())
                .message(entity.getMessage())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
