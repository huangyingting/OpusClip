import { NextResponse } from "next/server";
import { generateFreeToolResult } from "@/lib/ai/clip-engine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const toolSlug = String(body.toolSlug || "youtube-title-generator");
  const topic = String(body.topic || "");
  const tone = String(body.tone || "Viral & High-Retention");

  const result = generateFreeToolResult({ toolSlug, topic, tone });
  return NextResponse.json(result);
}
