import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_BRAND_TEMPLATES } from "@/lib/ai/clip-engine";

export async function GET() {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const templates = await prisma.brandTemplate.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot create brand templates." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const defaultConfig = DEFAULT_BRAND_TEMPLATES[0].config;
  const config = {
    ...defaultConfig,
    ...(typeof body.config === "object" && body.config ? body.config : {}),
  };

  const template = await prisma.brandTemplate.create({
    data: {
      name: String(body.name || "Custom Studio Preset").trim(),
      isDefault: Boolean(body.isDefault),
      aspectRatio: String(config.aspectRatio || "9:16"),
      layoutMode: String(config.layoutMode || "fill"),
      presetKey: String(config.presetKey || "karaoke"),
      configJson: JSON.stringify(config),
      ownerId: actor.id,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
