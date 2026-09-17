import { themeCss, allSectionCss } from "@/lib/theme";
import type { SiteConfig } from "@/sections/types";

/**
 * The entire visual theme as one <style> tag: preset tokens with any overrides
 * applied, per-element colour rules, global custom CSS, and each section's own
 * scoped CSS.
 *
 * Both the public page and the editor preview render this exact component, so
 * the preview is byte-for-byte what ships. It is a server component with no
 * client JavaScript.
 */
export function ThemeStyle({ config }: { config: SiteConfig }) {
  const css = [themeCss(config), allSectionCss(config)].filter(Boolean).join("\n");
  return <style id="site-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
