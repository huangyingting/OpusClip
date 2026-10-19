"use client";

import React from "react";
import Link from "next/link";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Film, ArrowRight } from "lucide-react";

export default function AiBRollMarketingPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-between">
      <MarketingNav />
      <main className="max-w-5xl mx-auto px-4 py-16 space-y-12 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#04F827]/15 text-[#04F827] text-xs font-bold">
            <Film className="w-3.5 h-3.5" />
            <span>Contextual AI B-Roll</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Generate & Insert Visual Cutaways in Seconds
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            OpusClip analyzes your transcript and scene context to automatically place royalty-free Stock B-Roll or generative AI B-Roll at key narrative transitions.
          </p>
          <div className="pt-2">
            <Link
              href="/editor/demo-danny-clip-1"
              className="px-6 py-3 rounded-xl bg-[#04F827] text-black font-black text-sm inline-flex items-center gap-2"
            >
              <span>Open Multi-Track B-Roll Editor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
