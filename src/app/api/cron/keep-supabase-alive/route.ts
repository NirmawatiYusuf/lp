import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminConfigured } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!isAdminConfigured()) return NextResponse.json({ ok: false, error: "config" }, { status: 503 });
  const started = Date.now();
  const { data, error } = await createAdminClient().from("posts").select("id").eq("published", true).limit(1);
  return NextResponse.json({ ok: !error, checkedAt: new Date().toISOString(), durationMs: Date.now() - started, rowsSeen: data?.length ?? 0 }, { status: error ? 503 : 200 });
}
