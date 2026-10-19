import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot modify brand templates." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));

  const existing = await prisma.brandTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  const currentConfig = JSON.parse(existing.configJson || "{}");
  const nextConfig =
    typeof body.config === "object" && body.config
      ? { ...currentConfig, ...body.config }
      : currentConfig;

  if (body.isDefault === true) {
    await prisma.brandTemplate.updateMany({
      data: { isDefault: false },
    });
  }

  const updated = await prisma.brandTemplate.update({
    where: { id },
    data: {
      name: typeof body.name === "string" ? body.name.trim() : existing.name,
      isDefault:
        typeof body.isDefault === "boolean" ? body.isDefault : existing.isDefault,
      aspectRatio: String(nextConfig.aspectRatio || existing.aspectRatio),
      layoutMode: String(nextConfig.layoutMode || existing.layoutMode),
      presetKey: String(nextConfig.presetKey || existing.presetKey),
      configJson: JSON.stringify(nextConfig),
    },
  });

  return NextResponse.json({ template: updated });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot delete brand templates." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  await prisma.brandTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
