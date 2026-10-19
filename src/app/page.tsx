"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import {
  Sparkles,
  Link2,
  ArrowRight,
  Wand2,
  Type,
  Film,
  Maximize2,
  Calendar,
  Play,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  );

  const handleGetClips = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard?url=${encodeURIComponent(videoUrl)}`);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-between">
      <MarketingNav />

      <main className="space-y-24 pb-16">
        {/* Hero Section (Mirrors 01_www_home_desktop.png) */}
        <section className="max-w-5xl mx-auto px-4 pt-14 sm:pt-20 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-[#04F827]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>#1 AI VIDEO CLIPPING & MULTIMODAL REPURPOSING TOOL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08]">
            1 long video,{" "}
            <span className="bg-gradient-to-r from-[#04F827] via-emerald-300 to-violet-400 bg-clip-text text-transparent">
              10 viral clips.
            </span>{" "}
            Create 10x faster.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            OpusClip turns your long podcasts, interviews, vlogs, and streams into high-retention Shorts, TikToks, and Reels with ClipAnything™, Virality Score™, Animated Captions, and Active Speaker Reframe.
          </p>

          {/* Interactive Dropzone / URL Bar */}
          <form
            onSubmit={handleGetClips}
            className="max-w-2xl mx-auto p-2 rounded-2xl bg-[#15151B] border border-zinc-700/80 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="flex items-center gap-2.5 flex-1 px-3 py-2">
              <Link2 className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Drop a YouTube, Loom, or Zoom link..."
                className="w-full bg-transparent text-sm text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#04F827] hover:bg-[#04F827]/90 text-black font-black text-sm flex items-center justify-center gap-1.5 transition shrink-0"
            >
              <span>Get free clips</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 pt-2">
            <Link
              href="/clip/demo-danny"
              className="inline-flex items-center gap-1.5 text-white hover:text-[#04F827] font-semibold underline underline-offset-4"
            >
              <Play className="w-3.5 h-3.5 text-[#04F827] fill-current" />
              <span>Explore Live Demo Project: 24 Hours with Danny Duncan (18 AI Clips)</span>
            </Link>
          </div>
        </section>

        {/* Feature Suite Bento Grid */}
        <section className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black">
              Powered by Multimodal AI Curation
            </h2>
            <p className="text-sm text-zinc-400">
              Every tool you need to clip, caption, reframe, enhance, and schedule across every social channel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                href: "/clip-anything",
                icon: Wand2,
                badge: "ClipAnything™",
                title: "Clip Any Moment From Any Video",
                desc: "Use natural-language prompts to extract visual actions, emotional peaks, or contrarian soundbites with Virality Score™ grading.",
              },
              {
                href: "/captions",
                icon: Type,
                badge: "98.5% Accuracy",
                title: "Animated Karaoke Captions",
                desc: "Word-by-word highlighted subtitles with dynamic green/yellow keyword pop-ins and contextual AI emojis.",
              },
              {
                href: "/reframe",
                icon: Maximize2,
                badge: "ReframeAnything",
                title: "Active Speaker & Split-Screen",
                desc: "Automatically track moving speakers, switch between single-speaker and 2-up podcast split layouts in 9:16, 1:1, or 16:9.",
              },
              {
                href: "/ai-b-roll",
                icon: Film,
                badge: "Retention Boost",
                title: "Contextual AI & Stock B-Roll",
                desc: "Automatically overlay relevant visual cutaways every 6–8 seconds to eliminate talking-head fatigue.",
              },
              {
                href: "/brand-templates-ux",
                icon: Sparkles,
                badge: "Brand Studio",
                title: "Custom Brand Templates",
                desc: "Save your custom fonts, colors, watermarks, and intro/outro bumpers across 6 reusable workspace presets.",
              },
              {
                href: "/auto-post/calendar",
                icon: Calendar,
                badge: "Social Scheduler",
                title: "Auto-Post to TikTok, Shorts & Reels",
                desc: "Schedule clips across 6 platforms simultaneously and track audience engagement from a unified dashboard.",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="p-6 rounded-3xl bg-[#121216] border border-zinc-800/90 hover:border-zinc-600 transition flex flex-col justify-between gap-5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-[#04F827]">
                        {card.badge}
                      </span>
                      <Icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {card.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-white flex items-center gap-1 group-hover:text-[#04F827] transition">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Enterprise Governance & Invite-Only Security Section */}
        <section className="max-w-5xl mx-auto px-4">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#14141D] to-[#0E0E13] border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#04F827]">
                Enterprise Workspace Security
              </div>
              <h3 className="text-2xl font-black text-white">
                Invite-Only Admission, Single-Use Codes & Full Audit Logs
              </h3>
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                Protect your media team with single-use SHA-256 hashed invitation links, role-based access control (Admin, Creator, Viewer), immediate revocation, and immutable security audit trails.
              </p>
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-zinc-300">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#04F827]" />
                  Single-Use Expiring Invites
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#04F827]" />
                  CLI Admin Bootstrap
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#04F827]" />
                  SQLite Dev + PostgreSQL Prod
                </span>
              </div>
            </div>
            <Link
              href="/auth/login"
              className="px-5 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs shrink-0"
            >
              Sign In to Studio
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
