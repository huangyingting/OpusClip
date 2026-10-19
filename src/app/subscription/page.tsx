"use client";

import React, { useState } from "react";
import { StudioShell } from "@/components/studio/StudioShell";
import { Check, Zap, CreditCard } from "lucide-react";

export default function SubscriptionPage() {
  const [annual, setAnnual] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSelectPlan = async (planName: string, credits: number) => {
    setUpgrading(planName);
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: credits, planName }),
      });
      if (res.ok) {
        setToast(`Switched workspace to ${planName} Plan (+${credits} credits added)!`);
        setTimeout(() => setToast(null), 3500);
      }
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <StudioShell breadcrumbs={[{ label: "Subscription & Credits" }]}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-2">
            <CreditCard className="w-6 h-6 text-[#04F827]" />
            <span>Workspace Plans & Credit Allocation</span>
          </h1>

          {/* Monthly / Yearly Toggle (Matches 08_subscription_desktop.png) */}
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
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                annual ? "bg-white text-black" : "text-zinc-400"
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                50% OFF
              </span>
            </button>
          </div>
        </div>

        {toast && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700 text-xs text-emerald-200 text-center font-bold"
          >
            {toast}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Starter",
              price: annual ? "$9" : "$15",
              credits: 150,
              features: [
                "1,800 credits / year",
                "ClipAnything™ AI Curation & Virality Score™",
                "Animated Karaoke Captions & AI Emojis",
                "1080p HD Watermark-Free Exports",
              ],
            },
            {
              name: "Pro",
              popular: true,
              price: annual ? "$14.5" : "$29",
              credits: 300,
              features: [
                "3,600 credits / year Instantly",
                "Team Workspace with 2 Seats & 6 Brand Templates",
                "AI B-Roll, Active Speaker Split-Screen Reframe",
                "Auto-Post Scheduler to TikTok, Shorts, Reels & X",
                "Export to Premiere Pro & DaVinci Resolve XML",
              ],
            },
            {
              name: "Business",
              price: annual ? "$59" : "$99",
              credits: 1200,
              features: [
                "Custom Enterprise Credit Pools",
                "Invite-Only RBAC, Single-Use Codes & Audit Logs",
                "Dedicated Brand Studio, Custom Fonts & API Access",
                "Priority GPU Rendering Queue",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-6 flex flex-col justify-between gap-6 border ${
                plan.popular
                  ? "bg-[#15151E] border-[#04F827] shadow-2xl"
                  : "bg-[#121216] border-zinc-800/90"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-white">
                    {plan.name}
                  </span>
                  {plan.popular && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#04F827] text-black font-black text-[10px] uppercase">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs text-zinc-400">/ month</span>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#04F827] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled={upgrading === plan.name}
                onClick={() => handleSelectPlan(plan.name, plan.credits)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  plan.popular
                    ? "bg-[#04F827] hover:bg-[#04F827]/90 text-black font-black"
                    : "bg-white hover:bg-zinc-200 text-black"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {upgrading === plan.name
                    ? "Updating Plan..."
                    : `Select ${plan.name} (+${plan.credits} Credits)`}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </StudioShell>
  );
}
