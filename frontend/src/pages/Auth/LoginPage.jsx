import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!usernameOrEmail.trim() || !password) {
      setError('Please enter both username/email and password')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const user = await login(usernameOrEmail.trim(), password)

      // Redirect based on user role or previous route
      const from = location.state?.from?.pathname
      if (from && from.startsWith('/admin') && user.role === 'ADMIN') {
        navigate(from, { replace: true })
      } else if (from && from.startsWith('/trainer') && user.role === 'TRAINER') {
        navigate(from, { replace: true })
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else if (user.role === 'TRAINER') {
        navigate('/trainer/dashboard', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid login credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to fill demo credentials
  const fillDemo = (userType) => {
    if (userType === 'admin') {
      setUsernameOrEmail('admin@lesuccess.in')
      setPassword('admin123')
    } else {
      setUsernameOrEmail('trainer@lesuccess.in')
      setPassword('trainer123')
    }
    setError('')
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#084b66]/10 text-[#084b66]">
            <ShieldCheck size={32} />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#084b66] sm:text-3xl">
            Staff Portal Login
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your Admin or Trainer Dashboard
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username / Email */}
          <div>
            <label
              htmlFor="usernameOrEmail"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Username or Email
            </label>
            <div className="relative">
              <User
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="usernameOrEmail"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="admin@lesuccess.in"
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 transition focus:border-[#084b66] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#084b66]/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-11 text-sm text-slate-900 transition focus:border-[#084b66] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#084b66]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#e51d48] to-[#c70f44] py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 active:scale-98 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-700 mb-2">Demo Quick-Fill:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium hover:bg-slate-100 transition"
            >
              Fill Admin (admin@lesuccess.in)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('trainer')}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium hover:bg-slate-100 transition"
            >
              Fill Trainer (trainer@lesuccess.in)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
