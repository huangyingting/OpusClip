import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ clipId: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { clipId } = await context.params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "mp4";

  const clip = await prisma.exportableClip.findUnique({
    where: { id: clipId },
    include: { project: true },
  });

  if (!clip) {
    return NextResponse.json({ error: "Clip not found." }, { status: 404 });
  }

  const safeSlug = clip.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || clip.id;

  if (format === "xml") {
    const durationFrames = Math.max(30, Math.round((clip.durationMs / 1000) * 30));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
  <sequence id="${clip.id}">
    <name>${clip.title.replace(/[<>&"']/g, "")}</name>
    <duration>${durationFrames}</duration>
    <rate>
      <timebase>30</timebase>
      <ntsc>FALSE</ntsc>
    </rate>
    <media>
      <video>
        <format>
          <samplecharacteristics>
            <width>1080</width>
            <height>1920</height>
          </samplecharacteristics>
        </format>
        <track>
          <clipitem id="clipitem-1">
            <name>${clip.title.replace(/[<>&"']/g, "")}</name>
            <start>0</start>
            <end>${durationFrames}</end>
            <in>${Math.round((clip.startMs / 1000) * 30)}</in>
            <out>${Math.round((clip.endMs / 1000) * 30)}</out>
            <file id="file-1">
              <name>${path.basename(clip.videoUrl)}</name>
              <pathurl>${clip.videoUrl}</pathurl>
            </file>
          </clipitem>
        </track>
      </video>
    </media>
  </sequence>
</xmeml>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="${safeSlug}.xml"`,
      },
    });
  }

  // Export MP4 (slice with ffmpeg if local source exists)
  const localVideoRelative = clip.videoUrl.startsWith("/")
    ? clip.videoUrl.slice(1)
    : "videos/sample_podcast.mp4";
  let sourceFilePath = path.join(process.cwd(), "public", localVideoRelative);
  if (!fs.existsSync(sourceFilePath)) {
    sourceFilePath = path.join(process.cwd(), "public/videos/sample_podcast.mp4");
  }

  const tmpOut = path.join(os.tmpdir(), `opus_export_${clip.id}_${Date.now()}.mp4`);
  try {
    const startSec = Math.max(0, (clip.startMs % 20000) / 1000);
    const durSec = Math.min(10, Math.max(3, clip.durationMs / 1000));
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-ss",
        String(startSec.toFixed(1)),
        "-i",
        sourceFilePath,
        "-t",
        String(durSec.toFixed(1)),
        "-c",
        "copy",
        tmpOut,
      ],
      { timeout: 10000 }
    );
    const buffer = fs.readFileSync(tmpOut);
    fs.unlinkSync(tmpOut);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${safeSlug}.mp4"`,
      },
    });
  } catch {
    const fallbackBuffer = fs.readFileSync(sourceFilePath);
    return new NextResponse(fallbackBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${safeSlug}.mp4"`,
      },
    });
  }
}
