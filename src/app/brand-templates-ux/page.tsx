"use client";

import React, { useEffect, useState } from "react";
import { StudioShell } from "@/components/studio/StudioShell";
import { ClipVideoPlayer } from "@/components/studio/ClipVideoPlayer";
import {
  DEFAULT_BRAND_TEMPLATES,
  type BrandTemplateConfig,
} from "@/lib/ai/clip-engine";
import { Palette, Plus, Save, Check, Sparkles } from "lucide-react";

interface BrandTemplateItem {
  id: string;
  name: string;
  isDefault: boolean;
  aspectRatio: string;
  layoutMode: string;
  presetKey: string;
  configJson: string;
}

export default function BrandTemplateStudioPage() {
  const [templates, setTemplates] = useState<BrandTemplateItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [templateName, setTemplateName] = useState("Default Preset");
  const [activeTab, setActiveTab] = useState<"Setting" | "Style">("Setting");
  const [config, setConfig] = useState<BrandTemplateConfig>(
    DEFAULT_BRAND_TEMPLATES[0].config
  );
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const loadTemplates = async () => {
    const res = await fetch("/api/brand-templates");
    if (res.ok) {
      const data = await res.json();
      const list: BrandTemplateItem[] = data.templates || [];
      setTemplates(list);
      if (list.length > 0 && !selectedId) {
        const first = list[0];
        setSelectedId(first.id);
        setTemplateName(first.name);
        try {
          setConfig({
            ...DEFAULT_BRAND_TEMPLATES[0].config,
            ...JSON.parse(first.configJson),
          });
        } catch {
          // keep default
        }
      }
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSelectTemplate = (tpl: BrandTemplateItem) => {
    setSelectedId(tpl.id);
    setTemplateName(tpl.name);
    try {
      setConfig({
        ...DEFAULT_BRAND_TEMPLATES[0].config,
        ...JSON.parse(tpl.configJson),
      });
    } catch {
      // ignore
    }
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      if (selectedId) {
        const res = await fetch(`/api/brand-templates/${selectedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: templateName, config }),
        });
        if (res.ok) {
          setSavedToast(true);
          setTimeout(() => setSavedToast(false), 2500);
          await loadTemplates();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewTemplate = async () => {
    const res = await fetch("/api/brand-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Custom Brand Preset #${templates.length + 1}`,
        config,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      await loadTemplates();
      if (data.template) {
        handleSelectTemplate(data.template);
      }
    }
  };

  return (
    <StudioShell breadcrumbs={[{ label: "Brand template" }]}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Selector & Save Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#121216] border border-zinc-800/90">
          <div className="flex flex-wrap items-center gap-2">
            <Palette className="w-5 h-5 text-[#04F827]" />
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  selectedId === tpl.id
                    ? "bg-white text-black border-white font-bold"
                    : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {tpl.name}
              </button>
            ))}
            <button
              type="button"
              onClick={handleCreateNewTemplate}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New template</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {savedToast && (
              <span
                role="status"
                className="text-xs text-emerald-400 font-semibold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Template saved
              </span>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveTemplate}
              className="px-4 py-2 rounded-xl bg-[#04F827] hover:bg-[#04F827]/90 text-black font-black text-xs flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Template"}</span>
            </button>
          </div>
        </div>

        {/* Two-Column Studio (Left: Setting & Style Tabs; Right: Live 9:16 Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#121216] border border-zinc-800/90 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                aria-label="Template name"
                className="bg-zinc-900 border border-zinc-700 px-3.5 py-2 rounded-xl text-sm font-bold text-white"
              />

              {/* Setting vs Style Tabs (Matches 19a & 19b screenshots) */}
              <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                {(["Setting", "Style"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === tab
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "Setting" ? (
              <div data-testid="brand-template-setting-tab" className="space-y-6">
                {/* Clip Layout Settings */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Clip layout settings
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-300 mb-1.5">
                        Aspect ratio
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["9:16", "1:1", "16:9"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setConfig({ ...config, aspectRatio: r })}
                            className={`py-2 rounded-xl border text-xs font-bold transition ${
                              config.aspectRatio === r
                                ? "bg-zinc-800 border-[#04F827] text-white"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-300 mb-1.5">
                        Clip layout
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["fill", "fit", "split"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setConfig({ ...config, layoutMode: m })}
                            className={`py-2 rounded-xl border text-xs font-bold capitalize transition ${
                              config.layoutMode === m
                                ? "bg-zinc-800 border-[#04F827] text-white"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Caption & Headline Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                  <div>
                    <label className="block text-xs text-zinc-300 mb-1">
                      Caption lines
                    </label>
                    <select
                      value={config.captionLines}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          captionLines: e.target.value as "1" | "3",
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                    >
                      <option value="3">3 lines</option>
                      <option value="1">1 line (Punchy)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-300 mb-1">
                      Position
                    </label>
                    <select
                      value={config.captionPosition}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          captionPosition: e.target.value as
                            | "auto"
                            | "top"
                            | "middle"
                            | "bottom",
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                    >
                      <option value="auto">Auto</option>
                      <option value="bottom">Bottom</option>
                      <option value="middle">Center</option>
                      <option value="top">Top</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-300 mb-1">
                      Background Music
                    </label>
                    <select
                      value={config.musicTrack}
                      onChange={(e) =>
                        setConfig({ ...config, musicTrack: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                    >
                      <option value="Upbeat Synth Pulse">Upbeat Synth Pulse</option>
                      <option value="High Octane Trap">High Octane Trap</option>
                      <option value="Deep Focus Lo-Fi">Deep Focus Lo-Fi</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>

                {/* AI Automation Toggles (Matches 19c_brand_template_settings_scrolled.png) */}
                <div className="pt-4 border-t border-zinc-800 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#04F827]" />
                    <span>AI Curation & Editing Automation</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { key: "autoHeadline", label: "Auto headline" },
                      { key: "pinFirstSpeaker", label: "Pin first speaker" },
                      { key: "removeFillerWords", label: "Remove filler words" },
                      { key: "removePauses", label: "Remove pauses" },
                      { key: "keywordsHighlighter", label: "AI keywords highlighter" },
                      { key: "aiEmojis", label: "AI emojis" },
                      { key: "autoBroll", label: "Stock video B-roll" },
                      { key: "autoTransitions", label: "Auto transitions" },
                      { key: "autoZoom", label: "Auto zoom" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 cursor-pointer"
                      >
                        <span className="text-zinc-200 font-medium">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(
                            config[item.key as keyof BrandTemplateConfig]
                          )}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="rounded accent-[#04F827]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* STYLE TAB (Matches 19b_brand_template_style_tab.png) */
              <div data-testid="brand-template-style-tab" className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-300 mb-1">
                      Font settings
                    </label>
                    <select
                      value={config.fontFamily}
                      onChange={(e) =>
                        setConfig({ ...config, fontFamily: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-semibold"
                    >
                      <option value="Montserrat">Montserrat Black</option>
                      <option value="Anton">Anton Impact</option>
                      <option value="Inter">Inter ExtraBold</option>
                      <option value="Oswald">Oswald Bold</option>
                      <option value="Rubik">Rubik Bold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-300 mb-1">
                      Animation
                    </label>
                    <select
                      value={config.animation}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          animation: e.target.value as BrandTemplateConfig["animation"],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-semibold"
                    >
                      <option value="Bounce">Bounce</option>
                      <option value="Pop">Pop</option>
                      <option value="Slide">Slide</option>
                      <option value="Fade">Fade</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-zinc-800">
                  <div>
                    <label className="block text-xs text-zinc-300 mb-1">
                      Font Color
                    </label>
                    <input
                      type="color"
                      value={config.fontColor}
                      onChange={(e) =>
                        setConfig({ ...config, fontColor: e.target.value })
                      }
                      className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-300 mb-1">
                      Primary Highlight
                    </label>
                    <input
                      type="color"
                      value={config.highlightPrimary}
                      onChange={(e) =>
                        setConfig({ ...config, highlightPrimary: e.target.value })
                      }
                      className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-300 mb-1">
                      Secondary Highlight
                    </label>
                    <input
                      type="color"
                      value={config.highlightSecondary}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          highlightSecondary: e.target.value,
                        })
                      }
                      className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800">
                  <label className="block text-xs text-zinc-300 mb-1">
                    Auto Headline Banner Text
                  </label>
                  <input
                    type="text"
                    value={config.headlineText}
                    onChange={(e) =>
                      setConfig({ ...config, headlineText: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel (5 cols): Live Interactive 9:16 Video Canvas Preview */}
          <div className="lg:col-span-5 rounded-3xl bg-[#121216] border border-zinc-800/90 p-6 flex flex-col items-center gap-4">
            <div className="text-xs font-semibold text-zinc-400">
              Live Interactive Brand Template Preview ({config.aspectRatio} •{" "}
              {config.layoutMode.toUpperCase()})
            </div>
            <ClipVideoPlayer
              videoUrl="/videos/sample_podcast.mp4"
              transcriptText="This is a sample text so you can preview how your animated karaoke captions and keyword highlights look in real time."
              title={config.headlineText || "VIRAL HIGHLIGHT"}
              durationMs={30000}
              templateConfig={config}
            />
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
