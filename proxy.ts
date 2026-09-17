import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Gates /studio at the edge, before any HTML is generated.
 * An unauthenticated request never receives the editor page at all.
 *
 * NOTE: Next.js 16 renamed `middleware.ts` to `proxy.ts`.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const owner = process.env.STUDIO_OWNER_ID;

  // Local development with no Supabase project yet: allow, but only off-production.
  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Studio is not configured.", { status: 404 });
    }
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user || (owner && data.user.id !== owner)) {
    const login = new URL("/studio/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  matcher: ["/studio", "/studio/((?!login).*)"],
};
