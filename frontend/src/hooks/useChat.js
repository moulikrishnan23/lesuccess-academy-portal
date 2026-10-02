import { useCallback, useEffect, useRef, useState } from 'react'
import chatApi from '../services/chatApi.js'

/*
 * sessionStorage, never localStorage: the sessionId is a bearer secret for the
 * conversation's history on the server, so it should die with the tab, not
 * outlive it on a shared computer.
 */
export const SESSION_KEY = 'ls_chat_session'
export const MESSAGES_KEY = 'ls_chat_messages'
export const MAX_STORED_MESSAGES = 30
export const MAX_MESSAGE_LENGTH = 500

export const RATE_LIMIT_TEXT =
  "You're sending messages too quickly. Please wait a minute and try again."
export const UNAVAILABLE_TEXT =
  "I'm having trouble right now. Please try again shortly, or contact our team directly."

function readStorage(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    if (value === null || value === undefined) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked (private mode): the chat still works, it just won't persist */
  }
}

/** Accept only well-formed messages back from storage; anything else is dropped. */
function loadMessages() {
  const stored = readStorage(MESSAGES_KEY, [])
  if (!Array.isArray(stored)) return []
  return stored
    .filter((m) => m && typeof m.id === 'string' && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string')
    .slice(-MAX_STORED_MESSAGES)
}

function loadSessionId() {
  const stored = readStorage(SESSION_KEY, null)
  return typeof stored === 'string' && stored ? stored : null
}

let idCounter = 0
function nextId(role) {
  idCounter += 1
  return `${role}-${Date.now().toString(36)}-${idCounter}`
}

function botMessage(text, extra = {}) {
  return { id: nextId('bot'), role: 'bot', text, ...extra }
}

/**
 * The chatbot conversation: messages, the server-issued session, and the send
 * lifecycle. Pure state; ChatWindow renders it.
 *
 * status:
 *   'idle'     ready to send
 *   'sending'  a request is in flight; send() is a no-op until it settles
 *   'disabled' the server answered 404 (chatbot switched off); the widget hides
 *
 * @returns {{ messages: Object[], status: string, send: Function, reset: Function }}
 */
export default function useChat() {
  const [messages, setMessages] = useState(loadMessages)
  const [status, setStatus] = useState('idle')

  const sessionIdRef = useRef(loadSessionId())
  // Second line of defence against duplicate submits: the button is disabled
  // while sending, but a fast double Enter can beat the re-render.
  const inFlightRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    writeStorage(MESSAGES_KEY, messages.slice(-MAX_STORED_MESSAGES))
  }, [messages])

  const setSessionId = useCallback((sessionId) => {
    sessionIdRef.current = sessionId || null
    writeStorage(SESSION_KEY, sessionIdRef.current)
  }, [])

  const reset = useCallback(() => {
    if (inFlightRef.current) return
    setSessionId(null)
    setMessages([])
    writeStorage(MESSAGES_KEY, null)
  }, [setSessionId])

  /**
   * @returns {Promise<boolean>} true when a reply arrived.
   */
  const send = useCallback(async (rawMessage) => {
    const message = typeof rawMessage === 'string' ? rawMessage.trim() : ''
    if (!message || message.length > MAX_MESSAGE_LENGTH) return false
    if (inFlightRef.current || status === 'disabled') return false

    inFlightRef.current = true
    setStatus('sending')
    const userMessage = { id: nextId('user'), role: 'user', text: message }
    setMessages((current) => [...current, userMessage])

    const settle = (update) => {
      if (!isMountedRef.current) return
      update()
    }

    try {
      let response
      try {
        response = await chatApi.sendChatMessage({ sessionId: sessionIdRef.current, message })
      } catch (error) {
        // 400 with a session means the server no longer knows it (expired, or
        // the backend restarted). Start over: drop the session and the history
        // it belonged to, keep the question just asked, and retry exactly once.
        if (error?.status === 400 && sessionIdRef.current) {
          setSessionId(null)
          writeStorage(MESSAGES_KEY, null)
          settle(() => setMessages([userMessage]))
          response = await chatApi.sendChatMessage({ sessionId: null, message })
        } else {
          throw error
        }
      }

      setSessionId(response.sessionId)
      settle(() => {
        setMessages((current) => [
          ...current,
          botMessage(response.reply, { sources: response.sources }),
        ])
        setStatus('idle')
      })
      return true
    } catch (error) {
      settle(() => {
        if (error?.status === 404) {
          // The chatbot is switched off server-side. Hide, and send nothing more.
          setStatus('disabled')
          return
        }
        setMessages((current) => [
          ...current,
          error?.status === 429
            ? botMessage(RATE_LIMIT_TEXT, { error: 'rate_limited' })
            : botMessage(UNAVAILABLE_TEXT, { error: 'unavailable' }),
        ])
        setStatus('idle')
      })
      return false
    } finally {
      inFlightRef.current = false
    }
  }, [setSessionId, status])

  return { messages, status, send, reset }
}
