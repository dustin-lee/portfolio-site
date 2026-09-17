import type { ComponentType } from "react";

/** A single control in the editor's Settings panel. */
export type FieldDef =
  | { key: string; label: string; type: "text"; default: string; hint?: string }
  | { key: string; label: string; type: "textarea"; default: string; hint?: string }
  | { key: string; label: string; type: "toggle"; default: boolean; hint?: string }
  | { key: string; label: string; type: "select"; options: string[]; default: string; hint?: string }
  | {
      key: string; label: string; type: "range";
      min: number; max: number; step: number; unit?: string; default: number; hint?: string;
    };

/**
 * A section's contract. This single object drives four things:
 *   1. the controls rendered in the Settings panel
 *   2. the Zod validator used on save
 *   3. the TypeScript type of the component's props
 *   4. the entry in the "Add section" menu
 */
export interface SectionSchema {
  type: string;
  name: string;
  blurb?: string;
  /** Locked sections are editable but cannot be reordered or removed. */
  locked?: "header" | "footer";
  settings: FieldDef[];
}

export type Settings = Record<string, string | number | boolean>;

export interface SectionInstance {
  id: string;
  type: string;
  visible: boolean;
  settings: Settings;
  /** Custom CSS scoped to this section. Empty or absent means none. */
  css?: string;
}

export type ThemeName = "paper" | "graphite" | "signal";

/** Colour tokens every preset defines. Mirrored by TOKEN_KEYS in lib/theme.ts. */
export type TokenKey = "bg" | "surf" | "ink" | "mut" | "acc" | "accInk" | "line" | "soft";

/** Elements that can take a colour override. Mirrored by ELEMENT_KEYS in lib/theme.ts. */
export type ElementKey = "h1" | "h2" | "h3" | "p" | "a" | "eyebrow";

export interface ThemeCustom {
  tokens?: Partial<Record<TokenKey, string>>;
  elements?: Partial<Record<ElementKey, string>>;
}

/** Overrides are stored per preset, so switching presets never loses your work. */
export type ThemeOverrides = Partial<Record<ThemeName, ThemeCustom>>;

export interface SiteConfig {
  theme: ThemeName;
  /** Per-preset token and element colour overrides. */
  themeOverrides?: ThemeOverrides;
  /** Custom CSS applied to the whole site. */
  customCss?: string;
  sections: SectionInstance[];
}

export interface SectionDef {
  schema: SectionSchema;
  Component: ComponentType<{ s: Settings }>;
}

/** Build an instance with every default filled in. */
export function instantiate(schema: SectionSchema, id?: string): SectionInstance {
  const settings: Settings = {};
  for (const f of schema.settings) settings[f.key] = f.default;
  return { id: id ?? `${schema.type}-${Math.random().toString(36).slice(2, 8)}`, type: schema.type, visible: true, settings };
}

/** Comma-separated string -> trimmed list. Used by several sections. */
export function csv(v: unknown): string[] {
  return String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
}
