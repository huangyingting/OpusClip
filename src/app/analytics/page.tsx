"use client";

import React, { useEffect, useState } from "react";
import { StudioShell } from "@/components/studio/StudioShell";
import { BarChart3, Eye, Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";

interface PostMetric {
  id: string;
  platform: string;
  title: string;
  status: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  scheduledAt: string;
}

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<PostMetric[]>([]);

  useEffect(() => {
    fetch("/api/post-tasks")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {});
  }, []);

  const totalViews = posts.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalLikes = posts.reduce((acc, p) => acc + (p.likesCount || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p.commentsCount || 0), 0);
  const totalShares = posts.reduce((acc, p) => acc + (p.sharesCount || 0), 0);

  return (
    <StudioShell breadcrumbs={[{ label: "Post" }, { label: "Analytics" }]}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#04F827]" />
            <span>Cross-Platform Short-Form Analytics</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time views, retention, and engagement across TikTok, YouTube Shorts, Reels, and LinkedIn.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Clip Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-[#04F827]" },
            { label: "Total Likes", value: totalLikes.toLocaleString(), icon: Heart, color: "text-rose-400" },
            { label: "Comments", value: totalComments.toLocaleString(), icon: MessageCircle, color: "text-sky-400" },
            { label: "Total Shares", value: totalShares.toLocaleString(), icon: Share2, color: "text-amber-400" },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="p-5 rounded-2xl bg-[#121216] border border-zinc-800/90 space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>{kpi.label}</span>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <div className="text-2xl font-black text-white">{kpi.value}</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +34.8% vs last 30d
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Performing Clips Table */}
        <div className="rounded-2xl bg-[#121216] border border-zinc-800/90 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-white">
              Published & Scheduled Clip Performance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase">
                <tr>
                  <th className="px-6 py-3">Clip Title</th>
                  <th className="px-6 py-3">Platform</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Views</th>
                  <th className="px-6 py-3">Likes</th>
                  <th className="px-6 py-3">Shares</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/40">
                    <td className="px-6 py-3.5 font-semibold text-white">
                      {p.title}
                    </td>
                    <td className="px-6 py-3.5 uppercase text-violet-300 font-bold">
                      {p.platform}
                    </td>
                    <td className="px-6 py-3.5">{p.status}</td>
                    <td className="px-6 py-3.5 font-mono text-zinc-200">
                      {p.viewsCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-200">
                      {p.likesCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-200">
                      {p.sharesCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
