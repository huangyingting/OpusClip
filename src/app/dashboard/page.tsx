"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudioShell } from "@/components/studio/StudioShell";
import {
  Link2,
  Upload,
  Sparkles,
  Film,
  Subtitles,
  Wand2,
  Crop,
  Volume2,
  Maximize,
  Languages,
  Mic,
  FileText,
  Zap,
  Play,
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  X,
} from "lucide-react";

interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  durationMs: number;
  genre: string;
  creditsUsed: number;
  isSaved: boolean;
  createdAt: string;
  _count?: { clips: number };
}

const AI_WORKFLOW_MODES = [
  { id: "long-to-shorts", label: "Long to shorts", icon: Film },
  { id: "edit-video", label: "Edit video", icon: SlidersHorizontal },
  { id: "ai-captions", label: "AI Captions", icon: Subtitles },
  { id: "ai-producer", label: "AI Producer", badge: "Beta", icon: Sparkles },
  { id: "ai-b-roll", label: "AI B-roll", icon: Wand2 },
  { id: "ai-reframe", label: "AI Reframe", icon: Crop },
  { id: "auto-sfx", label: "Auto SFX", icon: Volume2 },
  { id: "upscale", label: "Upscale", icon: Maximize },
  { id: "voice-dubbing", label: "Voice dubbing", icon: Languages },
  { id: "enhance-speech", label: "Enhance speech", icon: Mic },
  { id: "voiceover-hook", label: "Voiceover hook", icon: Mic },
  { id: "script-to-video", label: "Script to video", badge: "Beta", icon: FileText },
];

