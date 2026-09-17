"use client";
import { useStore } from "zustand";
import {
  ELEMENT_KEYS, ELEMENT_LABEL, PRESETS, THEMES, TOKEN_KEYS, TOKEN_LABEL,
  isColor, resolveTokens,
} from "@/lib/theme";
import type { ElementKey, ThemeName, TokenKey } from "@/sections/types";
import type { StudioStore } from "./store";
import { CssBox } from "./CssBox";

const labelCls = "text-[11.5px] font-semibold text-zinc-600 dark:text-zinc-400";

/** A colour input plus a hex field, with a reset that clears the override. */
function ColorRow({
  label, value, isOverridden, onChange, onReset, placeholder,
}: {
  label: string;
  value: string;
  isOverridden: boolean;
  onChange: (v: string) => void;
  onReset: () => void;
  placeholder?: string;
}) {
  const id = `c-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="min-w-0 flex-1 truncate text-[12.5px] text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <input
        id={id}
        type="color"
        value={isColor(value) && value.startsWith("#") ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} colour`}
        className="h-7 w-7 flex-none cursor-pointer rounded border border-zinc-300 bg-transparent p-0.5 dark:border-zinc-700"
      />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} value`}
        spellCheck={false}
        className="w-[86px] flex-none rounded-md border border-zinc-300 bg-white px-1.5 py-1 font-mono text-[11px] uppercase text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        type="button"
        onClick={onReset}
        disabled={!isOverridden}
        title={isOverridden ? "Reset to the preset value" : "Using the preset value"}
        aria-label={`Reset ${label}`}
        className="flex-none rounded p-1 text-zinc-400 hover:text-blue-700 disabled:opacity-25 disabled:hover:text-zinc-400"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="h-3.5 w-3.5">
          <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
        </svg>
      </button>
    </div>
  );
}

export function ThemePanel({ store }: { store: StudioStore }) {
  const config = useStore(store, (s) => s.config);
  const setTheme = useStore(store, (s) => s.setTheme);
  const setToken = useStore(store, (s) => s.setToken);
  const setElementColor = useStore(store, (s) => s.setElementColor);
  const setCustomCss = useStore(store, (s) => s.setCustomCss);
  const resetThemeOverrides = useStore(store, (s) => s.resetThemeOverrides);

  const theme = config.theme;
  const custom = config.themeOverrides?.[theme] ?? {};
  const resolved = resolveTokens(theme, config.themeOverrides);
  const overrideCount =
    Object.keys(custom.tokens ?? {}).length + Object.keys(custom.elements ?? {}).length;

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-3.5 pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-base font-bold tracking-[-0.01em]">Theme settings</h2>
        <p className="text-xs leading-snug text-zinc-500">
          Start from a preset, then override anything. Overrides are saved per preset, so switching
          presets never throws your work away.
        </p>
      </div>

      {/* ---- preset ---- */}
      <div className="flex flex-col gap-1.5">
        <span className={labelCls}>Preset</span>
        <div role="group" aria-label="Theme preset" className="grid grid-cols-3 gap-1.5">
          {THEMES.map((t) => {
            const active = theme === t.id;
            const has = Boolean(config.themeOverrides?.[t.id as ThemeName]);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => setTheme(t.id as ThemeName)}
                className={`flex flex-col items-start gap-1.5 rounded-lg border p-2 text-left transition-colors ${
                  active
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                    : "border-zinc-300 bg-white hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                }`}
              >
                <span className="flex gap-1">
                  {(["bg", "ink", "acc"] as TokenKey[]).map((k) => (
                    <i key={k} className="block h-3.5 w-3.5 rounded-full border border-black/10"
                       style={{ background: PRESETS[t.id as ThemeName].tokens[k] }} />
                  ))}
                </span>
                <span className="text-[11.5px] font-semibold">{t.label}</span>
                {has ? <span className="font-mono text-[9px] uppercase tracking-wider text-blue-700 dark:text-blue-300">edited</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* ---- tokens ---- */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className={labelCls}>Theme colours</span>
          <button
            type="button"
            onClick={resetThemeOverrides}
            disabled={overrideCount === 0}
            className="text-[11px] text-zinc-500 underline underline-offset-2 hover:text-blue-700 disabled:opacity-40 disabled:no-underline"
          >
            Reset all ({overrideCount})
          </button>
        </div>
        {TOKEN_KEYS.map((k) => (
          <ColorRow
            key={k}
            label={TOKEN_LABEL[k]}
            value={resolved[k]}
            isOverridden={custom.tokens?.[k] !== undefined}
            onChange={(v) => setToken(k, v)}
            onReset={() => setToken(k, null)}
          />
        ))}
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* ---- per-element colours ---- */}
      <div className="flex flex-col gap-2">
        <span className={labelCls}>Element colours</span>
        <p className="text-[11px] leading-relaxed text-zinc-500">
          Left blank, each element inherits from the theme colours above. Set one and it wins
          everywhere on the site, except inside the inverted contact band.
        </p>
        {ELEMENT_KEYS.map((k: ElementKey) => (
          <ColorRow
            key={k}
            label={ELEMENT_LABEL[k]}
            value={custom.elements?.[k] ?? ""}
            placeholder="inherit"
            isOverridden={custom.elements?.[k] !== undefined}
            onChange={(v) => setElementColor(k, v)}
            onReset={() => setElementColor(k, null)}
          />
        ))}
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* ---- global custom CSS ---- */}
      <CssBox
        id="global-css"
        label="Custom CSS (whole site)"
        value={config.customCss ?? ""}
        onChange={setCustomCss}
        placeholder={`.wrap { max-width: 1040px }\nh1 { letter-spacing: -0.03em }`}
        hint="Applied inside the theme scope. Plain declarations and nested selectors both work."
      />
    </div>
  );
}
