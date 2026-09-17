import snapshot from "@/content.snapshot.json";
import { REGISTRY } from "@/sections/registry";
import type { SectionInstance, SiteConfig, Settings } from "@/sections/types";
import { createAdminClient } from "@/lib/supabase/admin";

/** Fill any setting the saved config omits with the schema's default. */
export function withDefaults(section: SectionInstance): SectionInstance {
  const def = REGISTRY[section.type];
  if (!def) return section;
  const settings: Settings = {};
  for (const f of def.schema.settings) {
    const saved = section.settings?.[f.key];
    settings[f.key] = saved === undefined ? f.default : saved;
  }
  return { ...section, settings };
}

export function hydrate(config: SiteConfig): SiteConfig {
  return { ...config, sections: config.sections.map(withDefaults) };
}

export const snapshotConfig = (): SiteConfig => hydrate(snapshot.config as SiteConfig);

/**
 * Runs at BUILD time only. Tries Supabase, falls back to the committed
 * snapshot so a paused free-tier project can never break a deploy — and so
 * `npm run dev` works with no environment variables at all.
 */
export async function getPublishedConfig(): Promise<SiteConfig> {
  const admin = createAdminClient();
  if (!admin) return snapshotConfig();
  try {
    const { data, error } = await admin
      .from("site_versions")
      .select("config")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data?.config) return snapshotConfig();
    return hydrate(data.config as SiteConfig);
  } catch {
    return snapshotConfig();
  }
}
