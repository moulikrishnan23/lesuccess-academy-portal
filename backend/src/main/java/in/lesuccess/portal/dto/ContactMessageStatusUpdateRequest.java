package in.lesuccess.portal.dto;


import in.lesuccess.portal.model.ContactMessageStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for updating a contact message's status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ContactMessageStatus status;
}
