package in.lesuccess.portal.shared.exception;

/**
 * The chatbot's language model could not produce a reply — provider outage,
 * quota exhausted, bad key, timeout.
 *
 * <p>Maps to 503 with a fixed generic message. The cause is kept for the server
 * log only: provider errors can carry request details, quota identifiers or key
 * fragments, none of which may reach a public visitor.</p>
 */
public class ChatbotUnavailableException extends RuntimeException {

    public ChatbotUnavailableException(Throwable cause) {
        super("Chatbot model call failed", cause);
    }
}
