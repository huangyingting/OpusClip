"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Shield, KeyRound, ArrowRight, Lock, Sparkles } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("admin@opusclip.local");
  const [password, setPassword] = useState("AdminPassword123!");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [directRegMessage, setDirectRegMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDirectRegMessage(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password, or account is disabled.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestDirectRegistration = async () => {
    setError(null);
    setDirectRegMessage(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "uninvited@external.com",
        name: "Uninvited User",
        password: "Password123!",
      }),
    });
    const data = await res.json();
    setDirectRegMessage(`${res.status} ${data.code}: ${data.error}`);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-black text-2xl tracking-tight text-white"
          >
            <span className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-base">
              O
            </span>
            <span>OpusClip</span>
          </Link>
          <h1 className="text-xl font-bold text-zinc-100">
            Sign in to OpusClip Studio
          </h1>
          <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#04F827]" />
            <span>Invite-Only Workspace Admission Enabled</span>
          </p>
        </div>

        {/* Main Credentials Card */}
        <div className="p-6 rounded-2xl bg-[#121216] border border-zinc-800/90 shadow-2xl space-y-5">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Workspace Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@opusclip.local"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <span>{loading ? "Signing in..." : "Continue to Studio"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-2">
            <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quick-Fill Seeded Workspace Accounts:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@opusclip.local");
                  setPassword("AdminPassword123!");
                }}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("creator@opusclip.local");
                  setPassword("CreatorPass123!");
                }}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200"
              >
                Creator
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("viewer@opusclip.local");
                  setPassword("ViewerPass123!");
                }}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200"
              >
                Viewer
              </button>
            </div>
          </div>

          {/* Redeem Invitation Code */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-2">
            <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-violet-400" />
              <span>Have a Single-Use Invitation Code?</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Paste invitation token or /invite/... URL"
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  const raw = inviteCode.trim();
                  if (!raw) return;
                  const token = raw.includes("/invite/")
                    ? raw.split("/invite/")[1].split(/[?#]/)[0]
                    : raw;
                  router.push(`/invite/${token}`);
                }}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
              >
                Redeem
              </button>
            </div>
          </div>

          {/* Invite-Only Policy Verification Action */}
          <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleTestDirectRegistration}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1.5 py-1"
            >
              <Lock className="w-3 h-3" />
              <span>Need an account? Check public sign-up policy</span>
            </button>
            {directRegMessage && (
              <div
                data-testid="direct-reg-policy-banner"
                className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-[11px] text-amber-200"
              >
                {directRegMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090B]" />}>
      <LoginFormContent />
    </Suspense>
  );
}
