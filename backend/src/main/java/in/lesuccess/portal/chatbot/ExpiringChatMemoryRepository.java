package in.lesuccess.portal.chatbot;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Ticker;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.messages.Message;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

/**
 * Server-issued chat sessions and their history, in one expiring cache.
 *
 * <p>A session exists only because {@link #issueSession()} created it. The cache
 * entry IS the issued id, so an id and its conversation expire together after
 * {@code idleTimeout} without use, and the total is capped at {@code maxSessions}.
 * {@link #saveAll} never creates an entry: memory for an id the server did not
 * issue, or one that has expired, is silently dropped rather than stored.</p>
 *
 * <p>The 10-message window per session is enforced separately by
 * MessageWindowChatMemory.</p>
 *
 * <p><b>A sessionId is a bearer secret:</b> anyone holding it can continue that
 * conversation and have its history fed back into the model. That is why ids are
 * random UUIDs issued by the server, never chosen by the client, and never logged.</p>
 */
public class ExpiringChatMemoryRepository implements ChatMemoryRepository {

    private final Cache<String, List<Message>> sessions;

    public ExpiringChatMemoryRepository(Duration idleTimeout, long maxSessions) {
        this(idleTimeout, maxSessions, Ticker.systemTicker());
    }

    /** Tests pass a controllable ticker to expire sessions without waiting. */
    ExpiringChatMemoryRepository(Duration idleTimeout, long maxSessions, Ticker ticker) {
        this.sessions = Caffeine.newBuilder()
                .expireAfterAccess(idleTimeout)
                .maximumSize(maxSessions)
                .ticker(ticker)
                .build();
    }

    /** Creates a new, empty session and returns its id. */
    public String issueSession() {
        String sessionId = UUID.randomUUID().toString();
        sessions.put(sessionId, List.of());
        return sessionId;
    }

    /** True only for an id this server issued that has not expired. Counts as use. */
    public boolean isActiveSession(String sessionId) {
        return sessionId != null && sessions.getIfPresent(sessionId) != null;
    }

    @Override
    public List<String> findConversationIds() {
        return List.copyOf(sessions.asMap().keySet());
    }

    @Override
    public List<Message> findByConversationId(String conversationId) {
        List<Message> messages = sessions.getIfPresent(conversationId);
        return messages != null ? messages : List.of();
    }

    /** Updates an existing session only. Never creates one; see the class comment. */
    @Override
    public void saveAll(String conversationId, List<Message> messages) {
        sessions.asMap().computeIfPresent(conversationId, (id, previous) -> List.copyOf(messages));
    }

    @Override
    public void deleteByConversationId(String conversationId) {
        sessions.invalidate(conversationId);
    }
}
