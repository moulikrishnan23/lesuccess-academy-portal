package in.lesuccess.portal.chatbot;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Turns a committed content change into a debounced full re-index.
 *
 * <p>AFTER_COMMIT, so the rebuild reads what was actually saved and a rolled-back
 * edit never triggers one. {@code fallbackExecution} covers a write path that
 * someday runs without a transaction; without it the event would be dropped
 * silently.</p>
 *
 * <p>This must never block or fail the admin's save. {@code requestRebuild()} only
 * schedules work and returns, and anything it throws is logged and swallowed. The
 * admin's change is already committed by the time this runs.</p>
 *
 * <p><b>Multi-instance caveat:</b> Spring Events are in-process. With more than one
 * backend instance, only the instance that handled the save rebuilds its index.
 * The others keep serving their previous index until their own next change or
 * restart. If the backend is ever scaled out, this needs a shared signal, such as
 * a message broker, a DB-polled version number or a scheduled rebuild.</p>
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "chatbot.enabled", havingValue = "true")
@RequiredArgsConstructor
public class ChatKnowledgeChangeListener {

    private final ChatKnowledgeIndexer indexer;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onKnowledgeChanged(ChatKnowledgeChangedEvent event) {
        try {
            indexer.requestRebuild();
        } catch (RuntimeException ex) {
            log.error("Could not schedule a chat knowledge rebuild; the index stays as it was until the next change", ex);
        }
    }
}
