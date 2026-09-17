import { z } from "zod";
import { REGISTRY } from "@/sections/registry";
import { ELEMENT_KEYS, TOKEN_KEYS, isColor, sanitizeCss } from "@/lib/theme";
import type { SiteConfig } from "@/sections/types";

const settingValue = z.union([z.string(), z.number(), z.boolean()]);

/** A colour the theme system will actually accept — anything else is rejected. */
const color = z.string().refine(isColor, { message: "not a valid CSS colour" });

/** Custom CSS is stored sanitised, so what validates is what renders. */
const css = (max: number) =>
  z.string().max(max * 2).transform((v) => sanitizeCss(v, max));

const partialRecord = <K extends string>(keys: readonly K[]) =>
  z.object(Object.fromEntries(keys.map((k) => [k, color.optional()])) as Record<K, z.ZodOptional<typeof color>>).partial();

const themeCustom = z.object({
  tokens: partialRecord(TOKEN_KEYS).optional(),
  elements: partialRecord(ELEMENT_KEYS).optional(),
});

export const sectionInstance = z.object({
  id: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/, "id must be alphanumeric, dash or underscore"),
  type: z.string().refine((t) => t in REGISTRY, { message: "unknown section type" }),
  visible: z.boolean(),
  settings: z.record(z.string(), settingValue),
  css: css(8_000).optional(),
});

export const siteConfig = z.object({
  theme: z.enum(["paper", "graphite", "signal"]),
  themeOverrides: z
    .object({ paper: themeCustom.optional(), graphite: themeCustom.optional(), signal: themeCustom.optional() })
    .optional(),
  customCss: css(20_000).optional(),
  sections: z.array(sectionInstance).min(1).max(40),
});

export function parseConfig(input: unknown): SiteConfig {
  return siteConfig.parse(input) as SiteConfig;
}
