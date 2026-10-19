"use client";

import React from "react";
import Link from "next/link";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Wand2, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ClipAnythingMarketingPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-between">
      <MarketingNav />
      <main className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#04F827]/15 text-[#04F827] text-xs font-bold">
            <Wand2 className="w-3.5 h-3.5" />
            <span>ClipAnything™ Multimodal Curation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Clip Any Moment From Any Genre of Video
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Powered by visual scene analysis, audio emotion detection, and semantic hooks. Clip sports highlights, gaming streams, vlogs, and podcasts using natural-language prompts.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-[#04F827] text-black font-black text-sm inline-flex items-center gap-2"
            >
              <span>Try ClipAnything™ in Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/clip/demo-danny"
              className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold text-sm"
            >
              View 18-Clip Demo Output
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: "Visual + Audio + Sentiment",
              desc: "Understands facial expressions, crowd reactions, laughter, and visual scene transitions—not just transcripts.",
            },
            {
              title: "Custom Prompt Curation",
              desc: "Type prompts like 'Find every moment about building a $150M business or giving away gifts' to isolate exact chapters.",
            },
            {
              title: "Virality Score™ Breakdown",
              desc: "Every clip receives a 0–99 Virality Score™ with detailed Hook, Flow, Engagement, and Trend explanations.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-3xl bg-[#121216] border border-zinc-800 space-y-2.5"
            >
              <Sparkles className="w-5 h-5 text-[#04F827]" />
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
