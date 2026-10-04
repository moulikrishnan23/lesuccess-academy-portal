import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, RotateCcw, SendHorizontal, X, Sparkles } from 'lucide-react'
import LeBotWelcomeBubble from './LeBotWelcomeBubble.jsx'

let msgIdCounter = 0
function createMsgId(role) {
  msgIdCounter += 1
  return `${role}-${msgIdCounter}`
}

function getFormattedTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const GREETING = "Hi! 👋 Welcome to **LeSuccess Academy**. I'm **LeBot**! How can I help you today? You can ask about our courses, placement support, fees, syllabus, or contact details."

const QUICK_SUGGESTIONS = [
  'What courses do you offer?',
  'Full Stack Java details',
  'Python Full Stack details',
  'Placement & internship support',
  'Course duration & timings',
  'How can I contact LeSuccess?',
]

/**
 * Predefined Knowledge Base & Rule Matcher
 */
const KNOWLEDGE_BASE = [
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'start', 'greetings', 'help'],
    response: "Hello! Welcome to **LeSuccess Academy**. I'm **LeBot**, here to guide you toward a rewarding career in tech. What would you like to know about today?",
    links: [
      { label: 'Explore Courses', url: '/courses' },
      { label: 'Contact Us', url: '/contact' },
    ],
  },
  {
    id: 'courses',
    keywords: [
      'course', 'courses', 'available courses', 'what do you offer', 'programs',
      'programs offered', 'curriculum', 'all courses', 'tech stack', 'what courses do you have',
      'course list', 'learning tracks',
    ],
    response: "We offer career-oriented IT courses featuring real-world projects, expert mentorship, and dedicated placement assistance:\n\n• **Full Stack Java Development**\n• **Python Full Stack Development**\n• **MERN Full Stack Development**\n• **Data Analytics & Power BI**\n• **Data Science & Machine Learning**\n• **AWS Cloud & DevOps**\n• **Software Testing & QA**\n• **Digital Marketing**",
    links: [
      { label: 'View All Courses', url: '/courses' },
      { label: 'Upcoming Programs', url: '/programs' },
    ],
  },
  {
    id: 'java',
    keywords: ['java', 'spring', 'spring boot', 'hibernate', 'full stack java', 'core java', 'j2ee'],
    response: "Our **Full Stack Java Course** is designed for modern enterprise software development:\n\n• **Core & Advanced Java** (OOP, Collections, Streams, Concurrency)\n• **Spring Framework & Spring Boot** (REST APIs, Microservices)\n• **Hibernate & JPA** with MySQL/PostgreSQL\n• **Frontend Integration:** React.js, HTML5, CSS3, Tailwind\n• **Tools:** Git, Maven, Docker & Postman\n• Real-world capstone portfolio projects.",
    links: [
      { label: 'Browse Java Courses', url: '/courses' },
      { label: 'Talk to an Advisor', action: 'enquiry' },
    ],
  },
  {
    id: 'python',
    keywords: ['python', 'django', 'flask', 'fastapi', 'full stack python', 'python course', 'python development'],
    response: "Our **Python Full Stack Course** takes you from basic programming to advanced production web apps:\n\n• **Python Mastery:** Data structures, OOP, Functional Python\n• **Web Frameworks:** Django & FastAPI RESTful APIs\n• **Frontend:** Modern React.js & responsive UI\n• **Databases:** PostgreSQL, MySQL & MongoDB\n• **Deployment:** Cloud hosting, Docker, and CI/CD basics.",
    links: [
      { label: 'Browse Courses', url: '/courses' },
      { label: 'Enquire for Syllabus', action: 'enquiry' },
    ],
  },
  {
    id: 'mern',
    keywords: ['mern', 'react', 'node', 'nodejs', 'express', 'expressjs', 'mongodb', 'javascript full stack'],
    response: "Our **MERN Full Stack Course** covers end-to-end JavaScript/TypeScript engineering:\n\n• **MongoDB:** Schema modeling & aggregation pipelines\n• **Express.js & Node.js:** Scalable REST APIs & authentication (JWT)\n• **React.js:** Modern hooks, state management, Vite & Tailwind\n• **Full Stack Capstones:** Live SaaS application development.",
    links: [
      { label: 'Explore MERN Curriculum', url: '/courses' },
    ],
  },
  {
    id: 'data_analytics_science',
    keywords: [
      'data', 'analytics', 'data analytics', 'data science', 'power bi', 'tableau',
      'excel', 'machine learning', 'ai', 'sql', 'pandas', 'matplotlib',
    ],
    response: "Our **Data Analytics & Data Science Programs** provide high-demand analytical training:\n\n• **SQL & Advanced Excel** for business intelligence\n• **Power BI & Tableau** for dashboarding and reporting\n• **Python for Data Science:** Pandas, NumPy, Seaborn\n• **Machine Learning:** Predictive modeling & real case studies.",
    links: [
      { label: 'Explore Data Courses', url: '/courses' },
      { label: 'Talk to Team', action: 'enquiry' },
    ],
  },
  {
    id: 'cloud_devops',
    keywords: ['aws', 'cloud', 'devops', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'cloud computing'],
    response: "Our **AWS & DevOps Program** covers essential cloud architecture:\n\n• **AWS Core Services:** EC2, S3, RDS, VPC, IAM, Lambda\n• **Containers & Orchestration:** Docker & Kubernetes\n• **Automation:** CI/CD pipelines, Git, and Linux administration\n• **Infrastructure as Code:** Terraform fundamentals.",
    links: [
      { label: 'View DevOps Track', url: '/courses' },
    ],
  },
  {
    id: 'placement',
    keywords: [
      'placement', 'job', 'jobs', 'career', 'hiring', 'interview', 'package',
      'recruit', 'recruiter', 'recruiters', 'companies', 'guarantee', 'internship', 'hire',
    ],
    response: "Yes! LeSuccess Academy provides comprehensive **Placement Support**:\n\n• Resume optimization & LinkedIn profile building\n• Dedicated interview prep & mock technical assessments with mentors\n• Soft skills, aptitude, and communication coaching\n• Exclusive recruitment drives with 50+ hiring company partners.",
    links: [
      { label: 'Success Stories', url: '/success-stories' },
      { label: 'Connect With Placements', url: '/contact' },
    ],
  },
  {
    id: 'contact',
    keywords: [
      'contact', 'call', 'phone', 'mobile', 'email', 'address', 'location',
      'reach', 'office', 'branch', 'map', 'where are you', 'locate',
    ],
    response: "You can easily get in touch with LeSuccess Academy:\n\n📞 **Phone / WhatsApp:** +91 99622 28445\n✉️ **Email:** info@lesuccess.in\n📍 **Location:** Chennai, Tamil Nadu, India\n\nFeel free to visit our Contact page or submit a callback request!",
    links: [
      { label: 'Go to Contact Page', url: '/contact' },
      { label: 'Book Callback', action: 'enquiry' },
    ],
  },
  {
    id: 'duration_timings',
    keywords: [
      'duration', 'timing', 'timings', 'schedule', 'batch', 'batches',
      'weekend', 'weekday', 'hours', 'how long', 'online', 'offline', 'mode',
    ],
    response: "Here are our batch schedules and timings:\n\n• **Duration:** 3 to 5 months (depending on track)\n• **Weekday Batches:** Morning and Evening live sessions\n• **Weekend Batches:** Specially tailored for college students & working professionals\n• **Mode:** Available in both Classroom (Offline) & Interactive Online formats with recorded sessions.",
    links: [
      { label: 'Check Upcoming Batches', url: '/programs' },
    ],
  },
  {
    id: 'fees',
    keywords: ['fee', 'fees', 'cost', 'price', 'pricing', 'discount', 'scholarship', 'emi', 'installment', 'pay', 'payment'],
    response: "Our fee structure is transparent, affordable, and includes flexible **0% EMI and installment options**.\n\nBecause fees vary based on the specialization, batch mode, and current scholarship discounts, please speak with an admissions advisor for the latest offer.",
    links: [
      { label: 'Talk to Admissions', action: 'enquiry' },
      { label: 'Contact Us', url: '/contact' },
    ],
  },
  {
    id: 'webinars_workshops',
    keywords: ['webinar', 'workshop', 'workshops', 'event', 'events', 'seminar', 'upcoming', 'free session'],
    response: "LeSuccess regularly hosts free tech masterclasses, interactive coding workshops, and webinar bootcamps with industry experts.\n\nBrowse our Upcoming Programs page to see current events and register for free!",
    links: [
      { label: 'Upcoming Programs', url: '/programs' },
    ],
  },
  {
    id: 'about',
    keywords: ['about', 'who are you', 'lesuccess', 'academy', 'institute', 'mentor', 'mentors', 'faculty', 'trainer', 'trainers'],
    response: "**LeSuccess Academy** is a leading tech training and career acceleration academy. We bridge the gap between academic education and modern industry demands through hands-on, mentor-led engineering programs.",
    links: [
      { label: 'About LeSuccess', url: '/about' },
      { label: 'Meet Our Team', url: '/team' },
    ],
  },
  {
    id: 'admission_enroll',
    keywords: ['admission', 'enroll', 'enrollment', 'register', 'registration', 'join', 'how to join', 'apply'],
    response: "Enrolling is quick and easy! You can book a free 1-on-1 counseling session or a demo class. Our mentors will help you choose the track best suited for your career goals.",
    links: [
      { label: 'Enquire / Enroll Now', action: 'enquiry' },
      { label: 'Contact Us', url: '/contact' },
    ],
  },
  {
    id: 'thanks',
    keywords: ['thanks', 'thank you', 'thank', 'awesome', 'great', 'bye', 'goodbye', 'ok', 'okay'],
    response: "You're very welcome! 😊 Feel free to ask anything else, or visit our courses page to explore your learning journey with LeSuccess.",
    links: [
      { label: 'Explore Courses', url: '/courses' },
    ],
  },
]

