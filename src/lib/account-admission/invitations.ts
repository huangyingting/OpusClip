import { Prisma, type AccountInvitation } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AccountAdmissionError } from "./errors";
import {
  isValidAccountEmail,
  normalizeAccountEmail,
  normalizeRole,
  type WorkspaceRole,
} from "./policy";
import { createOpaqueToken, hashOpaqueToken } from "./tokens";
import { writeAuditLog } from "./audit";

const DEFAULT_INVITATION_TTL_DAYS = 7;

export interface CreateInvitationInput {
  email: string;
  role?: string;
  expiresInDays?: number;
  expiresAt?: Date;
  invitedByUserId: string;
  invitedByEmail?: string;
}

export interface InvitationGrantResult {
  invitation: AccountInvitation;
  token: string;
  acceptPath: string;
}

export interface PublicInvitationInspection {
  id: string;
  status: "pending" | "accepted" | "revoked" | "expired" | "invalid";
  email: string | null;
  maskedEmail: string | null;
  role: WorkspaceRole;
  expiresAt: Date | null;
  workspaceName: string;
}

export function maskEmailAddress(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) return "***";
  const prefix = local.slice(0, Math.min(2, local.length));
  return `${prefix}${"*".repeat(Math.max(2, local.length - prefix.length))}@${domain}`;
}

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export async function expirePendingInvitations(now = new Date()): Promise<number> {
  const res = await prisma.accountInvitation.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lte: now },
    },
    data: {
      status: "EXPIRED",
      activeForEmail: null,
      tokenHash: null,
    },
  });
  return res.count;
}

export async function createAccountInvitation(
  input: CreateInvitationInput
): Promise<InvitationGrantResult> {
  if (!isValidAccountEmail(input.email)) {
    throw new AccountAdmissionError(400, "INVALID_EMAIL", "Enter a valid email address.");
  }

  const normalizedEmail = normalizeAccountEmail(input.email);
  const role = normalizeRole(input.role);
  const now = new Date();

  let expiresAt: Date;
  if (input.expiresAt) {
    expiresAt = input.expiresAt;
  } else {
    const ttlDays = Math.min(30, Math.max(1, Number(input.expiresInDays ?? DEFAULT_INVITATION_TTL_DAYS)));
    expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
  }

  if (expiresAt.getTime() <= now.getTime()) {
    throw new AccountAdmissionError(
      400,
      "INVALID_EXPIRY",
      "Invitation expiration must be in the future."
    );
  }

  await expirePendingInvitations(now);

  const existingUser = await prisma.user.findUnique({
    where: { normalizedEmail },
    select: { id: true },
  });
  if (existingUser) {
    throw new AccountAdmissionError(
      409,
      "USER_ALREADY_EXISTS",
      "An account already exists for this email address."
    );
  }

  const existingPending = await prisma.accountInvitation.findUnique({
    where: { activeForEmail: normalizedEmail },
    select: { id: true },
  });
  if (existingPending) {
    throw new AccountAdmissionError(
      409,
      "ACTIVE_INVITATION_EXISTS",
      "A pending invitation already exists for this email. Revoke it first to issue a new one."
    );
  }

  const token = createOpaqueToken();
  const tokenHash = hashOpaqueToken(token);
  const acceptPath = `/invite/${token}`;

  try {
    const invitation = await prisma.$transaction(async (tx) => {
      const inv = await tx.accountInvitation.create({
        data: {
          email: input.email.trim(),
          normalizedEmail,
          activeForEmail: normalizedEmail,
          role,
          status: "PENDING",
          tokenHash,
          expiresAt,
          invitedByUserId: input.invitedByUserId,
        },
      });

      await tx.accountEmailOutbox.create({
        data: {
          invitationId: inv.id,
          recipientEmail: inv.email,
          subject: `You're invited to join OpusClip Studio (${role.toUpperCase()})`,
          bodyText: `Accept your single-use invitation at ${acceptPath} before ${expiresAt.toISOString()}`,
          deliveryState: "QUEUED",
        },
      });

      return inv;
    });

    await writeAuditLog({
      action: "INVITATION_CREATED",
      actorId: input.invitedByUserId,
      actorEmail: input.invitedByEmail ?? null,
      targetType: "AccountInvitation",
      targetId: invitation.id,
      metadata: {
        invitedEmail: normalizedEmail,
        role,
        expiresAt: expiresAt.toISOString(),
      },
    });

    return {
      invitation,
      token,
      acceptPath,
    };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AccountAdmissionError(
        409,
        "ACTIVE_INVITATION_EXISTS",
        "A pending invitation already exists for this email."
      );
    }
    throw err;
  }
}

