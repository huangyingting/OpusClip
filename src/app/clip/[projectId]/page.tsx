"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StudioShell } from "@/components/studio/StudioShell";
import { ClipVideoPlayer } from "@/components/studio/ClipVideoPlayer";
import {
  LayoutGrid,
  List,
  Sparkles,
  Download,
  FileCode2,
  Share2,
  Copy,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Filter,
  Check,
  X,
} from "lucide-react";

interface ClipItem {
  id: string;
  projectId: string;
  rank: number;
  title: string;
  description: string;
  hashtags: string;
  score: number;
  hookGrade: string;
  flowGrade: string;
  valueGrade: string;
  trendGrade: string;
  judgeResultJson: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  videoUrl: string;
  thumbnailUrl: string;
  transcriptText: string;
  sceneAnalysisText: string;
  isFavorite: boolean;
  feedbackRating: string | null;
}

interface ProjectDetail {
  id: string;
  slug: string;
  title: string;
  genre: string;
  customPrompt: string | null;
  isSaved: boolean;
  promptRecommendationsJson: string;
  brandTemplate?: {
    id: string;
    name: string;
    configJson: string;
  } | null;
  clips: ClipItem[];
}

function formatMsRange(startMs: number, endMs: number) {
  const fmt = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };
  return `[${fmt(startMs)}-${fmt(endMs)}]`;
}

