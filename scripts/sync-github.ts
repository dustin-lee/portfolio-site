/**
 * Pulls repo + language data from the GitHub API and rewrites content.snapshot.json.
 * Runs in CI only — the browser never talks to GitHub.
 *
 *   GITHUB_USERNAME=you GH_READ_TOKEN=ghp_... npm run sync:github
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const USER = process.env.GITHUB_USERNAME;
const TOKEN = process.env.GH_READ_TOKEN;
const SNAPSHOT = resolve(process.cwd(), "content.snapshot.json");

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6", JavaScript: "#E8B339", Go: "#00ADD8", Python: "#4B8BBE",
  Rust: "#D2703A", Shell: "#89E051", Ruby: "#CC342D", Java: "#B07219",
  "C++": "#F34B7D", C: "#555555", Swift: "#F05138", Kotlin: "#A97BFF", HTML: "#E34C26", CSS: "#563D7C",
};

interface GhRepo {
  name: string; description: string | null; language: string | null;
  stargazers_count: number; topics: string[]; html_url: string;
  fork: boolean; archived: boolean; pushed_at: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function gh<T>(path: string, attempt = 1): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "portfolio-sync",
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
    },
  });

  if (res.ok) return res.json() as Promise<T>;

  const body = await res.text();
  const rateLimited = res.status === 403 && /rate limit/i.test(body);

  // Retry transient failures twice before giving up, so one blip does not turn
  // the nightly job red.
  if ((rateLimited || res.status >= 500) && attempt < 3) {
    const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000;
    const waitForReset = reset ? reset - Date.now() : 0;
    const wait = Math.min(Math.max(waitForReset, 2_000 * attempt), 60_000);
    console.warn(`GitHub ${res.status} (attempt ${attempt}) — retrying in ${Math.round(wait / 1000)}s`);
    await sleep(wait);
    return gh<T>(path, attempt + 1);
  }

  if (rateLimited && !TOKEN) {
    throw new Error(
      `GitHub rate limit hit and no token was supplied. Unauthenticated requests get 60/hr per IP. ` +
      `Set GH_READ_TOKEN to a fine-grained PAT (public repositories, read-only) for 5,000/hr.`,
    );
  }
  throw new Error(`GitHub ${res.status} on ${path}: ${body}`);
}

async function main() {
  if (!USER) {
    console.error("GITHUB_USERNAME is not set — leaving content.snapshot.json untouched.");
    process.exit(0);
  }

  const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
  const previous: { name: string; hidden?: boolean; description?: string }[] = snapshot.data.repos ?? [];
  const overrides = new Map(previous.map((r) => [r.name, r]));

  const all = await gh<GhRepo[]>(`/users/${USER}/repos?per_page=100&sort=pushed`);
  const live = all.filter((r) => !r.fork && !r.archived);

  const repos = live
    .map((r) => {
      const prev = overrides.get(r.name);
      return {
        name: r.name,
        description: prev?.description && prev.description !== "" ? prev.description : (r.description ?? ""),
        language: r.language,
        color: LANG_COLORS[r.language ?? ""] ?? "#8C93A0",
        stars: r.stargazers_count,
        topics: r.topics ?? [],
        url: r.html_url,
        hidden: prev?.hidden ?? false,
        pushedAt: r.pushed_at,
      };
    })
    .sort((a, b) => b.stars - a.stars);

  const byLang = new Map<string, number>();
  for (const r of live) if (r.language) byLang.set(r.language, (byLang.get(r.language) ?? 0) + 1);
  const total = [...byLang.values()].reduce((a, b) => a + b, 0) || 1;
  const ranked = [...byLang.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 4);
  const restPct = Math.max(0, 100 - top.reduce((sum, [, n]) => sum + Math.round((n / total) * 100), 0));
  const languages = [
    ...top.map(([name, n]) => ({ name, pct: Math.round((n / total) * 100), color: LANG_COLORS[name] ?? "#8C93A0" })),
    ...(restPct > 0 ? [{ name: "Other", pct: restPct, color: "#8C93A0" }] : []),
  ];

  // Every number the site displays is fetched, never carried over from the
  // placeholder snapshot. A portfolio that states invented metrics is worse
  // than one that omits them, so anything unavailable is set to null and the
  // GitHub section skips it.
  const profile = await gh<{ created_at: string }>(`/users/${USER}`);
  const since = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);

  const count = async (path: string): Promise<number | null> => {
    try {
      const r = await gh<{ total_count: number }>(path);
      return r.total_count;
    } catch {
      return null; // search API is rate limited hard when unauthenticated
    }
  };

  const commits = await count(`/search/commits?q=author:${USER}+author-date:>=${since}&per_page=1`);
  const prs = await count(`/search/issues?q=author:${USER}+type:pr+is:merged&per_page=1`);

  const firstYear = new Date(profile.created_at).getFullYear();
  const years = Math.max(1, new Date().getFullYear() - firstYear);

  snapshot.data.repos = repos;
  snapshot.data.languages = languages;
  snapshot.data.stats = {
    commits,
    prs,
    repos: live.length,
    stars: live.reduce((sum, r) => sum + r.stargazers_count, 0),
    featured: repos.filter((r) => !r.hidden).length,
    years: `${years} yrs`,
  };
  snapshot.data.profile.username = USER;
  snapshot.data.profile.github = `https://github.com/${USER}`;
  snapshot.generatedAt = new Date().toISOString();

  writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`Synced ${repos.length} repos for ${USER}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
