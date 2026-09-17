import { NextResponse } from "next/server";
import { parseConfig } from "@/lib/config-schema";
import { requireOwner } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireOwner();

  // Local development without Supabase: accept and no-op so the editor is usable.
  if (!auth.ok && auth.reason === "supabase-not-configured" && process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, persisted: false, note: "Supabase not configured — draft kept in memory only" });
  }
  if (!auth.ok) return NextResponse.json({ error: "Not authorised" }, { status: 401 });

  let config;
  try {
    const body = await request.json();
    config = parseConfig(body?.config);
  } catch {
    return NextResponse.json({ error: "Invalid config" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });

  const { error } = await admin.from("site_versions").insert({
    config, status: "draft", created_by: auth.user.id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, persisted: true });
}
