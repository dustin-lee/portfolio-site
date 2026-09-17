import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  const auth = await requireOwner();
  if (!auth.ok && auth.reason === "supabase-not-configured" && process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, deploying: false, note: "Supabase not configured" });
  }
  if (!auth.ok) return NextResponse.json({ error: "Not authorised" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });

  const { data: latest, error: readErr } = await admin
    .from("site_versions").select("id").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (readErr || !latest) return NextResponse.json({ error: "Nothing to publish" }, { status: 400 });

  // one published row at a time — enforced by a partial unique index
  await admin.from("site_versions").update({ status: "draft" }).eq("status", "published");
  const { error } = await admin.from("site_versions").update({ status: "published" }).eq("id", latest.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hook = process.env.NETLIFY_BUILD_HOOK;
  if (!hook) return NextResponse.json({ ok: true, deploying: false });

  const res = await fetch(hook, { method: "POST" });
  return NextResponse.json({ ok: true, deploying: res.ok });
}
