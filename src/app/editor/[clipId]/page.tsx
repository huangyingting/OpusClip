"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StudioShell } from "@/components/studio/StudioShell";
import { ClipVideoPlayer } from "@/components/studio/ClipVideoPlayer";
import {
  buildWordsFromTranscript,
  DEFAULT_BRAND_TEMPLATES,
  type BrandTemplateConfig,
} from "@/lib/ai/clip-engine";
import {
  Save,
  Download,
  FileCode2,
  Scissors,
  Sparkles,
  Subtitles,
  Layers,
  Volume2,
  Check,
  ArrowLeft,
} from "lucide-react";

interface ClipDetailResponse {
  id: string;
  projectId: string;
  rank: number;
  title: string;
  score: number;
  startMs: number;
  endMs: number;
  durationMs: number;
  videoUrl: string;
  transcriptText: string;
  sceneAnalysisText: string;
  renderPrefOverrideJson: string | null;
  project?: {
    id: string;
    slug: string;
    title: string;
    brandTemplate?: {
      configJson: string;
    } | null;
  };
}

export default function ClipMultiTrackEditorPage() {
  const params = useParams<{ clipId: string }>();
  const clipId = params?.clipId || "demo-danny-clip-1";

  const [clip, setClip] = useState<ClipDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [title, setTitle] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(45);
  const [playheadSec, setPlayheadSec] = useState(0);

  const [styleConfig, setStyleConfig] = useState<BrandTemplateConfig>(
    DEFAULT_BRAND_TEMPLATES[0].config
  );

  useEffect(() => {
    async function loadClip() {
      setLoading(true);
      try {
        const res = await fetch(`/api/exportable-clips/${encodeURIComponent(clipId)}`);
        if (res.ok) {
          const data = await res.json();
          const c: ClipDetailResponse = data.clip;
          setClip(c);
          setTitle(c.title);
          setTranscriptText(c.transcriptText);
          setStartSec(Math.round(c.startMs / 1000));
          setEndSec(Math.round(c.endMs / 1000));

          if (c.renderPrefOverrideJson) {
            setStyleConfig({
              ...DEFAULT_BRAND_TEMPLATES[0].config,
              ...JSON.parse(c.renderPrefOverrideJson),
            });
          } else if (c.project?.brandTemplate?.configJson) {
            setStyleConfig({
              ...DEFAULT_BRAND_TEMPLATES[0].config,
              ...JSON.parse(c.project.brandTemplate.configJson),
            });
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadClip();
  }, [clipId]);

  const durationSec = Math.max(5, endSec - startSec);
  const words = useMemo(
    () => buildWordsFromTranscript(transcriptText, durationSec),
    [transcriptText, durationSec]
  );

  const handleSaveChanges = async () => {
    if (!clip) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/exportable-clips/${encodeURIComponent(clip.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          transcriptText,
          startMs: startSec * 1000,
          endMs: endSec * 1000,
          renderPrefOverride: styleConfig,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setClip((prev) => (prev ? { ...prev, ...data.clip } : prev));
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudioShell
      breadcrumbs={[
        {
          label: clip?.project?.title || "Project",
          href: `/clip/${clip?.project?.slug || clip?.projectId || "demo-danny"}`,
        },
        { label: `Multi-Track Editor — Clip #${clip?.rank || 1}` },
      ]}
    >
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Top Editor Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#121216] border border-zinc-800/90">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href={`/clip/${clip?.project?.slug || clip?.projectId || "demo-danny"}`}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
              aria-label="Back to project clips"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Clip title"
              className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-zinc-600"
            />
            <span className="px-2.5 py-1 rounded-lg bg-[#04F827]/20 text-[#04F827] font-black text-xs shrink-0">
              Score {clip?.score || 99}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {savedToast && (
              <span
                role="status"
                className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mr-2"
              >
                <Check className="w-3.5 h-3.5" /> Changes saved
              </span>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveChanges}
              className="px-4 py-2 rounded-xl bg-[#04F827] hover:bg-[#04F827]/90 text-black font-black text-xs flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
            <a
              href={`/api/exportable-clips/${clipId}/export?format=mp4`}
              download
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export MP4</span>
            </a>
            <a
              href={`/api/exportable-clips/${clipId}/export?format=xml`}
              download
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>XML</span>
            </a>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            Loading Multi-Track AI Video Editor...
          </div>
        ) : (
          <>
            {/* 3-Column Studio Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column (5 cols): Interactive Word-Level Transcript & Trim Editor */}
              <div className="lg:col-span-5 rounded-2xl bg-[#121216] border border-zinc-800/90 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Subtitles className="w-4 h-4 text-[#04F827]" />
                    <span>Word-Level Transcript Editor</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Click any word to seek video
                  </span>
                </div>

                {/* Clickable Word Pills */}
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 max-h-56 overflow-y-auto flex flex-wrap gap-1.5">
                  {words.map((w, i) => {
                    const isActive =
                      playheadSec >= w.tr[0] && playheadSec <= w.tr[1];
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPlayheadSec(w.tr[0])}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                          isActive
                            ? "bg-[#04F827] text-black font-bold"
                            : w.highlight === "primary"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                              : "bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700"
                        }`}
                      >
                        {w.text}
                      </button>
                    );
                  })}
                </div>

                {/* Editable Raw Transcript Textarea */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Edit Spoken Caption Text
                  </label>
                  <textarea
                    rows={4}
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    aria-label="Edit Spoken Caption Text"
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white leading-relaxed focus:outline-none focus:border-white"
                  />
                </div>

                {/* Trim Start / End Controls */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Start Trim (sec)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={startSec}
                      onChange={(e) => setStartSec(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      End Trim (sec)
                    </label>
                    <input
                      type="number"
                      min={startSec + 5}
                      value={endSec}
                      onChange={(e) => setEndSec(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Center Column (4 cols): Live Canvas Preview */}
              <div className="lg:col-span-4 rounded-2xl bg-[#121216] border border-zinc-800/90 p-5 space-y-4">
                {/* Aspect Ratio & Layout Mode Pills */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    {(["9:16", "1:1", "16:9"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() =>
                          setStyleConfig({ ...styleConfig, aspectRatio: ratio })
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          styleConfig.aspectRatio === ratio
                            ? "bg-white text-black"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    {(["fill", "fit", "split"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          setStyleConfig({ ...styleConfig, layoutMode: mode })
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                          styleConfig.layoutMode === mode
                            ? "bg-violet-600 text-white"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <ClipVideoPlayer
                  videoUrl={clip?.videoUrl || "/videos/sample_podcast.mp4"}
                  transcriptText={transcriptText}
                  title={title}
                  durationMs={durationSec * 1000}
                  templateConfig={styleConfig}
                  currentTimeSecExternal={playheadSec}
                  onTimeUpdateSec={setPlayheadSec}
                />
              </div>

              {/* Right Column (3 cols): Style, Caption Animation & AI Layer Inspector */}
              <div className="lg:col-span-3 rounded-2xl bg-[#121216] border border-zinc-800/90 p-5 space-y-4">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>Caption & AI Layers</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Headline Hook Banner
                  </label>
                  <input
                    type="text"
                    value={styleConfig.headlineText}
                    onChange={(e) =>
                      setStyleConfig({
                        ...styleConfig,
                        autoHeadline: true,
                        headlineText: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Font Family
                  </label>
                  <select
                    value={styleConfig.fontFamily}
                    onChange={(e) =>
                      setStyleConfig({ ...styleConfig, fontFamily: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  >
                    <option value="Montserrat">Montserrat Black</option>
                    <option value="Anton">Anton Impact</option>
                    <option value="Inter">Inter ExtraBold</option>
                    <option value="Oswald">Oswald Bold</option>
                    <option value="Rubik">Rubik Bold</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Primary Highlight
                    </label>
                    <input
                      type="color"
                      value={styleConfig.highlightPrimary}
                      onChange={(e) =>
                        setStyleConfig({
                          ...styleConfig,
                          highlightPrimary: e.target.value,
                        })
                      }
                      className="w-full h-8 rounded cursor-pointer bg-zinc-900 border border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Secondary Highlight
                    </label>
                    <input
                      type="color"
                      value={styleConfig.highlightSecondary}
                      onChange={(e) =>
                        setStyleConfig({
                          ...styleConfig,
                          highlightSecondary: e.target.value,
                        })
                      }
                      className="w-full h-8 rounded cursor-pointer bg-zinc-900 border border-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                  {[
                    { key: "autoHeadline", label: "Auto Headline Banner" },
                    { key: "autoBroll", label: "AI Stock Video B-Roll" },
                    { key: "aiEmojis", label: "Dynamic AI Emojis" },
                    { key: "uppercase", label: "Uppercase Karaoke Text" },
                  ].map((toggle) => (
                    <label
                      key={toggle.key}
                      className="flex items-center justify-between py-1 cursor-pointer text-zinc-300"
                    >
                      <span>{toggle.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(
                          styleConfig[toggle.key as keyof BrandTemplateConfig]
                        )}
                        onChange={(e) =>
                          setStyleConfig({
                            ...styleConfig,
                            [toggle.key]: e.target.checked,
                          })
                        }
                        className="rounded accent-[#04F827]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Multi-Track NLE Timeline */}
            <div className="rounded-2xl bg-[#121216] border border-zinc-800/90 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2 font-semibold text-zinc-200">
                  <Scissors className="w-3.5 h-3.5 text-[#04F827]" />
                  <span>Multi-Track Timeline</span>
                </div>
                <span className="font-mono">
                  Playhead: {playheadSec.toFixed(1)}s / {durationSec}s
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] font-medium">
                <div className="flex items-center gap-3">
                  <span className="w-28 text-zinc-400 flex items-center gap-1.5">
                    <Subtitles className="w-3 h-3 text-[#04F827]" /> Captions
                  </span>
                  <div className="flex-1 h-7 rounded-lg bg-emerald-950/60 border border-emerald-700/60 px-3 flex items-center justify-between text-emerald-200 overflow-hidden">
                    <span className="truncate">{transcriptText.slice(0, 90)}...</span>
                    <span className="font-mono text-[10px]">Karaoke Sync</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-28 text-zinc-400 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-violet-400" /> AI B-Roll
                  </span>
                  <div className="flex-1 h-7 rounded-lg bg-violet-950/50 border border-violet-700/50 px-3 flex items-center justify-between text-violet-200">
                    <span>Contextual B-Roll Overlay + Active Speaker Reframe ({styleConfig.layoutMode})</span>
                    <span className="font-mono text-[10px]">{styleConfig.aspectRatio}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-28 text-zinc-400 flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3 text-amber-400" /> Audio Master
                  </span>
                  <div className="flex-1 h-7 rounded-lg bg-amber-950/40 border border-amber-700/40 px-3 flex items-center justify-between text-amber-200">
                    <span>Enhanced Studio Speech + {styleConfig.musicTrack}</span>
                    <span className="font-mono text-[10px]">-14 LUFS</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </StudioShell>
  );
}
