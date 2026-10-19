"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { StudioShell } from "@/components/studio/StudioShell";
import {
  ShieldCheck,
  UserPlus,
  Ban,
  Copy,
  Check,
  Users,
  ScrollText,
  RefreshCw,
} from "lucide-react";

interface InvitationRecord {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
}

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  creditsBalance: number;
  planName: string;
  createdAt: string;
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"creator" | "viewer" | "admin">("creator");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [createdAcceptUrl, setCreatedAcceptUrl] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, usrRes] = await Promise.all([
        fetch("/api/invitations"),
        fetch("/api/admin/users"),
      ]);
      if (!invRes.ok || !usrRes.ok) {
        const errPayload = await invRes.json().catch(() => ({}));
        setError(errPayload.error || "Administrator access required.");
      } else {
        const invData = await invRes.json();
        const usrData = await usrRes.json();
        setInvitations(invData.invitations || []);
        setUsers(usrData.users || []);
      }
    } catch {
      setError("Failed to load invitations and users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreatedAcceptUrl(null);
    setCreatedToken(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, expiresInDays }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create invitation.");
      } else {
        setCreatedAcceptUrl(data.acceptUrl);
        setCreatedToken(data.token);
        setEmail("");
        await loadData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    const res = await fetch(`/api/invitations/by-id/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadData();
    }
  };

  const handleUpdateUser = async (
    id: string,
    patch: { role?: string; status?: string }
  ) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      await loadData();
    } else {
      const data = await res.json().catch(() => ({}));
      if (data.error) setError(data.error);
    }
  };

  return (
    <StudioShell
      breadcrumbs={[
        { label: "Workspace Security", href: "/admin/invitations" },
        { label: "Invitations & RBAC" },
      ]}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#04F827]" />
              <span>Invite-Only Access & Role-Based Authorization</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Manage single-use, expiring SHA-256 hashed invitation codes, revoke pending links, and assign workspace RBAC roles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/audit-logs"
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
            >
              <ScrollText className="w-4 h-4 text-violet-400" />
              <span>View Security Audit Logs</span>
            </Link>
            <button
              type="button"
              onClick={loadData}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
              aria-label="Refresh invitations"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-xs text-red-200"
          >
            {error}
          </div>
        )}

        {/* Issue Single-Use Invitation Card */}
        <div className="p-6 rounded-2xl bg-[#121216] border border-zinc-800/90 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <UserPlus className="w-4 h-4 text-[#04F827]" />
            <span>Issue Single-Use Invitation Code</span>
          </div>

          <form
            onSubmit={handleIssueInvite}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          >
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Invitee Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@opusclip.local"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "creator" | "viewer" | "admin")
                }
                aria-label="Assigned Role"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white"
              >
                <option value="creator">Creator (Clip & Edit)</option>
                <option value="viewer">Viewer (Read-Only)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="w-24">
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  TTL (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs h-[38px] self-end transition"
              >
                {submitting ? "Issuing..." : "Generate Invite"}
              </button>
            </div>
          </form>

          {createdAcceptUrl && (
            <div
              data-testid="generated-invite-banner"
              className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 space-y-2"
            >
              <div className="text-xs font-bold text-emerald-300">
                One-time invitation token generated (copy now — only the SHA-256 hash is stored in DB):
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  data-testid="generated-invite-url"
                  value={createdAcceptUrl}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-emerald-700 text-xs font-mono text-white"
                />
                <span
                  data-testid="generated-invite-token"
                  className="hidden"
                >
                  {createdToken}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(createdAcceptUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Invitations Table */}
        <div className="rounded-2xl bg-[#121216] border border-zinc-800/90 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              Workspace Invitations ({invitations.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      Loading invitations...
                    </td>
                  </tr>
                ) : invitations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      No invitations found.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-900/40">
                      <td className="px-6 py-3.5 font-medium text-white">
                        {inv.email}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold text-[10px]">
                          {inv.role}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`uppercase px-2 py-0.5 rounded font-bold text-[10px] ${
                            inv.status === "PENDING"
                              ? "bg-amber-500/20 text-amber-300"
                              : inv.status === "ACCEPTED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-zinc-400">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {inv.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(inv.id)}
                            className="px-2.5 py-1 rounded-lg bg-red-950/70 hover:bg-red-900/80 border border-red-800 text-red-200 font-semibold inline-flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workspace Members & RBAC Table */}
        <div className="rounded-2xl bg-[#121216] border border-zinc-800/90 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-white">
              Active Workspace Members & Role Assignment ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Credits</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/40">
                    <td className="px-6 py-3.5 font-semibold text-white">
                      {u.name}
                    </td>
                    <td className="px-6 py-3.5 text-zinc-300">{u.email}</td>
                    <td className="px-6 py-3.5">
                      <select
                        value={u.role}
                        aria-label={`Role for ${u.email}`}
                        onChange={(e) =>
                          handleUpdateUser(u.id, { role: e.target.value })
                        }
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                      >
                        <option value="admin">admin</option>
                        <option value="creator">creator</option>
                        <option value="viewer">viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-amber-300">
                      {u.creditsBalance}
                    </td>
                    <td className="px-6 py-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateUser(u.id, {
                            status: u.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
                          })
                        }
                        className={`px-2.5 py-0.5 rounded font-bold text-[10px] uppercase ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {u.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
