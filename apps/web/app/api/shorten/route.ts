import { isAllowedEditorialShareUrl } from "@nonews/shared";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Proxies to Cloudflare Worker POST /v1/shorten. Secrets stay server-side.
 */
export async function POST(request: NextRequest) {
  let body: { longUrl?: string };
  try {
    body = (await request.json()) as { longUrl?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const longUrl = typeof body.longUrl === "string" ? body.longUrl.trim() : "";
  if (!longUrl || !isAllowedEditorialShareUrl(longUrl)) {
    return NextResponse.json({ error: "longUrl not allowed" }, { status: 400 });
  }

  const workerBase = process.env.SHORT_LINK_WORKER_URL?.replace(/\/$/, "");
  const secret = process.env.SHORT_LINK_CREATE_SECRET;
  if (!workerBase || !secret) {
    return NextResponse.json(
      { error: "Short links not configured" },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(`${workerBase}/v1/shorten`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ long_url: longUrl }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return NextResponse.json(
        { error: "Short link service error", detail: detail.slice(0, 500) },
        { status: 502 },
      );
    }

    const data = (await upstream.json()) as { short_url?: string };
    if (typeof data.short_url !== "string") {
      return NextResponse.json(
        { error: "Bad response from short link service" },
        { status: 502 },
      );
    }

    return NextResponse.json({ shortUrl: data.short_url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
