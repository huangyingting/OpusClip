import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/account-admission";

function probeVideoDurationSec(filePath: string): number {
  try {
    const out = execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filePath,
      ],
      { encoding: "utf8", timeout: 5000 }
    );
    const parsed = parseFloat(out.trim());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30.0;
  } catch {
    return 30.0;
  }
}

export async function POST(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers do not have permission to upload media files." },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = String(formData.get("category") || "video");
    const saveToAssetLibrary = formData.get("saveToAssetLibrary") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "parameters required. signedUrl is not found" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public/uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".mp4";
    const safeBase = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 48);
    const uniqueName = `${safeBase || "upload"}_${randomBytes(4).toString("hex")}${ext}`;
    const destPath = path.join(uploadsDir, uniqueName);

    const bytes = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destPath, bytes);

    const durationSec = probeVideoDurationSec(destPath);
    const fileUrl = `/uploads/${uniqueName}`;

    let asset = null;
    if (saveToAssetLibrary) {
      asset = await prisma.mediaAsset.create({
        data: {
          name: file.name,
          category,
          fileUrl,
          mimeType: file.type || "video/mp4",
          durationSec,
          sizeBytes: bytes.length,
          tags: category,
          ownerId: actor.id,
        },
      });
    }

    await writeAuditLog({
      action: "MEDIA_FILE_UPLOADED",
      actorId: actor.id,
      actorEmail: actor.email,
      targetType: "MediaUpload",
      targetId: uniqueName,
      metadata: {
        originalName: file.name,
        sizeBytes: bytes.length,
        durationSec,
        fileUrl,
      },
    });

    return NextResponse.json(
      {
        fileUrl,
        fileName: file.name,
        durationSec,
        durationMs: Math.round(durationSec * 1000),
        sizeBytes: bytes.length,
        asset,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Video upload failed." },
      { status: 500 }
    );
  }
}