export async function inspectAccountInvitation(
  rawToken: string,
  now = new Date()
): Promise<PublicInvitationInspection> {
  if (!rawToken || typeof rawToken !== "string") {
    return {
      id: "",
      status: "invalid",
      email: null,
      maskedEmail: null,
      role: "creator",
      expiresAt: null,
      workspaceName: "Alex Studio Workspace",
    };
  }

  const tokenHash = hashOpaqueToken(rawToken);
  const invitation = await prisma.accountInvitation.findUnique({
    where: { tokenHash },
    include: {
      invitedByUser: {
        select: { workspaceName: true },
      },
    },
  });

  if (!invitation) {
    return {
      id: "",
      status: "invalid",
      email: null,
      maskedEmail: null,
      role: "creator",
      expiresAt: null,
      workspaceName: "Alex Studio Workspace",
    };
  }

  if (invitation.status === "PENDING" && invitation.expiresAt.getTime() <= now.getTime()) {
    await prisma.accountInvitation.updateMany({
      where: { id: invitation.id, status: "PENDING" },
      data: {
        status: "EXPIRED",
        activeForEmail: null,
        tokenHash: null,
      },
    });

    await writeAuditLog({
      action: "INVITATION_EXPIRED_ON_INSPECT",
      targetType: "AccountInvitation",
      targetId: invitation.id,
      metadata: { email: invitation.normalizedEmail },
    });

    return {
      id: invitation.id,
      status: "expired",
      email: invitation.email,
      maskedEmail: maskEmailAddress(invitation.email),
      role: normalizeRole(invitation.role),
      expiresAt: invitation.expiresAt,
      workspaceName: invitation.invitedByUser?.workspaceName ?? "Alex Studio Workspace",
    };
  }

  return {
    id: invitation.id,
    status: invitation.status.toLowerCase() as PublicInvitationInspection["status"],
    email: invitation.email,
    maskedEmail: maskEmailAddress(invitation.email),
    role: normalizeRole(invitation.role),
    expiresAt: invitation.expiresAt,
    workspaceName: invitation.invitedByUser?.workspaceName ?? "Alex Studio Workspace",
  };
}

export async function revokeAccountInvitation(
  invitationId: string,
  actor?: { id?: string; email?: string }
): Promise<AccountInvitation> {
  const now = new Date();
  const existing = await prisma.accountInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!existing) {
    throw new AccountAdmissionError(404, "NOT_FOUND", "Invitation not found.");
  }

  if (existing.status === "REVOKED") {
    return existing;
  }

  if (existing.status !== "PENDING") {
    throw new AccountAdmissionError(
      409,
      "INVALID_STATE_TRANSITION",
      `Cannot revoke an invitation with status ${existing.status}.`
    );
  }

  const updated = await prisma.accountInvitation.update({
    where: { id: invitationId },
    data: {
      status: "REVOKED",
      revokedAt: now,
      activeForEmail: null,
      tokenHash: null,
    },
  });

  await prisma.accountEmailOutbox.updateMany({
    where: { invitationId, deliveryState: "QUEUED" },
    data: { deliveryState: "SUPPRESSED" },
  });

  await writeAuditLog({
    action: "INVITATION_REVOKED",
    actorId: actor?.id ?? null,
    actorEmail: actor?.email ?? null,
    targetType: "AccountInvitation",
    targetId: invitationId,
    metadata: {
      invitedEmail: existing.normalizedEmail,
      role: existing.role,
    },
  });

  return updated;
}

export async function listAccountInvitations() {
  await expirePendingInvitations();
  return prisma.accountInvitation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      invitedByUser: {
        select: { id: true, name: true, email: true },
      },
      acceptedByUser: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
