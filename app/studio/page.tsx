import { getPublishedConfig, hydrate, snapshotConfig } from "@/lib/content";
import { createAdminClient } from "@/lib/supabase/admin";
import { StudioClient } from "./StudioClient";
import type { SiteConfig } from "@/sections/types";

export const dynamic = "force-dynamic";

/** Prefer the newest draft; fall back to what is published; fall back to the snapshot. */
async function loadWorkingConfig(): Promise<SiteConfig> {
  const admin = createAdminClient();
  if (!admin) return snapshotConfig();
  const { data } = await admin
    .from("site_versions")
    .select("config")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data?.config) return hydrate(data.config as SiteConfig);
  return getPublishedConfig();
}

export default async function StudioPage() {
  const initial = await loadWorkingConfig();
  return <StudioClient initial={initial} />;
}
