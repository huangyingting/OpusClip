"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { StudioShell } from "@/components/studio/StudioShell";
import {
  FolderKanban,
  Bookmark,
  Search,
  Trash2,
  Plus,
  BookOpen,
} from "lucide-react";

interface ProjectRecord {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  durationMs: number;
  genre: string;
  isSaved: boolean;
  createdAt: string;
  _count?: { clips: number };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [showLearningCenter, setShowLearningCenter] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (savedOnly) qs.set("saved", "true");
      if (search.trim()) qs.set("search", search.trim());
      const res = await fetch(`/api/clip-projects?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [savedOnly]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/clip-projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadProjects();
    }
  };

  return (
    <StudioShell breadcrumbs={[{ label: "My projects" }]}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Tabs & Upload CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSavedOnly(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                !savedOnly
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              All projects ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setSavedOnly(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                savedOnly
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <BookOpen className="w-3.5 h-3.5 text-violet-400" />
              <span>Learning center</span>
              <input
                type="checkbox"
                checked={showLearningCenter}
                onChange={(e) => setShowLearningCenter(e.target.checked)}
                className="rounded accent-[#04F827]"
              />
            </label>

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#121216] border border-zinc-800 max-w-md">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadProjects()}
            placeholder="Search projects by title..."
            className="w-full bg-transparent text-xs text-white focus:outline-none"
          />
        </div>

        {/* Learning Center Banner */}
        {showLearningCenter && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#121216] border border-zinc-800/80">
            {[
              {
                title: "Get started with OpusClip",
                desc: "Drop a YouTube link or upload an MP4 to generate 10+ ranked shorts in one click.",
              },
              {
                title: "How to choose the best video",
                desc: "Podcasts, interviews, vlogs, and educational talks score 90+ on Virality Score™.",
              },
              {
                title: "Master ClipAnything™ prompts",
                desc: "Target visual actions, emotions, or specific quotes across your entire library.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1"
              >
                <div className="text-xs font-bold text-white">{card.title}</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            Loading workspace projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-[#121216] border border-zinc-800 space-y-3">
            <FolderKanban className="w-8 h-8 text-zinc-500 mx-auto" />
            <div className="text-sm font-bold text-white">No projects found</div>
            <Link
              href="/dashboard"
              className="inline-block px-4 py-2 rounded-xl bg-white text-black font-bold text-xs"
            >
              Upload your first video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/clip/${p.slug || p.id}`}
                className="group rounded-2xl bg-[#121216] border border-zinc-800/90 hover:border-zinc-700 overflow-hidden flex flex-col justify-between transition"
              >
                <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                  <img
                    src={p.thumbnailUrl}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/80 text-[#04F827] text-[10px] font-bold">
                    {p._count?.clips ?? 18} clips
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-[#04F827]">
                      {p.title}
                    </h3>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {p.genre} • {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(p.id, e)}
                    aria-label={`Delete ${p.title}`}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StudioShell>
  );
}
