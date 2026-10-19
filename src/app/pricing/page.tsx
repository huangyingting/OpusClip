"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Check, Sparkles } from "lucide-react";

export default function PublicPricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-between">
      <MarketingNav />
      <main className="max-w-5xl mx-auto px-4 py-14 space-y-10 w-full">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black">
            Plans for Every Creator & Media Team
          </h1>
          <p className="text-sm text-zinc-400">
            Start clipping with AI or scale across your organization with Pro & Business workspaces.
          </p>
          <div className="inline-flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold ${
                !annual ? "bg-white text-black" : "text-zinc-400"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold ${
                annual ? "bg-white text-black" : "text-zinc-400"
              }`}
            >
              Annual (50% OFF)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Starter",
              price: annual ? "$9" : "$15",
              desc: "For solo creators getting started with short-form clips.",
              features: [
                "150 processing credits / month",
                "ClipAnything™ AI Curation & Virality Score™",
                "Animated Karaoke Captions",
                "1080p Watermark-free exports",
              ],
            },
            {
              name: "Pro",
              popular: true,
              price: annual ? "$14.5" : "$29",
              desc: "For full-time creators, podcasters, and marketers.",
              features: [
                "3,600 credits / year upfront",
                "2 Team Seats & 6 Brand Templates",
                "Contextual AI B-Roll & Split-Screen Reframe",
                "Auto-Post Scheduler to 6 Social Networks",
                "Export XML to Premiere Pro & DaVinci Resolve",
              ],
            },
            {
              name: "Business",
              price: annual ? "$59" : "$99",
              desc: "For media agencies and enterprise studio teams.",
              features: [
                "Custom credit pool & priority GPU queue",
                "Invite-Only RBAC, Single-Use Codes & Audit Logs",
                "Dedicated storage & custom brand fonts",
                "Enterprise SLA & API integrations",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-3xl border flex flex-col justify-between gap-6 ${
                plan.popular
                  ? "bg-[#15151E] border-[#04F827]"
                  : "bg-[#121216] border-zinc-800"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black">{plan.name}</span>
                  {plan.popular && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#04F827] text-black font-black text-[10px] uppercase">
                      Most Popular
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-xs text-zinc-400"> / mo</span>
                </div>
                <p className="text-xs text-zinc-400">{plan.desc}</p>
                <ul className="space-y-2 text-xs text-zinc-200 pt-2 border-t border-zinc-800">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#04F827] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/subscription"
                className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs text-center"
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
