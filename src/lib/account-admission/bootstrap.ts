import { prisma } from "@/lib/prisma";
import { AccountAdmissionError } from "./errors";
import { hashPassword } from "./passwords";
import { isValidAccountEmail, normalizeAccountEmail } from "./policy";
import { writeAuditLog } from "./audit";

/**
 * CLI-ONLY Bootstrap Admin Provisioning (`npm run bootstrap:admin`).
 *
 * SECURITY INVARIANT:
 * This function must NEVER be exposed via an HTTP API endpoint or public route.
 * Only an operator with CLI/deployment shell access may provision the root admin.
 */
export async function bootstrapAdminAccount(input: {
  email: string;
  password: string;
  name?: string | null;
}) {
  if (!isValidAccountEmail(input.email)) {
    throw new AccountAdmissionError(
      400,
      "INVALID_EMAIL",
      "Provide a valid administrator email address."
    );
  }

  const normalizedEmail = normalizeAccountEmail(input.email);
  const passwordHash = await hashPassword(input.password);
  const displayName = (input.name?.trim() || "Alex Rivera (Admin)").slice(0, 100);
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { normalizedEmail },
    });

    const user = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: {
            email: input.email.trim(),
            name: displayName,
            role: "admin",
            status: "ACTIVE",
          },
        })
      : await tx.user.create({
          data: {
            email: input.email.trim(),
            normalizedEmail,
            name: displayName,
            role: "admin",
            status: "ACTIVE",
            creditsBalance: 3600,
            creditsTotal: 3600,
            planName: "Pro",
            billingCycle: "yearly",
            workspaceName: "Alex Studio Workspace",
          },
        });

    await tx.passwordCredential.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        passwordHash,
      },
      update: {
        passwordHash,
      },
    });

    // Revoke any pending invitations for this email so no stale token remains
    await tx.accountInvitation.updateMany({
      where: {
        normalizedEmail,
        status: "PENDING",
      },
      data: {
        status: "REVOKED",
        revokedAt: now,
        activeForEmail: null,
        tokenHash: null,
      },
    });

    return { user, created: !existing };
  });

  await writeAuditLog({
    action: result.created ? "BOOTSTRAP_ADMIN_CREATED" : "BOOTSTRAP_ADMIN_UPDATED",
    actorId: result.user.id,
    actorEmail: result.user.email,
    targetType: "User",
    targetId: result.user.id,
    metadata: {
      source: "cli:bootstrap-admin",
      role: "admin",
    },
  });

  return result;
}