const FALLBACK_RESPONSE = {
  response: "I’m currently a basic assistant, so I can help with LeSuccess courses, programs, contact information, registration and other common questions. Please try asking about one of these topics, or contact our team directly!",
  links: [
    { label: 'Explore Courses', url: '/courses' },
    { label: 'Contact Us', url: '/contact' },
  ],
}

/**
 * Intelligent Rule-Based Intent Matcher
 */
function matchIntent(userText) {
  if (!userText || typeof userText !== 'string') return FALLBACK_RESPONSE

  const cleaned = userText.toLowerCase().replace(/[^\w\s]/g, ' ').trim()
  if (!cleaned) return FALLBACK_RESPONSE

  const words = cleaned.split(/\s+/)

  // 1. Check exact phrase matches first
  for (const item of KNOWLEDGE_BASE) {
    for (const keyword of item.keywords) {
      if (cleaned === keyword || cleaned.includes(` ${keyword} `) || cleaned.startsWith(`${keyword} `) || cleaned.endsWith(` ${keyword}`)) {
        return item
      }
    }
  }

  // 2. Score word overlap
  let bestMatch = null
  let highestScore = 0

  for (const item of KNOWLEDGE_BASE) {
    let score = 0
    for (const keyword of item.keywords) {
      const kwWords = keyword.split(/\s+/)
      for (const w of words) {
        if (kwWords.includes(w)) {
          score += 2
        } else if (w.length > 3 && keyword.includes(w)) {
          score += 1
        }
      }
    }
    if (score > highestScore) {
      highestScore = score
      bestMatch = item
    }
  }

  if (highestScore >= 2 && bestMatch) {
    return bestMatch
  }

  return FALLBACK_RESPONSE
}

