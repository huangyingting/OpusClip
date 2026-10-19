import { prisma } from "@/lib/prisma";

export interface WriteAuditLogInput {
  action: string;
  actorId?: string | null;
  actorEmail?: string | null;
  targetType: string;
  targetId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(input: WriteAuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        action: input.action,
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        metadataJson: JSON.stringify(input.metadata ?? {}),
      },
    });
  } catch (err) {
    console.error("Failed to write AuditLog:", err);
    return null;
  }
}
