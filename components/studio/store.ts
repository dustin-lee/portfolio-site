"use client";
import { create } from "zustand";
import { REGISTRY, getDef } from "@/sections/registry";
import {
  instantiate,
  type ElementKey, type SectionInstance, type SiteConfig, type ThemeName, type TokenKey,
} from "@/sections/types";

type Device = "desktop" | "tablet" | "mobile";

/** Sentinel id for "Theme settings" in the section list / inspector. */
export const THEME_PANEL = "@theme";

interface StudioState {
  config: SiteConfig;
  initial: SiteConfig;
  selected: string | null;
  device: Device;
  dirty: boolean;
  status: string;

  select: (id: string) => void;
  setDevice: (d: Device) => void;
  setTheme: (t: ThemeName) => void;
  setToken: (key: TokenKey, value: string | null) => void;
  setElementColor: (key: ElementKey, value: string | null) => void;
  setCustomCss: (css: string) => void;
  setSectionCss: (id: string, css: string) => void;
  resetThemeOverrides: () => void;
  setSetting: (id: string, key: string, value: string | number | boolean) => void;
  toggleVisible: (id: string) => void;
  remove: (id: string) => void;
  add: (type: string) => void;
  reorder: (activeId: string, overId: string) => void;
  reset: () => void;
  setStatus: (s: string) => void;
  markSaved: () => void;
}

const clone = (c: SiteConfig): SiteConfig => JSON.parse(JSON.stringify(c));

export const createStudioStore = (initial: SiteConfig) =>
  create<StudioState>((set, get) => ({
    config: clone(initial),
    initial: clone(initial),
    selected: initial.sections.find((s) => !getDef(s.type)?.schema.locked)?.id ?? null,
    device: "desktop",
    dirty: false,
    status: "",

    select: (id) => set({ selected: id }),
    setDevice: (device) => set({ device }),
    setTheme: (theme) => set((st) => ({ config: { ...st.config, theme }, dirty: true })),

    // Overrides are keyed by preset, so switching presets never discards them.
    setToken: (key, value) =>
      set((st) => {
        const theme = st.config.theme;
        const current = st.config.themeOverrides?.[theme] ?? {};
        const tokens = { ...(current.tokens ?? {}) };
        if (value === null) delete tokens[key];
        else tokens[key] = value;
        return {
          dirty: true,
          config: {
            ...st.config,
            themeOverrides: { ...st.config.themeOverrides, [theme]: { ...current, tokens } },
          },
        };
      }),

    setElementColor: (key, value) =>
      set((st) => {
        const theme = st.config.theme;
        const current = st.config.themeOverrides?.[theme] ?? {};
        const elements = { ...(current.elements ?? {}) };
        if (value === null) delete elements[key];
        else elements[key] = value;
        return {
          dirty: true,
          config: {
            ...st.config,
            themeOverrides: { ...st.config.themeOverrides, [theme]: { ...current, elements } },
          },
        };
      }),

    setCustomCss: (customCss) => set((st) => ({ dirty: true, config: { ...st.config, customCss } })),

    setSectionCss: (id, css) =>
      set((st) => ({
        dirty: true,
        config: {
          ...st.config,
          sections: st.config.sections.map((s) => (s.id === id ? { ...s, css } : s)),
        },
      })),

    resetThemeOverrides: () =>
      set((st) => {
        const themeOverrides = { ...st.config.themeOverrides };
        delete themeOverrides[st.config.theme];
        return { dirty: true, config: { ...st.config, themeOverrides } };
      }),

    setSetting: (id, key, value) =>
      set((st) => ({
        dirty: true,
        config: {
          ...st.config,
          sections: st.config.sections.map((s) =>
            s.id === id ? { ...s, settings: { ...s.settings, [key]: value } } : s,
          ),
        },
      })),

    toggleVisible: (id) =>
      set((st) => ({
        dirty: true,
        config: {
          ...st.config,
          sections: st.config.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
        },
      })),

    remove: (id) =>
      set((st) => {
        const sections = st.config.sections.filter((s) => s.id !== id);
        return {
          dirty: true,
          config: { ...st.config, sections },
          selected: st.selected === id ? (sections.find((s) => !getDef(s.type)?.schema.locked)?.id ?? null) : st.selected,
        };
      }),

    add: (type) =>
      set((st) => {
        const def = REGISTRY[type];
        if (!def) return st;
        const section = instantiate(def.schema);
        const footerAt = st.config.sections.findIndex((s) => getDef(s.type)?.schema.locked === "footer");
        const sections = [...st.config.sections];
        sections.splice(footerAt < 0 ? sections.length : footerAt, 0, section);
        return { dirty: true, config: { ...st.config, sections }, selected: section.id };
      }),

    reorder: (activeId, overId) =>
      set((st) => {
        const sections = [...st.config.sections];
        const from = sections.findIndex((s) => s.id === activeId);
        const to = sections.findIndex((s) => s.id === overId);
        if (from < 0 || to < 0 || from === to) return st;
        if (getDef(sections[to].type)?.schema.locked) return st;
        const [moved] = sections.splice(from, 1);
        sections.splice(to, 0, moved);
        return { dirty: true, config: { ...st.config, sections } };
      }),

    reset: () => set((st) => ({ config: clone(st.initial), dirty: false, status: "Reverted to last save" })),
    setStatus: (status) => set({ status }),
    markSaved: () => set((st) => ({ initial: clone(st.config), dirty: false })),
  }));

export type StudioStore = ReturnType<typeof createStudioStore>;
export type { SectionInstance, Device };
