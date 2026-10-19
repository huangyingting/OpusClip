export type AccountAdmissionMode = "invitation-only" | "open";
export type WorkspaceRole = "admin" | "creator" | "viewer";

export const VALID_ROLES: readonly WorkspaceRole[] = ["admin", "creator", "viewer"] as const;

export function getAccountAdmissionMode(): AccountAdmissionMode {
  const raw = process.env.ACCOUNT_ADMISSION_MODE?.trim().toLowerCase();
  if (raw === "open") {
    return "open";
  }
  // Fail-closed to invitation-only for any other value or when unset
  return "invitation-only";
}

export function normalizeAccountEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidAccountEmail(email: string): boolean {
  const normalized = normalizeAccountEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && normalized.length <= 254;
}

export function normalizeRole(role?: string | null): WorkspaceRole {
  const r = role?.trim().toLowerCase();
  if (r === "admin" || r === "creator" || r === "viewer") {
    return r;
  }
  return "creator";
}
