import { prisma } from "@/lib/prisma";
import { AccountAdmissionError } from "./errors";
import { hashPassword } from "./passwords";
import {
  getAccountAdmissionMode,
  isValidAccountEmail,
  normalizeAccountEmail,
  normalizeRole,
} from "./policy";
import { hashOpaqueToken } from "./tokens";
import { writeAuditLog } from "./audit";

export interface AcceptInvitationInput {
  token: string;
  name: string;
  password: string;
  email?: string;
}

export async function acceptAccountInvitation(input: AcceptInvitationInput) {
  if (!input.token || typeof input.token !== "string") {
    throw new AccountAdmissionError(400, "INVALID_TOKEN", "Invitation token is required.");
  }

  const displayName = input.name?.trim();
  if (!displayName || displayName.length < 2) {
    throw new AccountAdmissionError(400, "INVALID_NAME", "Please enter your full name.");
  }

  const passwordHash = await hashPassword(input.password);
  const tokenHash = hashOpaqueToken(input.token);
  const now = new Date();

  const invitation = await prisma.accountInvitation.findUnique({
    where: { tokenHash },
  });

  if (!invitation || invitation.status !== "PENDING") {
    await writeAuditLog({
      action: "INVITATION_ACCEPT_FAILED",
      targetType: "AccountInvitation",
      targetId: invitation?.id ?? null,
      metadata: { reason: "INVALID_OR_CONSUMED_TOKEN" },
    });
    throw new AccountAdmissionError(
      410,
      "INVITATION_INVALID_OR_CONSUMED",
      "This invitation code is invalid, revoked, or has already been used."
    );
  }

  if (invitation.expiresAt.getTime() <= now.getTime()) {
    await prisma.accountInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "EXPIRED",
        activeForEmail: null,
        tokenHash: null,
      },
    });
    await writeAuditLog({
      action: "INVITATION_ACCEPT_FAILED",
      targetType: "AccountInvitation",
      targetId: invitation.id,
      metadata: { reason: "EXPIRED", email: invitation.normalizedEmail },
    });
    throw new AccountAdmissionError(
      410,
      "INVITATION_EXPIRED",
      "This invitation code has expired. Request a new invitation from your workspace administrator."
    );
  }

  if (input.email && normalizeAccountEmail(input.email) !== invitation.normalizedEmail) {
    throw new AccountAdmissionError(
      403,
      "EMAIL_MISMATCH",
      "The email address does not match this invitation."
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { normalizedEmail: invitation.normalizedEmail },
  });
  if (existingUser) {
    throw new AccountAdmissionError(
      409,
      "USER_ALREADY_EXISTS",
      "An account already exists for this email address."
    );
  }

  const assignedRole = normalizeRole(invitation.role);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: invitation.email,
        normalizedEmail: invitation.normalizedEmail,
        name: displayName.slice(0, 100),
        role: assignedRole,
        status: "ACTIVE",
        creditsBalance: assignedRole === "viewer" ? 50 : 360,
        creditsTotal: assignedRole === "viewer" ? 50 : 360,
        planName: "Pro",
        billingCycle: "yearly",
        workspaceName: "Alex Studio Workspace",
        passwordCredential: {
          create: {
            passwordHash,
          },
        },
      },
    });

    await tx.accountInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: now,
        acceptedByUserId: createdUser.id,
        activeForEmail: null,
        tokenHash: null,
      },
    });

    return createdUser;
  });

  await writeAuditLog({
    action: "INVITATION_ACCEPTED",
    actorId: user.id,
    actorEmail: user.email,
    targetType: "AccountInvitation",
    targetId: invitation.id,
    metadata: {
      role: user.role,
      invitedByUserId: invitation.invitedByUserId,
    },
  });

  return { user, invitationId: invitation.id };
}

export async function registerDirectAccount(input: {
  email: string;
  name: string;
  password: string;
}) {
  const mode = getAccountAdmissionMode();
  if (mode !== "open") {
    await writeAuditLog({
      action: "DIRECT_REGISTRATION_BLOCKED",
      actorEmail: input.email || "unknown",
      targetType: "User",
      metadata: { admissionMode: mode },
    });
    throw new AccountAdmissionError(
      403,
      "REGISTRATION_DISABLED",
      "Self-service registration is disabled. An administrator invitation is required to join this workspace."
    );
  }

  if (!isValidAccountEmail(input.email)) {
    throw new AccountAdmissionError(400, "INVALID_EMAIL", "Enter a valid email address.");
  }

  const normalizedEmail = normalizeAccountEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { normalizedEmail } });
  if (existing) {
    throw new AccountAdmissionError(
      409,
      "USER_ALREADY_EXISTS",
      "An account with this email already exists."
    );
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email.trim(),
      normalizedEmail,
      name: (input.name?.trim() || "Opus Creator").slice(0, 100),
      role: "creator",
      status: "ACTIVE",
      passwordCredential: {
        create: { passwordHash },
      },
    },
  });

  await writeAuditLog({
    action: "USER_REGISTERED_OPEN_MODE",
    actorId: user.id,
    actorEmail: user.email,
    targetType: "User",
    targetId: user.id,
  });

  return user;
}