/**
 * Format markdown-like text (bold, line breaks, bullet lists)
 */
function FormattedBotText({ text }) {
  if (!text) return null

  const lines = text.split('\n')
  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />

        // Parse bold segments **bold**
        const parts = line.split(/(\*\*[^*]+\*\*)/g)
        const rendered = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-[#07405C]">
                {part.slice(2, -2)}
              </strong>
            )
          }
          return part
        })

        if (line.trim().startsWith('•')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-[#DF1E26] font-bold select-none">•</span>
              <span>{rendered.slice(1)}</span>
            </div>
          )
        }

        return <p key={idx}>{rendered}</p>
      })}
    </div>
  )
}

/**
 * Normal Rule-Based / FAQ Chatbot
 * 100% Frontend-only, NO API Key, NO external API calls.
 */
export default function BasicChatbot({ onOpenEnquiry }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'bot',
      text: GREETING,
      links: [
        { label: 'Explore Courses', url: '/courses' },
        { label: 'Contact Us', url: '/contact' },
        { label: 'Upcoming Programs', url: '/programs' },
      ],
      time: 'Just now',
    },
  ])
  const [draft, setDraft] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const launcherRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const isFirstMountRef = useRef(true)

  // Notify parent & global listeners (e.g. ConnectWithUsPopupTrigger) on open/close
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false
      return
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lesuccess-chat-toggle', { detail: { open: isOpen } }))
    }
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isTyping, isOpen])

  const toggle = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) setHasUnread(false)
      return next
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    launcherRef.current?.focus()
  }

  const handleReset = () => {
    setMessages([
      {
        id: createMsgId('welcome'),
        role: 'bot',
        text: GREETING,
        links: [
          { label: 'Explore Courses', url: '/courses' },
          { label: 'Contact Us', url: '/contact' },
          { label: 'Upcoming Programs', url: '/programs' },
        ],
        time: 'Just now',
      },
    ])
    setDraft('')
    inputRef.current?.focus()
  }

  const handleSend = (textToSend) => {
    const raw = typeof textToSend === 'string' ? textToSend : draft
    const text = raw.trim()
    if (!text || isTyping) return

    const userMsg = {
      id: createMsgId('u'),
      role: 'user',
      text,
      time: getFormattedTime(),
    }

    setMessages((prev) => [...prev, userMsg])
    setDraft('')
    setIsTyping(true)

    // Simulate natural response latency (350ms)
    setTimeout(() => {
      const match = matchIntent(text)
      const botMsg = {
        id: createMsgId('b'),
        role: 'bot',
        text: match.response,
        links: match.links || [],
        time: getFormattedTime(),
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)

      if (!isOpen) {
        setHasUnread(true)
      }
    }, 350)
  }


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-anchor contents">
      {/* Welcome Typewriter Bubble */}
      <LeBotWelcomeBubble isOpen={isOpen} onOpenChat={toggle} />

      {/* Floating Chatbot Launcher Button */}
      <button
        ref={launcherRef}
        type="button"
        onClick={toggle}
        aria-label="Open chat with LeBot"
        aria-expanded={isOpen}
        aria-controls="ls-basic-chat-window"
        title={isOpen ? 'Close chat' : 'Chat with LeBot'}
        className="chat-launcher z-45 right-4 sm:right-6 lg:right-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#b82523] text-white shadow-[0_4px_20px_rgba(0,0,0,0.45)] border border-white/20 transition-all duration-200 hover:scale-105 hover:border-white/40 active:scale-95 cursor-pointer overflow-hidden p-0"
      >
        {isOpen ? (
          <X size={24} strokeWidth={2.5} aria-hidden="true" className="text-white" />
        ) : (
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#b82523]">
            <img
              src="/logo/LeSuccess_Logo_Chatbot2.gif"
              alt="Chat with LeBot"
              className="h-full w-full object-cover scale-[0.82] pointer-events-none select-none rounded-full"
            />
          </div>
        )}
        {hasUnread && !isOpen && (
          <span
            data-testid="chat-unread-dot"
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#DF1E26] shadow-sm animate-pulse"
          />
        )}
      </button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="basic-chat-window"
            id="ls-basic-chat-window"
            role="dialog"
            aria-modal="false"
            aria-labelledby="ls-chat-title"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom right' }}
            className="chat-window z-55 flex flex-col overflow-hidden bg-white font-sans text-slate-800 sm:right-6 sm:border sm:border-slate-200 sm:shadow-2xl lg:right-8"
          >
            {/* Header */}
            <header className="flex items-center gap-3 bg-gradient-to-r from-[#07405C] to-[#024D72] px-4 py-3 text-white shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/20">
                <Sparkles size={18} className="text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="ls-chat-title" className="truncate text-sm sm:text-base font-bold leading-tight text-white flex items-center gap-1.5">
                  LeBot
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-400/30">
                    Online
                  </span>
                </h2>
                <p className="text-[11px] text-white/80">FAQ & Academy Guide • Instant replies</p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset conversation"
                title="Restart chat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 cursor-pointer"
              >
                <RotateCcw size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close chat"
                title="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 cursor-pointer"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            {/* Messages Log */}
            <div
              ref={listRef}
              role="log"
              aria-live="polite"
              aria-label="Conversation"
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[#F8FAFC] px-3.5 py-3.5"
            >
              {messages.map((message) => {
                const isUser = message.role === 'user'
                return (
                  <div
                    key={message.id}
                    className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    {/* Bubble */}
                    <div
                      className={`break-words rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-xs ${
                        isUser
                          ? 'bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white rounded-br-none'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      ) : (
                        <FormattedBotText text={message.text} />
                      )}
                    </div>

                    {/* Bot Action Links */}
                    {!isUser && message.links && message.links.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {message.links.map((link, lIdx) => {
                          if (link.action === 'enquiry') {
                            return (
                              <button
                                key={lIdx}
                                type="button"
                                onClick={() => {
                                  if (onOpenEnquiry) onOpenEnquiry()
                                }}
                                className="inline-flex items-center gap-1 rounded-full border border-[#07405C]/25 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#07405C] hover:border-[#DF1E26] hover:text-[#DF1E26] transition-colors cursor-pointer shadow-2xs"
                              >
                                {link.label}
                                <ArrowUpRight size={11} />
                              </button>
                            )
                          }
                          return (
                            <Link
                              key={lIdx}
                              to={link.url}
                              onClick={() => {
                                if (window.innerWidth < 640) setIsOpen(false)
                              }}
                              className="inline-flex items-center gap-1 rounded-full border border-[#07405C]/25 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#07405C] hover:border-[#DF1E26] hover:text-[#DF1E26] transition-colors shadow-2xs"
                            >
                              {link.label}
                              <ArrowUpRight size={11} />
                            </Link>
                          )
                        })}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 px-1">{message.time}</span>
                  </div>
                )
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-1 self-start rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xs">
                  <span className="sr-only">Typing...</span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              {/* Suggested Quick Questions (shown on initial greeting) */}
              {messages.length === 1 && (
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">Suggested questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSend(suggestion)}
                        disabled={isTyping}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-semibold text-[#07405C] transition hover:border-[#DF1E26] hover:text-[#DF1E26] hover:bg-slate-50 disabled:opacity-50 cursor-pointer shadow-2xs"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input & Footer Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="border-t border-slate-200 bg-white px-3 pt-2.5 pb-2"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about courses, fees, timings..."
                  maxLength={300}
                  className="h-10 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#07405C] focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isTyping}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white shadow-sm transition hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <SendHorizontal size={17} aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500">
                <span className="truncate">
                  LeBot FAQ Assistant •{' '}
                  {onOpenEnquiry ? (
                    <button
                      type="button"
                      onClick={onOpenEnquiry}
                      className="font-semibold text-[#DF1E26] hover:underline cursor-pointer"
                    >
                      Talk to our team
                    </button>
                  ) : (
                    <Link to="/contact" className="font-semibold text-[#DF1E26] hover:underline">
                      Talk to our team
                    </Link>
                  )}
                </span>
                {draft.length > 200 && (
                  <span className={draft.length >= 300 ? 'text-red-500 font-bold' : 'text-slate-400'}>
                    {draft.length}/300
                  </span>
                )}
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
