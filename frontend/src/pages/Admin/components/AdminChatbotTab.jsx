import { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  Save,
  Loader2,
  ShieldAlert,
  Server,
  Cpu,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import apiClient from '../../../services/apiClient.js';

export default function AdminChatbotTab({ showAlert }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 'NORMAL' | 'API'
  const [chatbotMode, setChatbotMode] = useState('NORMAL');
  const [chatbotEnabled, setChatbotEnabled] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/settings');
      const settings = data?.data || {};

      if (settings.chatbot_mode) {
        setChatbotMode(settings.chatbot_mode.toUpperCase() === 'API' ? 'API' : 'NORMAL');
      }
      if (settings.chatbot_enabled !== undefined) {
        setChatbotEnabled(settings.chatbot_enabled !== 'false');
      }
    } catch (_err) {
      showAlert?.('Failed to load current Chatbot settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await apiClient.put('/api/settings', {
        chatbot_mode: chatbotMode,
        chatbot_enabled: chatbotEnabled ? 'true' : 'false',
      });
      showAlert?.(
        `Chatbot configuration saved! Active mode: ${
          chatbotMode === 'API' ? 'Existing API Chatbot' : 'Normal Chatbot'
        }`,
        'success'
      );
    } catch (err) {
      showAlert?.(err?.response?.data?.message || 'Failed to save chatbot settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#084b66]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#084b66]/10 text-[#084b66]">
            <Bot size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">LeBot Website Chatbot Selector</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select which chatbot engine powers LeBot on the public website.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#084b66] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#06384d] transition cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Global Status: Online / Offline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Chatbot Visibility Status</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  chatbotEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {chatbotEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{chatbotEnabled ? 'Enabled on Website' : 'Disabled (Hidden)'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              When enabled, the selected chatbot floating button will appear on all public pages.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={chatbotEnabled}
              onChange={(e) => setChatbotEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#084b66]"></div>
          </label>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Select Active Chatbot Implementation
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* OPTION 1: Normal Chatbot (Rule-Based) */}
          <div
            onClick={() => setChatbotMode('NORMAL')}
            className={`relative flex flex-col justify-between rounded-2xl border-2 p-5 transition-all cursor-pointer ${
              chatbotMode === 'NORMAL'
                ? 'border-[#084b66] bg-[#084b66]/5 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#07405C]">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Normal Chatbot</h3>
                    <p className="text-[11px] text-slate-500">Rule-Based / Predefined FAQ</p>
                  </div>
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                    chatbotMode === 'NORMAL'
                      ? 'border-[#084b66] bg-[#084b66] text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {chatbotMode === 'NORMAL' && <CheckCircle2 size={12} className="stroke-[3]" />}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Completely client-side assistant. Matches visitor queries against comprehensive academy
                knowledge (courses, fees, timings, contact, placements) instantly without any API keys.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-200/80 pt-3">
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 size={13} className="shrink-0" />
                  <span className="font-semibold">No Gemini API key needed</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 size={13} className="shrink-0" />
                  <span className="font-semibold">Zero external network or backend calls</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 size={13} className="shrink-0 text-slate-400" />
                  <span>Instant response time (~350ms simulation)</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 size={13} className="shrink-0 text-slate-400" />
                  <span>Deterministic responses & quick action pills</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-500">Provider:</span>
              <span className="font-bold text-slate-800">100% Client-Side Engine</span>
            </div>
          </div>

          {/* OPTION 2: Existing API Chatbot (Google Gemini) */}
          <div
            onClick={() => setChatbotMode('API')}
            className={`relative flex flex-col justify-between rounded-2xl border-2 p-5 transition-all cursor-pointer ${
              chatbotMode === 'API'
                ? 'border-[#084b66] bg-[#084b66]/5 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Existing API Chatbot</h3>
                    <p className="text-[11px] text-slate-500">Google Gemini Generative AI</p>
                  </div>
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                    chatbotMode === 'API'
                      ? 'border-[#084b66] bg-[#084b66] text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {chatbotMode === 'API' && <CheckCircle2 size={12} className="stroke-[3]" />}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Full-featured AI agent using Spring AI and Google Gemini (<code>gemini-3.8-flash</code>).
                Queries database tool definitions in real time for curriculum, courses, and site contact info.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-200/80 pt-3">
                <li className="flex items-center gap-1.5 text-blue-700">
                  <Cpu size={13} className="shrink-0" />
                  <span className="font-semibold">Spring AI + Google Gemini Integration</span>
                </li>
                <li className="flex items-center gap-1.5 text-blue-700">
                  <Server size={13} className="shrink-0" />
                  <span className="font-semibold">Requires running backend & GEMINI_API_KEY</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 size={13} className="shrink-0 text-slate-400" />
                  <span>Dynamic Tool Calling (RAG database retrieval)</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 size={13} className="shrink-0 text-slate-400" />
                  <span>Full markdown rendering with custom enquiry popups</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-500">Provider:</span>
              <span className="font-bold text-slate-800">Google Gemini (Backend API)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice Card */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-start gap-3">
        <HelpCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Seamless Reversible Architecture</p>
          <p className="text-blue-800 leading-relaxed">
            Switching chatbot modes updates site settings in the database. Both implementations
            remain fully intact in the codebase. Only <strong>one single chatbot</strong> will be
            rendered to visitors at any given time.
          </p>
        </div>
      </div>
    </div>
  );
}
