package in.lesuccess.portal.chatbot;

import in.lesuccess.portal.shared.exception.ChatbotUnavailableException;
import in.lesuccess.portal.shared.exception.InvalidRequestException;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.document.Document;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@ConditionalOnProperty(name = "chatbot.enabled", havingValue = "true")
@RequiredArgsConstructor
public class ChatService {

    /**
     * Deliberately vague: it does not say whether the id never existed or has
     * expired, so the endpoint cannot be used to probe which ids are live.
     */
    static final String INVALID_SESSION_MESSAGE = "This chat session is no longer valid. Please start a new chat.";

    private final ChatClient chatbotChatClient;
    private final ExpiringChatMemoryRepository sessions;

    /**
     * One conversational turn. No sessionId issues a new session. A sessionId must
     * be one this server issued that has not expired, otherwise the request gets a
     * 400 and no memory is created for it. Any failure inside the model call becomes
     * {@link ChatbotUnavailableException}, and from there a generic 503.
     */
    public ChatbotResponse chat(ChatbotRequest request) {
        String sessionId = resolveSession(request.getSessionId());

        ChatResponse response;
        try {
            response = chatbotChatClient.prompt()
                    .user(request.getMessage())
                    .advisors(advisor -> advisor.param(ChatMemory.CONVERSATION_ID, sessionId))
                    .call()
                    .chatResponse();
        } catch (RuntimeException ex) {
            throw new ChatbotUnavailableException(ex);
        }

        String reply = response == null || response.getResult() == null
                ? null
                : response.getResult().getOutput().getText();
        if (reply == null || reply.isBlank()) {
            throw new ChatbotUnavailableException(new IllegalStateException("Model returned an empty reply"));
        }

        return new ChatbotResponse(sessionId, reply.trim(), sourcesOf(response));
    }

    private String resolveSession(String requested) {
        if (requested == null || requested.isBlank()) {
            return sessions.issueSession();
        }
        if (!sessions.isActiveSession(requested)) {
            throw new InvalidRequestException(INVALID_SESSION_MESSAGE);
        }
        return requested;
    }

    /** Retrieved documents' (type, sourceUrl), de-duplicated, in retrieval order. */
    private static List<ChatbotResponse.Source> sourcesOf(ChatResponse response) {
        List<Document> retrieved = response.getMetadata().get(QuestionAnswerAdvisor.RETRIEVED_DOCUMENTS);
        if (retrieved == null) {
            return List.of();
        }
        return retrieved.stream()
                .map(document -> new ChatbotResponse.Source(
                        Objects.toString(document.getMetadata().get(ChatKnowledgeIndexer.META_TYPE), null),
                        Objects.toString(document.getMetadata().get(ChatKnowledgeIndexer.META_SOURCE_URL), null)))
                .filter(source -> source.sourceUrl() != null)
                .distinct()
                .toList();
    }
}
