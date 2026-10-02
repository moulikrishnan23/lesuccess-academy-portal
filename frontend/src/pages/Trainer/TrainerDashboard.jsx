import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, LogOut, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import AdminProgramsTab from '../Admin/components/AdminProgramsTab.jsx'

export default function TrainerDashboard() {
  const { user, logout } = useAuth()
  const [alert, setAlert] = useState(null)

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 4000)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          TOP NAVIGATION BAR
      ===================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[#e51d48] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Trainer Portal
            </span>
            <span className="font-display text-lg font-bold text-slate-800">
              Webinars, Workshops & Internships
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/#programs"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#084b66] transition"
            >
              <span>View on Home Page</span>
              <ExternalLink size={14} />
            </Link>

            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-800">{user?.fullName || 'Lead Trainer'}</p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Alert */}
        {alert && (
          <div
            className={`mb-6 flex items-center justify-between rounded-xl p-4 text-sm font-medium ${
              alert.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            <span>{alert.message}</span>
            <button type="button" onClick={() => setAlert(null)} className="cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Programs & Events Management (Shared component with Admin Dashboard) */}
        <AdminProgramsTab showAlert={showAlert} />
      </main>
    </div>
  )
}
