import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-6">
      <h1 className="font-display text-2xl font-extrabold tracking-[-0.02em]">Section Studio</h1>
      {!configured ? (
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Supabase is not configured yet. Copy <code className="font-mono text-xs">.env.example</code> to
          {" "}<code className="font-mono text-xs">.env.local</code>, fill in your project URL and keys, then restart the dev server.
        </p>
      ) : user ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as {user.email}, but this account is not the studio owner. Set
          {" "}<code className="font-mono text-xs">STUDIO_OWNER_ID</code> to this user id: <br />
          <code className="font-mono text-xs break-all">{user.id}</code>
        </p>
      ) : (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Sign in with GitHub to edit the site.</p>
          <form action="/api/auth/github" method="post">
            <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
              Continue with GitHub
            </button>
          </form>
        </>
      )}
    </main>
  );
}