export default function ProjectClipsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId || "demo-danny";
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTabByClip, setActiveTabByClip] = useState<Record<string, "scene" | "transcript">>({});
  const [promptInput, setPromptInput] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [curatingPrompt, setCuratingPrompt] = useState(false);

  // Publish on Social Modal state
  const [publishClip, setPublishClip] = useState<ClipItem | null>(null);
  const [publishPlatform, setPublishPlatform] = useState("tiktok");
  const [publishCaption, setPublishCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishToast, setPublishToast] = useState<string | null>(null);

  const loadProject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clip-projects/${encodeURIComponent(projectId)}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setPromptInput(
          data.project.customPrompt ||
            "Give me highlight compilations of all the exciting moments in this video"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const promptRecommendations: string[] = useMemo(() => {
    if (!project?.promptRecommendationsJson) return [];
    try {
      return JSON.parse(project.promptRecommendationsJson);
    } catch {
      return [];
    }
  }, [project]);

  const templateConfig = useMemo(() => {
    if (!project?.brandTemplate?.configJson) return undefined;
    try {
      return JSON.parse(project.brandTemplate.configJson);
    } catch {
      return undefined;
    }
  }, [project]);

  const filteredClips = useMemo(() => {
    if (!project?.clips) return [];
    return project.clips.filter((c) => c.score >= minScoreFilter);
  }, [project, minScoreFilter]);

  const handleRunPromptCuration = async (promptToRun?: string) => {
    const query = (promptToRun ?? promptInput).trim();
    if (!query || !project) return;
    setCuratingPrompt(true);
    try {
      const res = await fetch(`/api/clip-projects/${encodeURIComponent(project.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reCuratePrompt: query }),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setPublishToast(`Curated new clip matching: "${query}"`);
        setTimeout(() => setPublishToast(null), 3500);
      }
    } finally {
      setCuratingPrompt(false);
    }
  };

  const handleDuplicateClip = async (clipId: string) => {
    const res = await fetch(`/api/exportable-clips/${clipId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    if (res.ok) {
      await loadProject();
      setPublishToast("Clip duplicated in project.");
      setTimeout(() => setPublishToast(null), 2500);
    }
  };

  const handleScheduleSocialPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishClip) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/post-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clipId: publishClip.id,
          platform: publishPlatform,
          title: publishClip.title,
          caption: publishCaption || publishClip.description || publishClip.title,
          hashtags: publishClip.hashtags,
          videoUrl: publishClip.videoUrl,
          publishNow: true,
        }),
      });
      if (res.ok) {
        setPublishClip(null);
        setPublishToast(`Published "${publishClip.title.slice(0, 32)}..." to ${publishPlatform.toUpperCase()}!`);
        setTimeout(() => setPublishToast(null), 3500);
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <StudioShell
      breadcrumbs={[
        { label: "My projects", href: "/projects" },
        { label: project?.title || "Loading project..." },
      ]}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {publishToast && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{publishToast}</span>
          </div>
        )}

        {/* Top ClipAnything Prompt & View Mode Toolbar */}
        <div className="p-4 rounded-2xl bg-[#121216] border border-zinc-800/90 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Prompt Input */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
              <Sparkles className="w-4 h-4 text-[#04F827] shrink-0" />
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ask ClipAnything™ to find specific scenes, emotions, or topics..."
                className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none"
              />
              <button
                type="button"
                disabled={curatingPrompt}
                onClick={() => handleRunPromptCuration()}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold shrink-0 transition"
              >
                {curatingPrompt ? "Curating..." : "ClipAnything"}
              </button>
            </div>

            {/* Filter & Grid / List View Switcher */}
            <div className="flex items-center justify-between lg:justify-end gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <span>Filter:</span>
                <select
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                  aria-label="Filter clips by minimum Virality Score"
                  className="bg-transparent text-white font-semibold focus:outline-none"
                >
                  <option value={0}>All ({project?.clips.length || 0})</option>
                  <option value={95}>Score 95+</option>
                  <option value={90}>Score 90+</option>
                  <option value={85}>Score 85+</option>
                </select>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (!project) return;
                  const res = await fetch(`/api/clip-projects/${project.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isSaved: !project.isSaved }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setProject(data.project);
                  }
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  project?.isSaved
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{project?.isSaved ? "Saved" : "Save"}</span>
              </button>

              {/* View Mode Switcher (Matches button[aria-label="grid"] & button[aria-label="list"]) */}
              <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  aria-label="grid"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="list"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Prompt Recommendation Pills */}
          {promptRecommendations.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-zinc-500">Suggested prompts:</span>
              {promptRecommendations.slice(0, 5).map((rec, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPromptInput(rec);
                    handleRunPromptCuration(rec);
                  }}
                  className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition"
                >
                  + {rec}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary Heading */}
        <div className="flex items-center justify-between px-1">
          <div className="text-sm font-semibold text-zinc-200">
            {project?.customPrompt || "Curated Viral Highlights"}{" "}
            <span className="text-zinc-400">({filteredClips.length})</span>
          </div>
          <Link
            href="/brand-templates-ux"
            className="text-xs text-violet-400 hover:text-violet-300 font-medium"
          >
            Active Template: {project?.brandTemplate?.name || "Default Preset (Karaoke Neon)"} →
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            Loading curated clips and Virality Score™ breakdown...
          </div>
        ) : viewMode === "grid" ? (
          /* =================================================================
             GRID VIEW (Matches 18c_project_demo_danny_clips.png & 18f hover)
             ================================================================= */
          <div
            data-testid="clips-grid-view"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredClips.map((clip) => (
              <div
                key={clip.id}
                data-testid={`clip-card-${clip.rank}`}
                className="rounded-2xl bg-[#121216] border border-zinc-800/90 hover:border-zinc-700 p-3 flex flex-col justify-between gap-3 transition group"
              >
                <div className="space-y-2.5">
                  <ClipVideoPlayer
                    videoUrl={clip.videoUrl}
                    transcriptText={clip.transcriptText}
                    title={clip.title}
                    durationMs={clip.durationMs}
                    templateConfig={templateConfig}
                    compact
                  />

                  {/* Rank + Title */}
                  <div className="px-1">
                    <h3 className="text-xs font-bold text-zinc-100 line-clamp-2 leading-snug">
                      <span className="text-zinc-400 mr-1">#{clip.rank}</span>
                      {clip.title}
                    </h3>
                  </div>
                </div>

                {/* Bottom Score + Action Bar */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between px-1">
                  <div className="flex items-baseline gap-1">
                    <span
                      data-testid={`clip-score-${clip.rank}`}
                      className="text-xl font-black text-[#04F827]"
                    >
                      {clip.score}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold">
                      /100
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPublishClip(clip);
                        setPublishCaption(`${clip.title} ${clip.hashtags}`);
                      }}
                      title="Publish on Social"
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-[11px] transition"
                    >
                      Publish
                    </button>
                    <Link
                      href={`/editor/${clip.id}`}
                      title="Edit clip in Multi-Track Studio"
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-[11px] transition"
                    >
                      Edit
                    </Link>
                    <a
                      href={`/api/exportable-clips/${clip.id}/export?format=mp4`}
                      download
                      title="Download HD MP4"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* =================================================================
             LIST VIEW (Matches 18g_project_list_view.png side-by-side layout)
             ================================================================= */
          <div data-testid="clips-list-view" className="space-y-6">
            {filteredClips.map((clip) => {
              const tab = activeTabByClip[clip.id] || "scene";
              let judge: Record<string, string | number> = {};
              try {
                judge = JSON.parse(clip.judgeResultJson || "{}");
              } catch {
                judge = {};
              }

              return (
                <div
                  key={clip.id}
                  data-testid={`clip-list-row-${clip.rank}`}
                  className="rounded-3xl bg-[#121216] border border-zinc-800/90 p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                >
                  {/* Left Column (2 cols): Virality Score™ + Hook / Flow / Value / Trend Grades */}
                  <div className="lg:col-span-2 flex lg:flex-col items-center lg:items-start justify-between gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                    <div>
                      <div className="text-4xl font-black text-[#04F827] leading-none">
                        {clip.score}
                      </div>
                      <div className="text-xs text-zinc-400 font-semibold mt-0.5">
                        /100 Virality Score™
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 w-full">
                      {[
                        { label: "Hook", grade: clip.hookGrade },
                        { label: "Flow", grade: clip.flowGrade },
                        { label: "Value", grade: clip.valueGrade },
                        { label: "Trend", grade: clip.trendGrade },
                      ].map((metric) => (
                        <div
                          key={metric.label}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs"
                        >
                          <span className="text-zinc-400">{metric.label}</span>
                          <span className="font-black text-emerald-400">
                            {metric.grade}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center Column (4 cols): 9:16 Video Player */}
                  <div className="lg:col-span-4">
                    <ClipVideoPlayer
                      videoUrl={clip.videoUrl}
                      transcriptText={clip.transcriptText}
                      title={clip.title}
                      durationMs={clip.durationMs}
                      templateConfig={templateConfig}
                    />
                  </div>

                  {/* Right Column (6 cols): Title, Scene Analysis / Transcript Tabs, Action Buttons */}
                  <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-black text-white leading-snug">
                          <span className="text-zinc-400 mr-2">#{clip.rank}</span>
                          {clip.title}
                        </h3>
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-300 shrink-0">
                          {formatMsRange(clip.startMs, clip.endMs)}
                        </span>
                      </div>

                      {/* Tabs: Scene analysis vs Transcript only */}
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveTabByClip({
                              ...activeTabByClip,
                              [clip.id]: "scene",
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            tab === "scene"
                              ? "bg-zinc-800 text-white"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          Scene analysis
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveTabByClip({
                              ...activeTabByClip,
                              [clip.id]: "transcript",
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            tab === "transcript"
                              ? "bg-zinc-800 text-white"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          Transcript only
                        </button>
                      </div>

                      {/* Scene Analysis + Spoken Dialogue Box */}
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 max-h-[290px] overflow-y-auto text-xs leading-relaxed">
                        {tab === "scene" && (
                          <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-800/50 text-violet-200">
                            <span className="font-bold uppercase text-[10px] tracking-wider text-violet-300 block mb-1">
                              Multimodal Visual Scene Analysis{" "}
                              {formatMsRange(clip.startMs, clip.endMs)}
                            </span>
                            {clip.sceneAnalysisText}
                          </div>
                        )}

                        <div className="text-zinc-200 space-y-1">
                          <span className="font-bold uppercase text-[10px] tracking-wider text-zinc-400 block">
                            Spoken Transcript
                          </span>
                          <p>{clip.transcriptText}</p>
                        </div>

                        {judge.hookComment && (
                          <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                            <div>
                              <strong className="text-emerald-400">AI Hook Analysis:</strong>{" "}
                              {String(judge.hookComment)}
                            </div>
                            {judge.trendComment && (
                              <div>
                                <strong className="text-amber-300">Trend Verdict:</strong>{" "}
                                {String(judge.trendComment)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Toolbar (Matches 18g_project_list_view.png) */}
                    <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPublishClip(clip);
                            setPublishCaption(`${clip.title} ${clip.hashtags}`);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Publish on Social</span>
                        </button>

                        <Link
                          href={`/editor/${clip.id}`}
                          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit clip</span>
                        </Link>

                        <a
                          href={`/api/exportable-clips/${clip.id}/export?format=mp4`}
                          download
                          className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download HD</span>
                        </a>

                        <a
                          href={`/api/exportable-clips/${clip.id}/export?format=xml`}
                          download
                          className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition"
                        >
                          <FileCode2 className="w-3.5 h-3.5" />
                          <span>Export XML</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDuplicateClip(clip.id)}
                          className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Thumbs up clip"
                          onClick={() =>
                            fetch(`/api/exportable-clips/${clip.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ feedbackRating: "up" }),
                            })
                          }
                          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Thumbs down clip"
                          onClick={() =>
                            fetch(`/api/exportable-clips/${clip.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ feedbackRating: "down" }),
                            })
                          }
                          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Publish on Social Modal */}
      {publishClip && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#141419] border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Publish & Schedule Clip #{publishClip.rank}
              </h3>
              <button
                type="button"
                onClick={() => setPublishClip(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSocialPost} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Target Social Channel
                </label>
                <select
                  value={publishPlatform}
                  onChange={(e) => setPublishPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                >
                  <option value="tiktok">TikTok (@alexriveraclips)</option>
                  <option value="youtube">YouTube Shorts (@AlexStudioShorts)</option>
                  <option value="instagram">Instagram Reels (@alexstudio.reels)</option>
                  <option value="linkedin">LinkedIn (Alex Rivera)</option>
                  <option value="x">X / Twitter (@alexrivera_ai)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Post Caption & Hashtags
                </label>
                <textarea
                  rows={3}
                  value={publishCaption}
                  onChange={(e) => setPublishCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPublishClip(null);
                    router.push("/auto-post/calendar");
                  }}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  Open full Social Calendar →
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-4 py-2 rounded-xl bg-[#04F827] text-black font-black text-xs"
                >
                  {publishing ? "Publishing..." : "Publish Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudioShell>
  );
}
