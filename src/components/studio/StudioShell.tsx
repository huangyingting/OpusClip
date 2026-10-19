"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  FolderKanban,
  Palette,
  Library,
  Calendar,
  BarChart3,
  Share2,
  Search,
  ShieldCheck,
  ScrollText,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  UserPlus,
  LogOut,
  Plus,
  Copy,
  Check,
  X,
  Menu,
} from "lucide-react";

interface StudioShellProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function StudioShell({ children, breadcrumbs }: StudioShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);

  // Invite modal state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"creator" | "viewer" | "admin">("creator");
  const [inviteDays, setInviteDays] = useState(7);
  const [inviteResultUrl, setInviteResultUrl] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Credits top-up state
  const [addingCredits, setAddingCredits] = useState(false);
  const [localCredits, setLocalCredits] = useState<number | null>(null);

  const user = session?.user as
    | {
        id?: string;
        name?: string;
        email?: string;
        role?: string;
        creditsBalance?: number;
        planName?: string;
        workspaceName?: string;
      }
    | undefined;

  const role = user?.role || "creator";
  const credits = localCredits ?? user?.creditsBalance ?? 3559;
  const workspaceName = user?.workspaceName || "Alex Studio Workspace";

  const createNav = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "My projects", href: "/projects", icon: FolderKanban },
    { label: "Brand template", href: "/brand-templates-ux", icon: Palette },
    { label: "Asset library", href: "/collections", icon: Library },
    { label: "AI Search", href: "/search", icon: Search },
  ];

  const postNav = [
    { label: "Calendar", href: "/auto-post/calendar", icon: Calendar },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Social accounts", href: "/post/plansocial", icon: Share2 },
  ];

  const adminNav = [
    { label: "Subscription", href: "/subscription", icon: CreditCard },
    ...(role === "admin"
      ? [
          { label: "Invitations & RBAC", href: "/admin/invitations", icon: ShieldCheck },
          { label: "Audit logs", href: "/admin/audit-logs", icon: ScrollText },
        ]
      : []),
  ];

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteResultUrl(null);
    setInviteSubmitting(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          expiresInDays: inviteDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "Failed to create invitation.");
      } else {
        setInviteResultUrl(data.acceptUrl || data.acceptPath);
        setInviteEmail("");
      }
    } catch {
      setInviteError("Network error while creating invitation.");
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleAddCredits = async (amount: number) => {
    setAddingCredits(true);
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setLocalCredits(data.user.creditsBalance);
        await updateSession();
        setCreditsModalOpen(false);
      }
    } finally {
      setAddingCredits(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#121216] border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile navigation"
            className="p-1.5 rounded-lg bg-zinc-800/80 text-zinc-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="font-black tracking-tight text-lg flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-black text-xs">
              O
            </span>
            <span>OpusClip</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              Pro
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCreditsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 text-xs font-semibold text-amber-300"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{credits}</span>
          </button>
        </div>
      </header>

      {/* Collapsible Left Sidebar Drawer */}
      <aside
        className={`${
          mobileMenuOpen ? "fixed inset-0 z-50 flex" : "hidden md:flex"
        } flex-col justify-between bg-[#101014] border-r border-zinc-800/80 transition-all duration-200 shrink-0 ${
          drawerExpanded ? "w-60" : "w-16"
        }`}
      >
        <div className="flex flex-col gap-3 p-3">
          {/* Top Brand + Collapse Button */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-black text-base tracking-tight text-white"
            >
              <span className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm shrink-0">
                O
              </span>
              {drawerExpanded && (
                <>
                  <span>OpusClip</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                    Pro
                  </span>
                </>
              )}
            </Link>
            <button
              type="button"
              aria-label="Click to expand drawer"
              onClick={() => {
                setDrawerExpanded(!drawerExpanded);
                setMobileMenuOpen(false);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition"
            >
              {drawerExpanded ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Workspace Box & Invite Members */}
          {drawerExpanded && (
            <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/90 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <div className="text-xs font-semibold text-zinc-200 truncate">
                    {workspaceName}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-semibold">
                      {role}
                    </span>
                    <span className="truncate">{user?.email || "admin@opusclip.local"}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Invite members"
                onClick={() => {
                  if (role === "admin") {
                    setInviteModalOpen(true);
                  } else {
                    router.push("/admin/invitations");
                  }
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center justify-center gap-1.5 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite members</span>
              </button>
            </div>
          )}

          {/* Create Section */}
          <div className="flex flex-col gap-1 mt-1">
            {drawerExpanded && (
              <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Create
              </div>
            )}
            {createNav.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href === "/projects" && pathname.startsWith("/clip/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-zinc-800/90 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {drawerExpanded && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Post Section */}
          <div className="flex flex-col gap-1 mt-2">
            {drawerExpanded && (
              <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Post
              </div>
            )}
            {postNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-zinc-800/90 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {drawerExpanded && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Admin & Security Section */}
          <div className="flex flex-col gap-1 mt-2">
            {drawerExpanded && (
              <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Workspace & Security
              </div>
            )}
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-zinc-800/90 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {drawerExpanded && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800/80 flex flex-col gap-2">
          {drawerExpanded && (
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <Link href="/" className="hover:text-zinc-200">
                Opus.pro Home
              </Link>
              <span>•</span>
              <Link href="/tools/youtube-title-generator" className="hover:text-zinc-200">
                Free AI Tools
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-300 hover:bg-red-950/30 transition w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {drawerExpanded && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Studio Bar */}
        <div className="h-14 px-6 border-b border-zinc-800/80 bg-[#09090B]/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400 truncate">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              breadcrumbs.map((bc, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-zinc-600">/</span>}
                  {bc.href ? (
                    <Link href={bc.href} className="hover:text-white transition truncate">
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="text-zinc-100 font-medium truncate max-w-[420px]">
                      {bc.label}
                    </span>
                  )}
                </React.Fragment>
              ))
            ) : (
              <span className="text-zinc-200 font-medium">{workspaceName}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span data-testid="credits-balance">{credits}</span>
            </div>
            <button
              type="button"
              onClick={() => setCreditsModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-black font-semibold text-xs transition"
            >
              Add credits
            </button>
            <div
              title={user?.email || "admin@opusclip.local"}
              className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center uppercase"
            >
              {(user?.name || "A").slice(0, 1)}
            </div>
          </div>
        </div>

        {/* Page Body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>

      {/* Invite Members Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#141419] border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Invite Member to {workspaceName}
                </h3>
                <p className="text-xs text-zinc-400">
                  Generates a single-use, expiring cryptographic invitation code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@studio.com"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Workspace Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as "creator" | "viewer" | "admin")
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white"
                  >
                    <option value="creator">Creator (Edit & Clip)</option>
                    <option value="viewer">Viewer (Read-Only)</option>
                    <option value="admin">Admin (Full Control)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Expires In (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={inviteDays}
                    onChange={(e) => setInviteDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white"
                  />
                </div>
              </div>

              {inviteError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200">
                  {inviteError}
                </div>
              )}

              {inviteResultUrl && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 space-y-2">
                  <div className="text-xs font-semibold text-emerald-300">
                    Single-use invitation link created!
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteResultUrl}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-emerald-800/80 text-xs font-mono text-zinc-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(inviteResultUrl);
                        setCopiedInvite(true);
                        setTimeout(() => setCopiedInvite(false), 2000);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedInvite ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/admin/invitations"
                  onClick={() => setInviteModalOpen(false)}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  Manage all invitations →
                </Link>
                <button
                  type="submit"
                  disabled={inviteSubmitting}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{inviteSubmitting ? "Generating..." : "Create Invite Code"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Credits Modal */}
      {creditsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#141419] border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Add Processing Credits</h3>
                <p className="text-xs text-zinc-400">
                  1 credit = 1 minute of AI video clipping, captioning & reframing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreditsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { amount: 100, price: "$10", label: "Starter Pack" },
                { amount: 300, price: "$25", label: "Creator Pack" },
                { amount: 1000, price: "$65", label: "Studio Pack" },
              ].map((pack) => (
                <button
                  key={pack.amount}
                  type="button"
                  disabled={addingCredits}
                  onClick={() => handleAddCredits(pack.amount)}
                  className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-400/60 flex flex-col items-center gap-1 transition"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-white">+{pack.amount}</span>
                  <span className="text-[11px] text-zinc-400">{pack.label}</span>
                  <span className="text-xs font-semibold text-amber-300 mt-1">
                    {pack.price}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <Link
                href="/subscription"
                onClick={() => setCreditsModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                View full Pro & Business subscription plans →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
