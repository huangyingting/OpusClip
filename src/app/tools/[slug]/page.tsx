"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Sparkles, Copy, Check, Wrench } from "lucide-react";

const TOOL_LIST = [
  { slug: "youtube-title-generator", label: "YouTube Title Generator" },
  { slug: "tiktok-caption-generator", label: "TikTok Caption Generator" },
  { slug: "tiktok-hashtag-generator", label: "TikTok Hashtag Generator" },
  { slug: "transcript-maker", label: "AI Transcript Maker" },
  { slug: "ai-show-note-generator", label: "AI Show Note Generator" },
  { slug: "ai-video-summarizer", label: "AI Video Summarizer" },
];

export default function FreeAiCreatorToolPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "youtube-title-generator";

  const [topic, setTopic] = useState(
    "How Danny Duncan Built a $150M Creator Merch Empire"
  );
  const [tone, setTone] = useState("Viral & High-Retention");
  const [results, setResults] = useState<string[]>([]);
  const [toolName, setToolName] = useState("Free AI Creator Tool");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tools/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug: slug, topic, tone }),
      });
      const data = await res.json();
      setToolName(data.toolName || "Free AI Creator Tool");
      setResults(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  const activeMeta =
    TOOL_LIST.find((t) => t.slug === slug) || TOOL_LIST[0];

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-between">
      <MarketingNav />

      <main className="max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        {/* Tool Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {TOOL_LIST.map((t) => (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                t.slug === slug
                  ? "bg-white text-black border-white"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#04F827]/15 text-[#04F827] text-xs font-bold">
            <Wrench className="w-3.5 h-3.5" />
            <span>Free OpusClip Creator Utility</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {activeMeta.label}
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Trained on millions of high-retention YouTube Shorts, TikToks, and Reels. Generate viral hooks and metadata in one click.
          </p>
        </div>

        {/* Generator Form */}
        <form
          onSubmit={handleGenerate}
          className="p-6 rounded-3xl bg-[#121216] border border-zinc-800 space-y-4 shadow-2xl"
        >
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Video Topic, URL, or Raw Notes
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Output Style & Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-semibold"
              >
                <option value="Viral & High-Retention">Viral & High-Retention</option>
                <option value="Contrarian & Curiosity Gap">Contrarian & Curiosity Gap</option>
                <option value="Founder & Executive Authority">Founder & Executive Authority</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#04F827] hover:bg-[#04F827]/90 text-black font-black text-sm flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Generating..." : "Generate with AI"}</span>
            </button>
          </div>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div data-testid="tool-results-list" className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {toolName} Results ({results.length})
            </div>
            {results.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#121216] border border-zinc-800 flex items-center justify-between gap-4"
              >
                <p className="text-sm text-zinc-100 whitespace-pre-line">{item}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(item);
                    setCopiedIdx(idx);
                    setTimeout(() => setCopiedIdx(null), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1 shrink-0"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedIdx === idx ? "Copied" : "Copy"}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
