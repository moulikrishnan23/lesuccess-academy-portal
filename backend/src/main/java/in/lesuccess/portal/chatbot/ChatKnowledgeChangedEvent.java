package in.lesuccess.portal.chatbot;

/**
 * "Something the chatbot knows about changed" — published by the course, module,
 * tech-stack, service and process-step write paths.
 *
 * <p>No payload on purpose: the index is never patched per entity, every change
 * triggers a full, debounced rebuild (see {@link ChatKnowledgeIndexer}). Publishing
 * it is harmless when the chatbot is disabled — nothing listens.</p>
 */
public record ChatKnowledgeChangedEvent() {
}
