import apiClient from './apiClient.js'
import { isMockEnabled, mockSendChatMessage } from '../mocks/mockGateway.js'

/**
 * Keep only what the UI may use from a reply. `sources` is passed through as
 * data; ChatWindow decides which of them are safe to render as links.
 */
function normalizeReply(raw) {
  return {
    sessionId: typeof raw?.sessionId === 'string' ? raw.sessionId : null,
    reply: typeof raw?.reply === 'string' ? raw.reply : '',
    sources: Array.isArray(raw?.sources) ? raw.sources : [],
  }
}

/**
 * POST /api/chat → 200 { sessionId, reply, sources }
 *
 * The body is NOT wrapped in ApiResponse, unlike the rest of the API, by the
 * chatbot's contract. Failures reject with an ApiError (see utils/apiError.js);
 * useChat branches on its `status`: 400, 404, 429, 503, or null for network.
 *
 * The sessionId is server-issued and is a bearer secret for the conversation,
 * so it is sent only when there is one, never invented here.
 */
export async function sendChatMessage({ sessionId, message }, { signal } = {}) {
  const body = { message }
  if (sessionId) body.sessionId = sessionId

  if (isMockEnabled()) {
    return normalizeReply(await mockSendChatMessage(body))
  }

  const { data } = await apiClient.post('/api/chat', body, { signal })
  return normalizeReply(data)
}

export default { sendChatMessage }
