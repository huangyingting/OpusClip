"use client";

import React, { useEffect, useState } from "react";
import { StudioShell } from "@/components/studio/StudioShell";
import { Share2, CheckCircle2, Link2Off } from "lucide-react";

interface SocialAccountRecord {
  id: string;
  platform: string;
  handle: string;
  displayName: string;
  status: string;
  followersCount: number;
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social-accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleToggleConnection = async (id: string) => {
    const res = await fetch("/api/social-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      await loadAccounts();
    }
  };

  return (
    <StudioShell
      breadcrumbs={[{ label: "Post" }, { label: "Social accounts" }]}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-[#04F827]" />
            <span>Connected Social Accounts</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Connect YouTube Shorts, TikTok, Instagram Reels, LinkedIn, X, and Facebook for 1-click Auto-Posting.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-400">
            Loading connected social channels...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const connected = acc.status === "CONNECTED";
              return (
                <div
                  key={acc.id}
                  className="p-5 rounded-2xl bg-[#121216] border border-zinc-800/90 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="uppercase px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-200 font-bold text-[10px]">
                        {acc.platform}
                      </span>
                      <span
                        className={`text-[11px] font-bold flex items-center gap-1 ${
                          connected ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {connected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                          </>
                        ) : (
                          <>
                            <Link2Off className="w-3.5 h-3.5" /> Disconnected
                          </>
                        )}
                      </span>
                    </div>
                    <div className="text-base font-bold text-white">
                      {acc.displayName}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {acc.handle} • {acc.followersCount.toLocaleString()} followers
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleConnection(acc.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                      connected
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                        : "bg-white hover:bg-zinc-200 text-black"
                    }`}
                  >
                    {connected ? "Disconnect" : "Connect Account"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudioShell>
  );
}
