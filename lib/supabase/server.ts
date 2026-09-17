import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* read-only context */ }
      },
    },
  });
}

/** The single source of truth for "is this request allowed to edit the site?" */
export async function requireOwner() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false as const, reason: "supabase-not-configured" };
  const { data } = await supabase.auth.getUser();
  const owner = process.env.STUDIO_OWNER_ID;
  if (!data.user) return { ok: false as const, reason: "no-session" };
  if (!owner || data.user.id !== owner) return { ok: false as const, reason: "not-owner" };
  return { ok: true as const, user: data.user };
}
