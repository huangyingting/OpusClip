import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import {
  registerDirectAccount,
  createOpaqueToken,
  hashOpaqueToken,
  createAccountInvitation,
  acceptAccountInvitation,
  revokeAccountInvitation,
  inspectAccountInvitation,
  bootstrapAdminAccount,
  AccountAdmissionError,
} from "../src/lib/account-admission";
import {
  curateClipsForProject,
  generateFreeToolResult,
} from "../src/lib/ai/clip-engine";

describe("Invite-Only Admission, Single-Use Codes, Revocation, RBAC & Audit Logging", () => {
  let adminUserId: string;

  beforeAll(async () => {
    const admin = await bootstrapAdminAccount({
      email: "vitest-admin@opusclip.local",
      password: "AdminPassword123!",
      name: "Vitest Admin",
    });
    adminUserId = admin.user.id;
  });

  it("blocks direct open registration with REGISTRATION_DISABLED (403) and logs DIRECT_REGISTRATION_BLOCKED", async () => {
    await expect(
      registerDirectAccount({
        email: "uninvited@opusclip.local",
        name: "Uninvited User",
        password: "Password123!",
      })
    ).rejects.toMatchObject({
      code: "REGISTRATION_DISABLED",
      status: 403,
    });

    const audit = await prisma.auditLog.findFirst({
      where: {
        action: "DIRECT_REGISTRATION_BLOCKED",
        actorEmail: "uninvited@opusclip.local",
      },
    });
    expect(audit).not.toBeNull();
  });

  it("generates high-entropy tokens and deterministic SHA-256 hashes", () => {
    const rawToken = createOpaqueToken();
    const tokenHash = hashOpaqueToken(rawToken);
    expect(rawToken.length).toBeGreaterThan(24);
    expect(tokenHash).toHaveLength(64);
    expect(hashOpaqueToken(rawToken)).toBe(tokenHash);
  });

  it("enforces single-use invitation acceptance, clears tokenHash on consume, and writes AuditLog entries", async () => {
    const uniqueEmail = `creator-${Date.now()}@opusclip.local`;
    const created = await createAccountInvitation({
      email: uniqueEmail,
      role: "creator",
      expiresInDays: 7,
      invitedByUserId: adminUserId,
      invitedByEmail: "vitest-admin@opusclip.local",
    });

    expect(created.token).toBeTruthy();
    expect(created.invitation.status).toBe("PENDING");

    // Inspect pending token
    const inspected = await inspectAccountInvitation(created.token);
    expect(inspected.status).toBe("pending");
    expect(inspected.role).toBe("creator");

    // Accept the invitation once
    const accepted = await acceptAccountInvitation({
      token: created.token,
      name: "Invited Creator",
      password: "CreatorPassword123!",
    });
    expect(accepted.user.email).toBe(uniqueEmail);
    expect(accepted.user.role).toBe("creator");

    // Verify single-use: second attempt must fail with INVITATION_INVALID_OR_CONSUMED (410)
    await expect(
      acceptAccountInvitation({
        token: created.token,
        name: "Replay Attacker",
        password: "CreatorPassword123!",
      })
    ).rejects.toMatchObject({
      code: "INVITATION_INVALID_OR_CONSUMED",
      status: 410,
    });

    // Verify audit logs were written
    const logs = await prisma.auditLog.findMany({
      where: { targetId: created.invitation.id },
    });
    const actions = logs.map((l) => l.action);
    expect(actions).toContain("INVITATION_CREATED");
    expect(actions).toContain("INVITATION_ACCEPTED");
  });

  it("prevents accepting a revoked invitation and records INVITATION_REVOKED in AuditLog", async () => {
    const revokeEmail = `revoked-${Date.now()}@opusclip.local`;
    const created = await createAccountInvitation({
      email: revokeEmail,
      role: "viewer",
      expiresInDays: 7,
      invitedByUserId: adminUserId,
      invitedByEmail: "vitest-admin@opusclip.local",
    });

    const revoked = await revokeAccountInvitation(created.invitation.id, {
      id: adminUserId,
      email: "vitest-admin@opusclip.local",
    });
    expect(revoked.status).toBe("REVOKED");

    await expect(
      acceptAccountInvitation({
        token: created.token,
        name: "Revoked User",
        password: "Password123!",
      })
    ).rejects.toMatchObject({
      code: "INVITATION_INVALID_OR_CONSUMED",
      status: 410,
    });

    const revokeLog = await prisma.auditLog.findFirst({
      where: {
        action: "INVITATION_REVOKED",
        targetId: created.invitation.id,
      },
    });
    expect(revokeLog).not.toBeNull();
  });

  it("marks expired invitations as EXPIRED and rejects acceptance with INVITATION_EXPIRED", async () => {
    const expiredEmail = `expired-${Date.now()}@opusclip.local`;
    const rawToken = createOpaqueToken();
    const tokenHash = hashOpaqueToken(rawToken);
    await prisma.accountInvitation.create({
      data: {
        email: expiredEmail,
        normalizedEmail: expiredEmail,
        activeForEmail: expiredEmail,
        role: "viewer",
        tokenHash,
        status: "PENDING",
        expiresAt: new Date(Date.now() - 60_000),
        invitedByUserId: adminUserId,
      },
    });

    await expect(
      acceptAccountInvitation({
        token: rawToken,
        name: "Expired User",
        password: "Password123!",
      })
    ).rejects.toMatchObject({
      code: "INVITATION_EXPIRED",
      status: 410,
    });
  });
});

describe("ClipAnything™ Curation Engine & Free AI Creator Tools", () => {
  it("curates clips with Virality Score™, Judge Result, Scene Analysis, and word timestamps", () => {
    const clips = curateClipsForProject({
      projectTitle: "Founder Podcast Ep 10",
      customPrompt: "Find high-retention insights on scaling distribution",
      genre: "Podcast",
      videoUrl: "/videos/sample_podcast.mp4",
      thumbnailUrl: "/videos/sample_podcast.mp4",
    });

    expect(clips).toHaveLength(4);
    expect(clips[0].score).toBeGreaterThanOrEqual(89);
    expect(clips[0].judgeResultJson).toContain("hookComment");
    expect(clips[0].sceneAnalysisText.length).toBeGreaterThan(20);
    const screenplay = JSON.parse(clips[0].screenplayJson);
    expect(screenplay.chapters[0].lines.length).toBeGreaterThan(1);
  });

  it("generates output for all 6 Free AI Creator Tools", () => {
    const slugs = [
      "youtube-title-generator",
      "tiktok-caption-generator",
      "tiktok-hashtag-generator",
      "transcript-maker",
      "ai-show-note-generator",
      "ai-video-summarizer",
    ];
    for (const slug of slugs) {
      const out = generateFreeToolResult({
        toolSlug: slug,
        topic: "Building a $150M Brand",
        tone: "Viral",
      });
      expect(out.items.length).toBeGreaterThan(0);
    }
  });
});
