# Operating this site

Everything practical: running it locally, the checks, deploying, and the day-to-day of keeping it current.
For *why* any of it is shaped this way, see the [README](../README.md).

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

**It runs with zero configuration.** With no `.env.local`, the site builds from `../content.snapshot.json` and `/studio` is open in development so you can play with the editor immediately. Supabase only becomes necessary when you want edits to persist.

```bash
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm test             # schema + config unit tests
npm run guard        # fails if editor code is imported under app/(site)
npm run budget       # fails if the public page's JS regresses
```

---

## How it fits together

```
  [ /studio ]  --save/publish-->  [ Supabase ]
                                       |
  [ GitHub API ] --nightly Action-->   |
                                       v
                          [ Netlify build ]
                                       |
                             reads config once
                                       v
                        [ static HTML on the CDN ]  <-- visitors
```

The public site **never** reads Supabase at runtime. Supabase's free tier pauses a project after ~7 days of low activity; if a visitor's page load depended on it, your portfolio would be broken during any quiet week. Instead the build reads the published config once and emits static HTML, with `../content.snapshot.json` committed as a fallback so a deploy can't fail even if Supabase is unreachable.

### Adding a section type

One folder, one line. Nothing else changes.

```
sections/testimonials/schema.ts     # the settings the editor shows
sections/testimonials/Testimonials.tsx
sections/registry.ts                # add: testimonials: { schema, Component }
```

The schema drives the Settings panel, the Zod validator used on save, the component's prop types and the "Add section" menu. Field types available: `text`, `textarea`, `toggle`, `select`, `range`.

### Themes and custom CSS

Three presets ship — **Paper**, **Graphite**, **Signal** — and everything about them is overridable from **Theme settings** at the bottom of the section list.

**Preset tokens.** The eight colour tokens (`bg`, `surf`, `ink`, `mut`, `acc`, `accInk`, `line`, `soft`) live in `../lib/theme.ts`, which is the single source of truth. `<ThemeStyle>` emits them as CSS variables at render time, so the editor's swatches and the shipped stylesheet can never drift. Tailwind utilities (`bg-bg`, `text-mut`, `border-line`, `bg-acc`) map onto them via `@theme inline`.

**Overrides are stored per preset.** Recolour Paper's accent, switch to Graphite and back, and your Paper edits are still there. Each control has a reset that clears the override and returns that token to the preset value — the presets themselves are never mutated.

**Element colours.** `h1`, `h2`, `h3`, `p`, `a` and `.eyebrow` each take an optional colour. Left blank they inherit from the tokens. These rules are emitted **unlayered**, which is deliberate: Tailwind's `utilities` layer would otherwise beat them and a `p` override would silently do nothing against `text-mut`. They are only emitted when you actually set one, and they carry `:not([data-invert] *)` so the inverted contact band keeps its own readable colours.

**Custom CSS, two scopes.**

| Scope | Where | Emitted as |
|---|---|---|
| Whole site | Theme settings → Custom CSS | `[data-theme="paper"] { … }` |
| One section | that section's Settings panel | `[data-sid="projects-1"] { … }` |

Both use native CSS nesting: bare declarations style the scope itself, nested selectors style what is inside it.

```css
/* in the Featured work section's box */
background: #101418;
.card { border-radius: 2px }
h2 { color: #F5A54A }
```

Every section is wrapped in `<div data-sid="…" data-section="…">` on both the public page and the editor preview, so a rule behaves identically in each. Section ids are validated as plain identifiers, and CSS is sanitised on save: `<` is stripped (it is the only character that could close the `<style>` tag early), along with `@import` and `expression()`. `>` is kept — child combinators are legitimate. Colours are validated against a hex / colour-function / keyword pattern, so a value like `red } body { display:none` is rejected rather than escaping its declaration.

None of this costs the visitor any JavaScript: `<ThemeStyle>` is a server component that renders one `<style>` tag, and the public page's bundle is unchanged at ~169 kB.

Add a fourth preset by adding one entry to `PRESETS` in `../lib/theme.ts` and one value to the `ThemeName` union in `../sections/types.ts`.

---

## Deploying

### 1. Push to GitHub

```bash
git init && git add -A
git commit -m "feat: portfolio + section studio"
git branch -M main
git remote add origin git@github.com:<you>/portfolio.git
git push -u origin main
```

### 2. Connect Netlify

1. Netlify → **Add new site → Import an existing project** → pick the repo.
2. Build command `npm run build`, publish directory `.next`. `../netlify.toml` already sets these plus security headers and `noindex` on `/studio`.
3. Deploy. The site is live on a `*.netlify.app` URL within a minute, running entirely off `../content.snapshot.json`.

At this point you have a working public portfolio. Everything below is optional and can wait.

### 3. Supabase (makes the editor persist)

