package in.lesuccess.portal.chatbot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotRequest {

    /**
     * Omit on the first message: the server issues one and returns it. Send it back
     * on follow-ups to continue the conversation. Only server-issued, unexpired ids
     * are accepted. It is a bearer secret for the conversation's history; see
     * ExpiringChatMemoryRepository.
     */
    @Size(max = 64, message = "Session id must not exceed 64 characters")
    private String sessionId;

    @NotBlank(message = "Message is required")
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;
}
