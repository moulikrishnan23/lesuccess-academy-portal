package in.lesuccess.portal.chatbot;

import java.util.List;

/**
 * POST /api/chat body.
 *
 * @param sessionId the conversation's server-issued id, new when the request had
 *                  none. A bearer secret; see ExpiringChatMemoryRepository.
 * @param sources   the website pages behind the retrieved knowledge used for this
 *                  reply, de-duplicated. Empty when the answer came from tools alone.
 */
public record ChatbotResponse(String sessionId, String reply, List<Source> sources) {

    public record Source(String type, String sourceUrl) {
    }
}
