"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

interface InvitationInfo {
  id: string;
  status: "pending" | "accepted" | "revoked" | "expired" | "invalid";
  email: string | null;
  maskedEmail: string | null;
  role: string;
  expiresAt: string | null;
  workspaceName: string;
}

export default function AcceptInvitationPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || "";
  const router = useRouter();

  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/invitations/${encodeURIComponent(token)}`);
        const data = await res.json();
        setInfo(data.invitation || null);
      } catch {
        setInfo(null);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/invitations/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          password,
          email: info?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to redeem invitation.");
      } else {
        setAcceptedSuccess(true);
        if (info?.email) {
          await signIn("credentials", {
            email: info.email,
            password,
            redirect: false,
          });
        }
        setTimeout(() => {
          router.push("/dashboard");
        }, 900);
      }
    } catch {
      setError("Network error while accepting invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#121216] border border-zinc-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl">
            <span className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm">
              O
            </span>
            <span>OpusClip</span>
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
            Workspace Invitation
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-zinc-400">
            Verifying cryptographic invitation token...
          </div>
        ) : !info || info.status !== "pending" ? (
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-red-200 uppercase">
                  Invitation {info?.status || "Invalid"}
                </div>
                <p className="text-xs text-red-300">
                  This single-use invitation link is either invalid, expired, revoked by an administrator, or has already been redeemed.
                </p>
              </div>
            </div>
            <Link
              href="/auth/login"
              className="block w-full py-2.5 text-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
            >
              Return to Sign In
            </Link>
          </div>
        ) : acceptedSuccess ? (
          <div className="p-5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-base font-bold text-white">
              Account Activated!
            </div>
            <p className="text-xs text-emerald-200">
              Redirecting you to {info.workspaceName}...
            </p>
          </div>
        ) : (
          <form onSubmit={handleAccept} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#04F827]" />
                <span>Joining:</span>
                <strong className="text-white">{info.workspaceName}</strong>
              </div>
              <div className="text-xs text-zinc-400">
                Bound Email: <strong className="text-zinc-200">{info.email}</strong>
              </div>
              <div className="text-xs text-zinc-400">
                Assigned Role:{" "}
                <span className="uppercase px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                  {info.role}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Taylor Brooks"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Create Password (min. 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#04F827] hover:bg-[#04F827]/90 text-black font-black text-sm flex items-center justify-center gap-2 transition"
            >
              <span>{submitting ? "Activating Account..." : "Accept Invite & Join Studio"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
