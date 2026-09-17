import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const body = z.object({
  name: z.string().min(1).max(120),
  email: z.email().max(200),
  message: z.string().min(10).max(4000),
  website: z.string().max(0).optional(), // honeypot: bots fill it, humans never see it
});

export async function POST(request: Request) {
  let input;
  try {
    input = body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
  }
  if (input.website) return NextResponse.json({ ok: true }); // silently drop

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Messages are not set up yet." }, { status: 503 });

  const ip = request.headers.get("x-nf-client-connection-ip") ?? request.headers.get("x-forwarded-for") ?? "";
  const ip_hash = ip ? createHash("sha256").update(ip).digest("hex").slice(0, 32) : null;

  const { error } = await admin.from("leads").insert({
    name: input.name, email: input.email, message: input.message, ip_hash,
  });
  if (error) return NextResponse.json({ error: "Could not send that. Try email instead." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
