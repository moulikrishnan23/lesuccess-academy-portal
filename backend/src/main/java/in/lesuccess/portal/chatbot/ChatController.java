package in.lesuccess.portal.chatbot;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public website chatbot.
 *
 * <p>No SecurityConfig entry is needed: /api/chat falls through to
 * {@code anyRequest().permitAll()}. Throttled per IP by RateLimitFilter
 * (lesuccess.rate-limit.per-minute-paths). With {@code chatbot.enabled=false}
 * this controller does not exist and the path returns 404.</p>
 *
 * <p>The body is {@code {reply, sources}} directly, not wrapped in ApiResponse,
 * per the chatbot API contract. Errors still use the shared ApiResponse error
 * shape via GlobalExceptionHandler.</p>
 */
@RestController
@RequestMapping("/api/chat")
@ConditionalOnProperty(name = "chatbot.enabled", havingValue = "true")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatbotResponse> chat(@Valid @RequestBody ChatbotRequest request) {
        return ResponseEntity.ok(chatService.chat(request));
    }
}
