"use client";

import React from "react";
import Link from "next/link";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Type, ArrowRight } from "lucide-react";

export default function CaptionsMarketingPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-between">
      <MarketingNav />
      <main className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#04F827]/15 text-[#04F827] text-xs font-bold">
            <Type className="w-3.5 h-3.5" />
            <span>AI Animated Captions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Word-by-Word Karaoke Subtitles That Stop the Scroll
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            80% of social videos are watched on mute. Add high-retention animated captions with keyword highlighting in #04F827 and #FFF000 plus automatic emojis.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/brand-templates-ux"
              className="px-6 py-3 rounded-xl bg-[#04F827] text-black font-black text-sm inline-flex items-center gap-2"
            >
              <span>Customize Caption Templates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: "Karaoke Pop",
              sample: "NEVER TAKE NO",
              highlight: "#04F827",
              desc: "High-contrast Montserrat ExtraBold with neon green active-word bounce.",
            },
            {
              name: "Beasty Minimal",
              sample: "$150M EMPIRE",
              highlight: "#FFF000",
              desc: "Fast 1-line upper-case punch captions inspired by top YouTube creators.",
            },
            {
              name: "Podcast Split",
              sample: "KEY INSIGHT",
              highlight: "#38BDF8",
              desc: "Balanced mid-screen captions optimized for 2-speaker split-screen layouts.",
            },
          ].map((preset) => (
            <div
              key={preset.name}
              className="p-6 rounded-3xl bg-[#121216] border border-zinc-800 space-y-4 text-center"
            >
              <div className="py-6 rounded-2xl bg-black border border-zinc-800 font-black text-xl tracking-wide">
                <span style={{ color: preset.highlight }}>{preset.sample}</span>
              </div>
              <h3 className="text-base font-bold text-white">{preset.name}</h3>
              <p className="text-xs text-zinc-400">{preset.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
