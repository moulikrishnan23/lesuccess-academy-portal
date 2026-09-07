import { useEffect, useState } from 'react'
import { Plus, Trash2, ShieldCheck, UserCheck, X, UserPlus, Key } from 'lucide-react'
import apiClient from '../../../services/apiClient.js'
import { useAuth } from '../../../context/AuthContext.jsx'

export default function AdminUsersTab({ showAlert }) {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'TRAINER', // 'ADMIN' | 'TRAINER'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/admin/users')
      setUsers(data?.data || [])
    } catch (err) {
      showAlert?.('Failed to load user accounts', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = (defaultRole = 'TRAINER') => {
    setForm({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: defaultRole,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.email.trim() || !form.password.trim() || !form.fullName.trim()) {
      showAlert?.('All fields are required', 'error')
      return
    }

    try {
      await apiClient.post('/api/admin/users', {
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
        role: form.role,
      })
      showAlert?.(`New ${form.role.toLowerCase()} account created successfully`)
      setIsModalOpen(false)
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user account'
      showAlert?.(msg, 'error')
    }
  }

  const handleDelete = async (u) => {
    if (u.username === currentUser?.username) {
      showAlert?.('You cannot delete your own account', 'error')
      return
    }
    if (u.email === 'admin@lesuccess.in') {
      showAlert?.('Primary system administrator cannot be deleted', 'error')
      return
    }

    if (!window.confirm(`Are you sure you want to deactivate ${u.fullName || u.username} (${u.role})?`)) {
      return
    }

    try {
      await apiClient.delete(`/api/admin/users/${u.id}`)
      showAlert?.('User account deactivated')
      fetchUsers()
    } catch (err) {
      showAlert?.(err.response?.data?.message || 'Failed to delete user', 'error')
    }
  }

  return (
    <div>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">
            Register and manage Admin and Trainer role-based credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openCreateModal('TRAINER')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <UserPlus size={18} className="text-emerald-600" />
            <span>Add Trainer</span>
          </button>
          <button
            type="button"
            onClick={() => openCreateModal('ADMIN')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#084b66] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#063c52] transition"
          >
            <ShieldCheck size={18} />
            <span>Add Admin</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#084b66]" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Full Name & Email</th>
                <th className="px-6 py-3.5">Username</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isAdmin = u.role === 'ADMIN'
                const isMaster = u.email === 'admin@lesuccess.in'
                const isSelf = u.username === currentUser?.username

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{u.fullName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">@{u.username}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isAdmin
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isAdmin ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isMaster ? (
                        <span className="text-xs text-slate-400 italic">Primary Admin</span>
                      ) : isSelf ? (
                        <span className="text-xs text-slate-400 italic">Current User</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Deactivate Account"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                Register New {form.role === 'ADMIN' ? 'Administrator' : 'Trainer'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Account Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'TRAINER' })}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                      form.role === 'TRAINER'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck size={16} />
                    <span>Trainer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'ADMIN' })}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                      form.role === 'ADMIN'
                        ? 'border-purple-600 bg-purple-50 text-purple-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    <span>Administrator</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. johndoe"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="johndoe@lesuccess.in"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                  <Key size={16} className="absolute right-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                {form.role === 'TRAINER' ? (
                  <p>
                    <strong>Trainer Privileges:</strong> Access strictly limited to creating and managing Webinars, Workshops, and Internships.
                  </p>
                ) : (
                  <p>
                    <strong>Admin Privileges:</strong> Full access to Courses, Gallery, Programs, Team Members, Companies, and User management.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#084b66] px-5 py-2 text-sm font-semibold text-white hover:bg-[#063c52] transition shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
