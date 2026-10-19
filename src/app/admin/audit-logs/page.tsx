"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { StudioShell } from "@/components/studio/StudioShell";
import { ScrollText, ShieldCheck, RefreshCw } from "lucide-react";

interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string | null;
  actorEmail: string | null;
  targetType: string;
  targetId: string | null;
  metadataJson: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async (filter = actionFilter) => {
    setLoading(true);
    setError(null);
    try {
      const qs = filter ? `?action=${encodeURIComponent(filter)}` : "";
      const res = await fetch(`/api/admin/audit-logs${qs}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Administrator access required.");
      } else {
        setLogs(data.logs || []);
      }
    } catch {
      setError("Failed to load security audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs("");
  }, []);

  return (
    <StudioShell
      breadcrumbs={[
        { label: "Workspace Security", href: "/admin/invitations" },
        { label: "Security Audit Logs" },
      ]}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ScrollText className="w-6 h-6 text-violet-400" />
              <span>Security & Operational Audit Logs</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Immutable ledger of invitation grants, revocations, admissions, role updates, and workspace actions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                loadLogs(e.target.value);
              }}
              aria-label="Filter by audit action"
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
            >
              <option value="">All Actions</option>
              <option value="BOOTSTRAP_ADMIN_CREATED">BOOTSTRAP_ADMIN_CREATED</option>
              <option value="INVITATION_CREATED">INVITATION_CREATED</option>
              <option value="INVITATION_ACCEPTED">INVITATION_ACCEPTED</option>
              <option value="INVITATION_REVOKED">INVITATION_REVOKED</option>
              <option value="DIRECT_REGISTRATION_BLOCKED">DIRECT_REGISTRATION_BLOCKED</option>
              <option value="AUTH_LOGIN_SUCCESS">AUTH_LOGIN_SUCCESS</option>
              <option value="AUTH_LOGIN_FAILED">AUTH_LOGIN_FAILED</option>
              <option value="USER_ADMIN_UPDATED">USER_ADMIN_UPDATED</option>
              <option value="CLIP_PROJECT_CREATED">CLIP_PROJECT_CREATED</option>
              <option value="MEDIA_FILE_UPLOADED">MEDIA_FILE_UPLOADED</option>
            </select>
            <Link
              href="/admin/invitations"
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#04F827]" />
              <span>Invitations & RBAC</span>
            </Link>
            <button
              type="button"
              onClick={() => loadLogs(actionFilter)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
              aria-label="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-[#121216] border border-zinc-800/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Target</th>
                  <th className="px-5 py-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                      Loading audit trail...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                      No matching audit log events.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-900/40">
                      <td className="px-5 py-3 font-mono text-zinc-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 font-mono font-semibold text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-300">
                        {log.actorEmail || "system / anonymous"}
                      </td>
                      <td className="px-5 py-3 text-zinc-400">
                        {log.targetType}
                        {log.targetId ? ` (${log.targetId.slice(0, 10)})` : ""}
                      </td>
                      <td className="px-5 py-3 font-mono text-[11px] text-zinc-400 max-w-md truncate">
                        {log.metadataJson}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