const CAPTION_PRESETS = [
  { key: "karaoke", name: "Karaoke", previewText: "THE STUDIO", color: "#04F827" },
  { key: "beasty", name: "Beasty", previewText: "WAIT FOR IT", color: "#FFFD03" },
  { key: "mozi", name: "Mozi", previewText: "FOUNDER", color: "#22C55E" },
  { key: "deep-diver", name: "Deep Diver", previewText: "THE TRUTH", color: "#38BDF8" },
  { key: "popline", name: "Popline", previewText: "CREATOR", color: "#A855F7" },
];

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeMode, setActiveMode] = useState("long-to-shorts");
  const [featureModalMode, setFeatureModalMode] = useState<string | null>(null);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);

  const [sourceUrl, setSourceUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string;
    fileName: string;
    durationMs: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Inline ClipAnything Configurator state
  const [clipModel, setClipModel] = useState("ClipAnything");
  const [genre, setGenre] = useState("Podcast");
  const [clipLength, setClipLength] = useState("Auto (0m-3m)");
  const [topicKeywords, setTopicKeywords] = useState("");
  const [customPrompt, setCustomPrompt] = useState(
    "Extract moments with the strongest viral hooks, emotional stories, and tactical advice"
  );
  const [selectedPreset, setSelectedPreset] = useState("karaoke");
  const [creditSaverEnabled, setCreditSaverEnabled] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      setLoadingProjects(true);
      try {
        const res = await fetch("/api/clip-projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "video");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
      } else {
        setUploadedFile({
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          durationMs: data.durationMs || 30000,
        });
      }
    } catch {
      setUploadError("Failed to upload video file.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateClips = async () => {
    setUploadError(null);
    if (!sourceUrl.trim() && !uploadedFile) {
      setUploadError("Drop a YouTube/video link or upload an MP4 file first.");
      return;
    }

    setSubmittingProject(true);
    try {
      const res = await fetch("/api/clip-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadedFile
            ? uploadedFile.fileName.replace(/\.[^.]+$/, "")
            : undefined,
          sourceUrl: sourceUrl.trim() || uploadedFile?.fileUrl,
          videoUrl: uploadedFile?.fileUrl || "/videos/sample_podcast.mp4",
          durationMs: uploadedFile?.durationMs || 960000,
          sourceType: uploadedFile ? "upload" : "youtube",
          genre,
          workflowMode: activeMode,
          clipModel,
          clipLength,
          topicKeywords: topicKeywords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          customPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Unable to create project.");
      } else if (data.project) {
        router.push(`/clip/${data.project.slug || data.project.id}`);
      }
    } catch {
      setUploadError("Network error while creating project.");
    } finally {
      setSubmittingProject(false);
    }
  };

  const showConfigurator = Boolean(uploadedFile || sourceUrl.trim().length > 5);

  return (
    <StudioShell breadcrumbs={[{ label: "Home" }]}>
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Hero Heading */}
        <div className="text-center space-y-3 pt-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            What will you create today?
          </h1>

          {/* 12 AI Workflow Mode Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto pt-1">
            {AI_WORKFLOW_MODES.map((m) => {
              const Icon = m.icon;
              const isSelected = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveMode(m.id);
                    if (m.id === "ai-captions") {
                      setFeatureModalMode("ai-captions");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition ${
                    isSelected
                      ? "bg-white text-black border-white font-bold shadow"
                      : "bg-[#141418] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                  {m.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-700/80 text-zinc-200">
                      {m.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Ingestion & Inline ClipAnything Configurator Card */}
        <div className="rounded-3xl bg-[#131318] border border-zinc-800/90 p-5 sm:p-6 shadow-2xl space-y-5">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            onChange={handleFileChange}
            data-testid="video-file-input"
            className="hidden"
          />

          {/* Link Input Row */}
          {!uploadedFile ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 focus-within:border-zinc-600">
                <div className="flex items-center gap-2.5 flex-1 px-3 py-1.5">
                  <Link2 className="w-4 h-4 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="Drop a YouTube, Zoom, Loom, or Rumble video link..."
                    className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={submittingProject}
                  onClick={handleCreateClips}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs sm:text-sm shrink-0 transition"
                >
                  {submittingProject ? "Curating Clips..." : "Get clips in 1 click"}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-2 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#04F827]" />
                    <span>{uploading ? "Uploading MP4..." : "Upload"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSampleModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Try a sample project</span>
                  </button>
                </div>

                <span className="text-[11px] text-zinc-500">
                  Supports YouTube, MP4, MOV, WebM • Powered by ClipAnything™
                </span>
              </div>
            </div>
          ) : (
            /* Uploaded Video Summary Header */
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-20 h-12 rounded-lg bg-black overflow-hidden border border-zinc-700 relative flex items-center justify-center">
                  <video
                    src={uploadedFile.fileUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/80 text-[10px] font-bold text-amber-300 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-amber-400" /> 15
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#04F827]" />
                    <span>{uploadedFile.fileName}</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Speech language: <strong className="text-zinc-200">English</strong> • Ready for ClipAnything™
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUploadedFile(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                aria-label="Remove uploaded video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {uploadError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200"
            >
              {uploadError}
            </div>
          )}

          {/* Inline ClipAnything Configurator (Matches 14_dashboard_video_uploaded.png) */}
          {showConfigurator && (
            <div
              data-testid="clip-anything-configurator"
              className="pt-4 border-t border-zinc-800/90 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                    Clip model
                  </label>
                  <select
                    value={clipModel}
                    onChange={(e) => setClipModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-semibold"
                  >
                    <option value="ClipAnything">ClipAnything (Multimodal)</option>
                    <option value="Fast">Fast Speech Hook</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                    Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-semibold"
                  >
                    <option value="Podcast">Podcast</option>
                    <option value="Vlog & Interview">Vlog & Interview</option>
                    <option value="Educational">Educational</option>
                    <option value="Marketing">Marketing & Keynote</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                    Clip length
                  </label>
                  <select
                    value={clipLength}
                    onChange={(e) => setClipLength(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-semibold"
                  >
                    <option value="Auto (0m-3m)">Auto (0m-3m)</option>
                    <option value="<30s">&lt;30s</option>
                    <option value="30s-60s">30s-60s</option>
                    <option value="60s-90s">60s-90s</option>
                    <option value="90s-3m">90s-3m</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                    Topic filter by keywords
                  </label>
                  <input
                    type="text"
                    value={topicKeywords}
                    onChange={(e) => setTopicKeywords(e.target.value)}
                    placeholder="e.g., revenue, merch, growth, viral hooks"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                    ClipAnything™ Natural-Language Prompt
                  </label>
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                </div>
              </div>

              {/* Caption Preset Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">
                    Select Brand Template Preset
                  </span>
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={creditSaverEnabled}
                      onChange={(e) => setCreditSaverEnabled(e.target.checked)}
                      className="rounded accent-[#04F827]"
                    />
                    <span>Processing credit saver (trim intro/outro)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {CAPTION_PRESETS.map((preset) => {
                    const active = selectedPreset === preset.key;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => setSelectedPreset(preset.key)}
                        className={`p-3 rounded-xl border text-center transition ${
                          active
                            ? "bg-zinc-800 border-[#04F827] shadow-md"
                            : "bg-zinc-900/70 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div
                          style={{ color: preset.color }}
                          className="font-black text-xs tracking-tight uppercase py-2 bg-black/70 rounded-lg mb-1.5"
                        >
                          {preset.previewText}
                        </div>
                        <div className="text-xs font-medium text-zinc-200">
                          {preset.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={submittingProject}
                onClick={handleCreateClips}
                className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-sm flex items-center justify-center gap-2 transition shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {submittingProject ? "Running ClipAnything™ Curation..." : "Get clips in 1 click"}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Workspace Projects & Sample Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Workspace & Sample Projects ({projects.length})
              </h2>
              <p className="text-xs text-zinc-400">
                Click any project to inspect Virality Score™ rankings, Scene Analysis, and Multi-Track Editor.
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1"
            >
              <span>All projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-32 rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/clip/${p.slug || p.id}`}
                  className="group p-4 rounded-2xl bg-[#131318] hover:bg-[#191920] border border-zinc-800/90 hover:border-zinc-700 flex items-center gap-4 transition"
                >
                  <div className="w-28 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 relative border border-zinc-800">
                    <img
                      src={p.thumbnailUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      {Math.round(p.durationMs / 60000)}m
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                        {p._count?.clips ?? 18} Viral Clips
                      </span>
                      <span className="text-[11px] text-zinc-400">{p.genre}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-[#04F827] transition">
                      {p.title}
                    </h3>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                      <span>ClipAnything™</span>
                      <span>•</span>
                      <span>Open Virality Studio →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Captions Quick-Start Modal (Matches 15_dashboard_mode_AI_Captions.png) */}
      {featureModalMode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#141419] border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Subtitles className="w-5 h-5 text-[#04F827]" />
                <h3 className="text-lg font-bold text-white">AI Captions</h3>
              </div>
              <button
                type="button"
                onClick={() => setFeatureModalMode(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Make loopable shorts with dynamic word-by-word karaoke captions, AI keyword highlighting, and animated emojis with 98.5% accuracy.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFeatureModalMode(null);
                  router.push("/clip/demo-danny");
                }}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
              >
                Try now with sample
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeatureModalMode(null);
                  fileInputRef.current?.click();
                }}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold"
              >
                Create project (Upload MP4)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sample Projects Drawer Modal (Matches 16_sample_projects_modal.png) */}
      {sampleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-[#141419] border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Try a Curated Sample Project
              </h3>
              <button
                type="button"
                onClick={() => setSampleModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {p.title}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {p._count?.clips ?? 18} clips • Virality Score™ up to 99/100
                    </div>
                  </div>
                  <Link
                    href={`/clip/${p.slug || p.id}`}
                    className="px-3.5 py-2 rounded-xl bg-[#04F827] text-black text-xs font-black shrink-0"
                  >
                    Open Project
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </StudioShell>
  );
}
