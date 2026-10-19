"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ArrowRight, Wrench } from "lucide-react";

export function MarketingNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "ClipAnything", href: "/clip-anything" },
    { label: "AI Captions", href: "/captions" },
    { label: "AI B-Roll", href: "/ai-b-roll" },
    { label: "AI Reframe", href: "/reframe" },
    { label: "Pricing", href: "/pricing" },
    { label: "Free AI Tools", href: "/tools/youtube-title-generator" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#09090B]/85 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-white">
            <span className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm">
              O
            </span>
            <span>OpusClip</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition ${
                    active ? "text-[#04F827]" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-3.5 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-bold flex items-center gap-1.5 transition"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#09090B] py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1 space-y-3">
          <div className="flex items-center gap-2 font-black text-lg text-white">
            <span className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-black text-xs">
              O
            </span>
            <span>OpusClip</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            #1 AI video clipping & editing tool turning long videos into viral shorts in one click.
          </p>
        </div>

        <div className="space-y-2">
          <div className="font-semibold text-white text-xs uppercase tracking-wider">Features</div>
          <ul className="space-y-1.5 text-zinc-400 text-xs">
            <li><Link href="/clip-anything" className="hover:text-white">ClipAnything™</Link></li>
            <li><Link href="/captions" className="hover:text-white">Animated Captions</Link></li>
            <li><Link href="/ai-b-roll" className="hover:text-white">AI B-Roll</Link></li>
            <li><Link href="/reframe" className="hover:text-white">AI Reframe 9:16</Link></li>
          </ul>
        </div>

        <div className="space-y-2">
          <div className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-[#04F827]" /> Free AI Tools
          </div>
          <ul className="space-y-1.5 text-zinc-400 text-xs">
            <li><Link href="/tools/youtube-title-generator" className="hover:text-white">YouTube Title Generator</Link></li>
            <li><Link href="/tools/tiktok-caption-generator" className="hover:text-white">TikTok Caption Generator</Link></li>
            <li><Link href="/tools/tiktok-hashtag-generator" className="hover:text-white">TikTok Hashtag Generator</Link></li>
            <li><Link href="/tools/transcript-maker" className="hover:text-white">AI Transcript Maker</Link></li>
            <li><Link href="/tools/ai-show-note-generator" className="hover:text-white">Show Note Generator</Link></li>
          </ul>
        </div>

        <div className="space-y-2">
          <div className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Workspace
          </div>
          <ul className="space-y-1.5 text-zinc-400 text-xs">
            <li><Link href="/dashboard" className="hover:text-white">Creator Dashboard</Link></li>
            <li><Link href="/clip/demo-danny" className="hover:text-white">Sample Project (Danny Duncan)</Link></li>
            <li><Link href="/pricing" className="hover:text-white">Pricing & Credits</Link></li>
            <li><Link href="/auth/login" className="hover:text-white">Invite-Only Sign In</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
