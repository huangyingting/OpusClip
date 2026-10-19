"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { StudioShell } from "@/components/studio/StudioShell";
import { Search, Sparkles, ArrowRight } from "lucide-react";

interface SearchClipResult {
  id: string;
  rank: number;
  title: string;
  score: number;
  transcriptText: string;
  sceneAnalysisText: string;
  project?: {
    id: string;
    slug: string;
    title: string;
  };
}

export default function SemanticSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchClipResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async (q = query) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.clips || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch("");
  }, []);

  return (
    <StudioShell breadcrumbs={[{ label: "Create" }, { label: "AI Search" }]}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#04F827]" />
            <span>Multimodal Video Scene & Dialogue Search</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Search across every clip in your workspace by spoken dialogue, visual action, objects, or emotion.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#121216] border border-zinc-800">
          <Search className="w-4 h-4 text-zinc-400 ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
            placeholder="Try searching 'hoodie', 'ice cream', 'merch', 'food truck', or 'retention'..."
            className="flex-1 bg-transparent text-sm text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={() => runSearch(query)}
            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs"
          >
            Search Moments
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-400">
            Searching multimodal scene index...
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((clip) => (
              <div
                key={clip.id}
                className="p-4 rounded-2xl bg-[#121216] border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#04F827]/20 text-[#04F827] font-black text-xs">
                      Score {clip.score}
                    </span>
                    <span className="text-xs text-zinc-400 truncate">
                      {clip.project?.title}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{clip.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    <strong className="text-violet-300">Scene:</strong>{" "}
                    {clip.sceneAnalysisText}
                  </p>
                </div>

                <Link
                  href={`/editor/${clip.id}`}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 shrink-0"
                >
                  <span>Open in Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudioShell>
  );
}
