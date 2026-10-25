import { useEffect, useRef, useState } from 'react'
import { Check, LoaderCircle, Save } from 'lucide-react'
import settingsApi from '../../../services/settingsApi.js'
import { publishSiteSettings } from '../../../hooks/useSiteSettings.js'
import { OFFICIAL_SOCIAL_URLS } from '../../../data/socialLinks.js'

const FIELDS = [
  { key: 'social_instagram', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/…' },
  { key: 'social_facebook', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/…' },
  { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/company/…' },
  { key: 'social_youtube', label: 'YouTube URL', type: 'url', placeholder: 'https://youtube.com/@…' },
  { key: 'phone_primary', label: 'WhatsApp / primary phone', type: 'tel', placeholder: '+91 80120 60000' },
  { key: 'email_primary', label: 'Contact email', type: 'email', placeholder: 'contact@example.com' },
  { key: 'email_training', label: 'Training email', type: 'email', placeholder: 'training@example.com' },
]

const defaults = {
  ...Object.fromEntries(FIELDS.map(({ key }) => [key, ''])),
  social_instagram: OFFICIAL_SOCIAL_URLS.instagram,
  social_facebook: OFFICIAL_SOCIAL_URLS.facebook,
  social_linkedin: OFFICIAL_SOCIAL_URLS.linkedin,
  social_youtube: OFFICIAL_SOCIAL_URLS.youtube,
  phone_primary: '+91 80120 60000',
  email_primary: 'contact@lesuccess.in',
  email_training: 'training@lesuccess.in',
}

export default function AdminWebsiteContactSettingsTab({ showAlert }) {
  const showAlertRef = useRef(showAlert)
  const [values, setValues] = useState(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    showAlertRef.current = showAlert
  }, [showAlert])

  useEffect(() => {
    let active = true
    settingsApi.getAll().then((settings) => {
      if (active) setValues({ ...defaults, ...settings })
    }).catch(() => {
      if (active) showAlertRef.current('Could not load website contact settings.', 'error')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const validate = () => {
    const next = {}
    for (const field of FIELDS) {
      const value = values[field.key]?.trim() || ''
      if ((field.type === 'email' || field.key === 'phone_primary') && !value) {
        next[field.key] = 'This field is required.'
      }
      if (field.type === 'url' && value) {
        try {
          const url = new URL(value)
          if (url.protocol !== 'https:' || !url.hostname.includes('.')) throw new Error()
        } catch { next[field.key] = 'Enter a valid HTTPS URL.' }
      }
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        next[field.key] = 'Enter a valid email address.'
      }
      if (field.key === 'phone_primary' && value && !/^\+?[\d\s().-]{7,24}$/.test(value)) {
        next[field.key] = 'Enter a valid phone number.'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const save = async (event) => {
    event.preventDefault()
    if (saving || !validate()) return
    setSaving(true)
    try {
      const updated = await settingsApi.updateContactSettings(Object.fromEntries(
        FIELDS.map(({ key }) => [key, values[key]?.trim() || '']),
      ))
      setValues((current) => ({ ...current, ...updated }))
      publishSiteSettings(updated)
      showAlertRef.current('Website contact and social settings updated.', 'success')
    } catch (error) {
      showAlertRef.current(error?.response?.data?.message || error?.message || 'Failed to update website settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center gap-2 p-8 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18} /> Loading website settings…</div>

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Website Contact &amp; Social Settings</h2>
        <p className="mt-1 text-sm text-slate-500">These official details are shared by public pages and contact actions.</p>
      </div>
      <form onSubmit={save} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map(({ key, label, type, placeholder }) => (
            <label key={key} className="block text-sm font-semibold text-slate-700">
              {label}
              <input
                type={type}
                value={values[key] ?? ''}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={placeholder}
                autoComplete="off"
                aria-invalid={Boolean(errors[key])}
                className={`mt-2 w-full rounded-xl border px-3.5 py-3 text-sm font-normal outline-none transition focus:border-[#07405C] focus:ring-2 focus:ring-[#07405C]/10 ${errors[key] ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors[key] && <span className="mt-1 block text-xs font-medium text-red-600">{errors[key]}</span>}
            </label>
          ))}
        </div>
        <div className="mt-7 flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#07405C] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#052f44] disabled:cursor-wait disabled:opacity-60">
            {saving ? <LoaderCircle size={16} className="animate-spin" /> : <><Save size={16} /><Check size={15} /></>}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  )
}