1. Create a project at supabase.com.
2. SQL Editor → paste `../supabase/migrations/0001_init.sql` → Run.
3. Authentication → Providers → enable **GitHub**, using a GitHub OAuth app whose callback is `https://<project-ref>.supabase.co/auth/v1/callback`.
4. Sign in once at `/studio/login`. The page prints your user id — that is your `STUDIO_OWNER_ID`.
5. Set these in **Netlify → Site configuration → Environment variables**:

   | Variable | Where it comes from |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page |
   | `SUPABASE_SERVICE_ROLE_KEY` | same page — **server only, never expose** |
   | `STUDIO_OWNER_ID` | your user id from step 4 |
   | `NETLIFY_BUILD_HOOK` | Netlify → Build & deploy → Build hooks → Add |

6. Redeploy. `/studio` now requires your GitHub login, saves drafts to Postgres, and Publish fires the build hook.

### 4. GitHub sync

**This needs no configuration at all.** The workflow defaults the username to `github.repository_owner` and falls back to the built-in `github.token` (1,000 requests/hour), so pushing the repo is enough. Run **Actions → Nightly GitHub sync → Run workflow** once to confirm, then it runs at 02:00 PT daily. It rewrites `../content.snapshot.json`, commits it, and triggers a deploy.

Two optional additions, under Settings → Secrets and variables → Actions:

| Name | Kind | When you need it |
|---|---|---|
| `GH_READ_TOKEN` | secret | A fine-grained PAT (public repositories, read-only). Raises the limit to 5,000/hr. |
| `PORTFOLIO_GH_USER` | variable | Only if your portfolio repo lives under a different account than the profile you want to show. |
| `NETLIFY_BUILD_HOOK` | secret | Redeploys after each sync. Without it the snapshot is still committed. |

> A repository variable **cannot** be named `GITHUB_USERNAME` — GitHub reserves the `GITHUB_` prefix for secrets and variables alike, so the name is rejected. That is why the override is `PORTFOLIO_GH_USER`.

To hide a repo from the site, set `"hidden": true` on it in `../content.snapshot.json` — the sync preserves that flag and any `description` you have overridden.

### 5. Custom domain

Netlify → Domain management → add your domain, follow the DNS instructions, and let Netlify provision the certificate. Then update `profile.site` in `../content.snapshot.json` so canonical URLs and JSON-LD point at the right place.

---

## Security model

Four independent mechanisms keep the editor away from visitors:

1. **Route groups** — `app/(site)/` and `app/studio/` share only the section components. Editor chrome is imported solely under `app/studio/`.
2. **`proxy.ts`** — gates `/studio/:path*` at the edge before HTML is generated. Unauthenticated requests are redirected; in production with Supabase unconfigured the route 404s entirely. *(Next.js 16 renamed `middleware.ts` to `proxy.ts`.)*
3. **Separate bundles** — the public page ships ~169 kB gzipped, which is Next 16's App Router baseline for a page with zero client components. dnd-kit and the store are in the studio's own chunks.
4. **CI** — `npm run guard` fails if editor packages are imported under `app/(site)`; `npm run budget` inspects the emitted chunk *contents* for editor markers and enforces the JS budget.

Server-side, `requireOwner()` re-verifies the session on every write, the service-role key never reaches the browser, and RLS restricts writes to your user id. The contact endpoint uses a honeypot and stores only a truncated hash of the IP.

Verified behaviour of a production build with no Supabase configured:

```
GET  /            → 200, static HTML
GET  /studio      → 404
POST /api/save    → 401 {"error":"Not authorised"}
```

---

## Notes and known trade-offs

- **Fonts** are loaded via `<link>` from Google Fonts so the project builds in any environment. `../app/fonts.tsx` documents the three-line swap to `next/font/google`, which self-hosts them and removes the third-party request — worth doing once you are building on Netlify.
- **Roles and posts** in `../content.snapshot.json` are hand-authored; only `repos`, `languages` and `stats` are overwritten by the nightly sync.
- **Sample content ships in the snapshot.** Replace `profile`, `roles` and `posts` with your own before going live, and run the sync to pull your real repos.
- **Playwright** is not installed by default to keep `npm install` light. Add `@playwright/test` and a `/studio` redirect test when you want browser coverage in CI.
- **The Lighthouse CI step** is left out of `../.github/workflows/ci.yml` until the site has a stable preview URL; add `treosh/lighthouse-ci-action` pointed at the Netlify deploy preview once the domain is set.

---

## Layout

```
app/
  (site)/layout.tsx        public root layout — sets data-theme from the published config
  (site)/page.tsx          renders the section list; force-static
  studio/layout.tsx        editor root layout
  studio/page.tsx          loads the working config, renders the client editor
  studio/login/page.tsx    GitHub sign-in / owner-id helper
  studio/StudioClient.tsx  three-pane editor shell
  api/{save,publish,contact}/route.ts
  fonts.tsx  globals.css
components/ThemeStyle.tsx  emits the whole theme as one <style>; used by site AND preview
proxy.ts                   edge gate for /studio
sections/                  one folder per section type + registry.ts
components/studio/         store, SectionList (dnd-kit), Inspector, Field, Toolbar,
                           ThemePanel (tokens + element colours), CssBox
lib/                       content, data, theme, config-schema, supabase clients
scripts/                   sync-github.ts, guard-bundle.mjs, check-budget.mjs
supabase/migrations/       0001_init.sql
tests/                     schema + config unit tests
content.snapshot.json      published config + site data (the build's source of truth)
```
