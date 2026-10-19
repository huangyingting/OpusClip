"use client";

import React from "react";
import Link from "next/link";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Maximize2, ArrowRight } from "lucide-react";

export default function ReframeMarketingPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-between">
      <MarketingNav />
      <main className="max-w-5xl mx-auto px-4 py-16 space-y-12 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#04F827]/15 text-[#04F827] text-xs font-bold">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>AI ReframeAnything™</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Smart Active-Speaker Tracking for 9:16, 1:1 & 16:9
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Convert wide 16:9 podcasts and interviews into vertical 9:16 Shorts with automatic face centering, multi-speaker split screen, or blurred background fill.
          </p>
          <div className="pt-2">
            <Link
              href="/editor/demo-danny-clip-1"
              className="px-6 py-3 rounded-xl bg-[#04F827] text-black font-black text-sm inline-flex items-center gap-2"
            >
              <span>Test Aspect Ratios in Editor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
