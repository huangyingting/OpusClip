"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { StudioShell } from "@/components/studio/StudioShell";
import {
  Calendar as CalendarIcon,
  Plus,
  Share2,
  Trash2,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

interface ScheduledPostItem {
  id: string;
  platform: string;
  title: string;
  caption: string;
  scheduledAt: string;
  status: string;
  viewsCount: number;
}

export default function SocialCalendarPage() {
  const [posts, setPosts] = useState<ScheduledPostItem[]>([]);
  const [viewMode, setViewMode] = useState<"Month" | "Week">("Month");
  const [timezone, setTimezone] = useState("(GMT+00:00) UTC");
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [caption, setCaption] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = async () => {
    const res = await fetch("/api/post-tasks");
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts || []);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/post-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          platform,
          caption,
          scheduledAt: new Date(scheduledDate).toISOString(),
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setTitle("");
        setCaption("");
        await loadPosts();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/post-tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadPosts();
    }
  };

  return (
    <StudioShell breadcrumbs={[{ label: "Post" }, { label: "Calendar" }]}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Calendar Toolbar (Matches 05_calendar_desktop.png) */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#121216] border border-zinc-800/90">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-[#04F827]" />
            <h1 className="text-lg font-black text-white">
              Auto-Post Social Scheduler
            </h1>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              aria-label="Timezone"
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
            >
              <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
              <option value="(GMT-05:00) Eastern Time">(GMT-05:00) EST</option>
              <option value="(GMT-08:00) Pacific Time">(GMT-08:00) PST</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              {(["Month", "Week"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    viewMode === m ? "bg-white text-black" : "text-zinc-400"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <Link
              href="/post/plansocial"
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Social Accounts</span>
            </Link>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule post</span>
            </button>
          </div>
        </div>

        {/* Scheduled & Published Queue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-[#121216] border border-zinc-800/90 flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold text-[10px] uppercase">
                    {post.platform}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase inline-flex items-center gap-1 ${
                      post.status === "PUBLISHED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {post.status === "PUBLISHED" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {post.status}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {new Date(post.scheduledAt).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{post.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {post.caption}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(post.id)}
                aria-label={`Delete scheduled post ${post.title}`}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Post Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#141419] border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Schedule Social Video Post
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Why 99% of Creators Miss This Hook"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube Shorts</option>
                    <option value="instagram">Instagram Reels</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="x">X (Twitter)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Publish Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Caption & Hashtags
                </label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Drop your thoughts below! 🔥 #viralshorts #opusclip"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#04F827] text-black font-black text-xs"
                >
                  {submitting ? "Scheduling..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudioShell>
  );
}
