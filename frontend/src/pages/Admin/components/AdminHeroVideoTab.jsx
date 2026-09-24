import { useState, useEffect, useRef } from 'react';
import {
  Video,
  Upload,
  Link as LinkIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Sparkles,
} from 'lucide-react';
import apiClient from '../../../services/apiClient.js';

const DEFAULT_VIDEO_URL =
  'https://res.cloudinary.com/mknetwyg/video/upload/v1790162815/lesuccess/video/CompanyIntro.mp4';

export default function AdminHeroVideoTab({ showAlert }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/settings');
      const settings = data?.data || {};

      if (settings.hero_video_url) {
        setVideoUrl(settings.hero_video_url);
      }
      if (settings.hero_video_enabled !== undefined) {
        setVideoEnabled(settings.hero_video_enabled !== 'false');
      }
    } catch (err) {
      showAlert?.('Failed to load current Hero video settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await apiClient.put('/api/settings', {
        hero_video_url: videoUrl.trim() || DEFAULT_VIDEO_URL,
        hero_video_enabled: videoEnabled ? 'true' : 'false',
      });
      showAlert?.('Hero video settings saved successfully!', 'success');
    } catch (err) {
      showAlert?.(err?.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showAlert?.('Please select a valid video file (MP4, WebM, etc.)', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadProgress(10);

    try {
      const { data } = await apiClient.post('/api/settings/hero-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      const updated = data?.data || {};
      if (updated.hero_video_url) {
        setVideoUrl(updated.hero_video_url);
      }
      setVideoEnabled(true);
      showAlert?.('Hero video uploaded to Cloudinary successfully!', 'success');
    } catch (err) {
      showAlert?.(
        err?.response?.data?.message || 'Failed to upload video to Cloudinary. Check file size.',
        'error'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetToDefault = () => {
    setVideoUrl(DEFAULT_VIDEO_URL);
    setVideoEnabled(true);
    showAlert?.('Reset to LeSuccess default company intro video. Click Save to persist.', 'success');
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-200">
        <Loader2 className="h-8 w-8 animate-spin text-[#DF1E26]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DF1E26]/10 text-[#DF1E26]">
              <Video size={18} />
            </div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Home Hero Video Management
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Control the video showcased on the public home hero section. Videos upload directly to Cloudinary CDN.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveSettings}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:brightness-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Preview Player */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Video Preview
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  videoEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {videoEnabled ? (
                  <>
                    <Eye size={12} /> Active on Site
                  </>
                ) : (
                  <>
                    <EyeOff size={12} /> Disabled
                  </>
                )}
              </span>
            </div>

            {/* Video Container */}
            <div className="relative overflow-hidden rounded-xl bg-black aspect-video flex items-center justify-center group shadow-inner">
              <video
                ref={videoRef}
                key={videoUrl}
                src={videoUrl}
                muted={isMuted}
                playsInline
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="h-full w-full object-cover"
              />

              {/* Player Overlay Controls */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#07405C] shadow-lg transition hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                </button>
              </div>

              {/* Bottom Quick Controls */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 cursor-pointer"
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              </div>
            </div>

            {/* URL Display */}
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 overflow-hidden">
              <LinkIcon size={14} className="shrink-0 text-slate-400" />
              <span className="truncate font-mono">{videoUrl}</span>
            </div>
          </div>
        </div>

        {/* Right: Upload & Video Configuration */}
        <div className="lg:col-span-5 space-y-5">
          {/* Visibility Switch */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Hero Section Visibility
            </h3>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Display Video in Hero Section
                </p>
                <p className="text-xs text-slate-500">
                  When turned off, the home hero displays clean gradient branding without video.
                </p>
              </div>
              <input
                type="checkbox"
                checked={videoEnabled}
                onChange={(e) => setVideoEnabled(e.target.checked)}
                className="h-5 w-5 accent-[#DF1E26] rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Upload to Cloudinary */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Upload Video to Cloudinary
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select an MP4 or WebM video. It will be uploaded straight to your Cloudinary storage and deployed instantly.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#DF1E26] p-6 text-center transition cursor-pointer hover:bg-slate-50/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DF1E26]/10 text-[#DF1E26]">
                {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {uploading ? `Uploading... ${uploadProgress}%` : 'Click to Upload Video'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">MP4, WebM (Recommended max 30MB)</p>
              </div>
            </button>

            {uploading && (
              <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#DF1E26] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Direct Video URL Input */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              External / CDN Video URL
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Alternatively, paste an existing Cloudinary URL or direct video link below:
            </p>

            <div className="space-y-3">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/.../video.mp4"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#DF1E26]"
              />

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveSettings}
                className="w-full rounded-xl bg-slate-900 hover:bg-[#07405C] py-2.5 text-xs font-bold text-white transition active:scale-98 cursor-pointer"
              >
                Update Video URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
