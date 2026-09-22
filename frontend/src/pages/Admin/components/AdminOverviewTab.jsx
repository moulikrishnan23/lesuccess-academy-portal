import { useState, useEffect } from 'react'
import {
  CalendarCheck,
  GraduationCap,
  MessageSquare,
  Users,
  BookOpen,
  Folder,
  Star,
  Building2,
  ArrowRight,
  Sparkles,
  PhoneCall,
  UserCheck,
  RefreshCw,
} from 'lucide-react'
import apiClient from '../../../services/apiClient.js'

export default function AdminOverviewTab({ onNavigateTab, showAlert }) {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalTeamMembers: 0,
    totalGalleryItems: 0,
    totalDemoBookings: 0,
    totalContactMessages: 0,
    totalLeads: 0,
    totalCourseEnquiries: 0,
    totalConnectWithUs: 0,
    totalUpcomingPrograms: 0,
    totalProgramRegistrations: 0,
    totalTestimonials: 0,
    totalCompanyPartners: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/admin/dashboard/summary')
      if (res?.data?.data) {
        setStats(res.data.data)
      } else if (res?.data) {
        setStats(res.data)
      }
    } catch (err) {
      if (showAlert) showAlert('Failed to load dashboard summary metrics', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const statCards = [
    {
      title: 'Demo Bookings',
      count: stats.totalDemoBookings,
      subtitle: 'Free trial seat requests',
      icon: CalendarCheck,
      color: 'from-rose-500 to-red-600',
      tabId: 'demo-bookings',
    },
    {
      title: 'Program Registrations',
      count: stats.totalProgramRegistrations,
      subtitle: 'Webinars, workshops & internships',
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600',
      tabId: 'registrations',
    },
    {
      title: 'Contact Messages',
      count: stats.totalContactMessages,
      subtitle: 'Direct contact queries',
      icon: MessageSquare,
      color: 'from-emerald-500 to-teal-600',
      tabId: 'contact-messages',
    },
    {
      title: 'Enroll Now Leads',
      count: stats.totalLeads,
      subtitle: 'Course enrollment submissions',
      icon: UserCheck,
      color: 'from-purple-500 to-violet-600',
      tabId: 'leads',
    },
    {
      title: 'Course Enquiries',
      count: stats.totalCourseEnquiries,
      subtitle: 'Inquiries from course pages',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      tabId: 'course-enquiries',
    },
    {
      title: 'Connect With Us',
      count: stats.totalConnectWithUs,
      subtitle: 'Quick advisory requests',
      icon: PhoneCall,
      color: 'from-cyan-500 to-blue-600',
      tabId: 'connect-with-us',
    },
    {
      title: 'Active Courses',
      count: stats.totalCourses,
      subtitle: 'Published programs',
      icon: BookOpen,
      color: 'from-sky-500 to-cyan-600',
      tabId: 'courses',
    },
    {
      title: 'Team Members',
      count: stats.totalTeamMembers,
      subtitle: 'Instructors & leadership',
      icon: Users,
      color: 'from-teal-500 to-emerald-600',
      tabId: 'team',
    },
    {
      title: 'Published Reviews',
      count: stats.totalTestimonials,
      subtitle: 'Google & student reviews',
      icon: Star,
      color: 'from-yellow-500 to-amber-600',
      tabId: 'reviews',
    },
    {
      title: 'Hiring Partners',
      count: stats.totalCompanyPartners,
      subtitle: 'Corporate partners',
      icon: Building2,
      color: 'from-slate-600 to-slate-800',
      tabId: 'companies',
    },
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time activity and submission metrics across LeSuccess Academy portal.
          </p>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Stats
        </button>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              onClick={() => onNavigateTab && onNavigateTab(card.tabId)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </p>
                  <h3 className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
                    {loading ? (
                      <span className="inline-block w-8 h-8 rounded-md bg-slate-200 animate-pulse" />
                    ) : (
                      card.count
                    )}
                  </h3>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md transition-transform group-hover:scale-110`}
                >
                  <Icon size={22} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">{card.subtitle}</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#084b66] group-hover:text-rose-600 transition">
                  View <ArrowRight size={12} />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-r from-[#084b66] to-[#0d5c7c] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-rose-300">
              <Sparkles size={13} />
              Quick Actions
            </span>
            <h2 className="mt-3 text-2xl font-bold">Manage Website Content & Inquiries</h2>
            <p className="mt-1 text-sm text-slate-200 max-w-xl">
              Quickly create courses, update instructors, publish testimonials, or review pending student inquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab && onNavigateTab('demo-bookings')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef334c] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#d4273e] cursor-pointer"
            >
              <CalendarCheck size={15} />
              View Demo Bookings
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('courses')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#084b66] shadow-md transition hover:bg-slate-100 cursor-pointer"
            >
              <BookOpen size={15} />
              Manage Courses
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('reviews')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20 cursor-pointer"
            >
              <Star size={15} />
              Manage Reviews
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
