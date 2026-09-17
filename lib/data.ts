import snapshot from "@/content.snapshot.json";

export interface Repo {
  name: string; description: string; language: string | null; color: string;
  stars: number; topics: string[]; url: string; hidden: boolean;
  /** True while this row is placeholder content, before the first GitHub sync. */
  sample?: boolean;
}
/** Work with no public repo: private, professional, or under NDA. */
export interface ManualProject {
  title: string;
  /** Optional, e.g. "Solo project" or "Backend lead". */
  role?: string;
  summary: string;
  tech: string[];
  /** A live demo or write-up. Omit for private work; the card then renders unlinked. */
  url?: string;
}
export interface Role { when: string; org: string; role: string; summary: string }
export interface Post { title: string; date: string; url: string }

export interface SiteData {
  profile: { name: string; username: string; title: string; email: string; github: string; linkedin: string; site: string };
  /** null means the sync could not verify it; the section omits it rather than printing 0. */
  stats: { commits: number | null; repos: number; stars: number; prs: number | null; featured: number; years: string };
  languages: { name: string; pct: number; color: string }[];
  contributions: number[];
  repos: Repo[];
  manualProjects: ManualProject[];
  roles: Role[];
  posts: Post[];
}

/**
 * Content the sections render. Written by scripts/sync-github.ts at build time —
 * the browser never calls the GitHub API.
 */
export const data = snapshot.data as SiteData;
