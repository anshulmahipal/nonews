/**
 * Vercel Cron: runs at 23:30 UTC (5:00 AM IST) to trigger the morning pipeline.
 * Calls daily-ingestor then ai-processor. Secure with CRON_SECRET in Vercel env.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min for ingestor + ai-processor

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  const headers = {
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  try {
    const ingestorRes = await fetch(`${supabaseUrl}/functions/v1/daily-ingestor`, {
      method: "POST",
      headers,
      body: "{}",
    });
    const ingestBody = await ingestorRes.json();
    if (!ingestorRes.ok || ingestBody.error) {
      return NextResponse.json(
        { error: "daily-ingestor failed", details: ingestBody },
        { status: 502 }
      );
    }

    const aiRes = await fetch(`${supabaseUrl}/functions/v1/ai-processor`, {
      method: "POST",
      headers,
      body: "{}",
    });
    const aiBody = await aiRes.json();
    if (!aiRes.ok || aiBody.error) {
      return NextResponse.json(
        { error: "ai-processor failed", details: aiBody },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      ingestor: ingestBody,
      aiProcessor: aiBody,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Cron request failed", message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
