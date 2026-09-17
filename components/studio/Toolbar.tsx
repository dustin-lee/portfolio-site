"use client";
import { useState } from "react";
import { useStore } from "zustand";
import { THEMES } from "@/lib/theme";
import type { StudioStore, Device } from "./store";
import type { ThemeName } from "@/sections/types";

const DEVICES: { id: Device; label: string }[] = [
  { id: "desktop", label: "Desktop" },
  { id: "tablet", label: "Tablet" },
  { id: "mobile", label: "Mobile" },
];

const btn =
  "rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-[12.5px] hover:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900";

export function Toolbar({ store }: { store: StudioStore }) {
  const config = useStore(store, (s) => s.config);
  const device = useStore(store, (s) => s.device);
  const dirty = useStore(store, (s) => s.dirty);
  const status = useStore(store, (s) => s.status);
  const setDevice = useStore(store, (s) => s.setDevice);
  const setTheme = useStore(store, (s) => s.setTheme);
  const reset = useStore(store, (s) => s.reset);
  const setStatus = useStore(store, (s) => s.setStatus);
  const markSaved = useStore(store, (s) => s.markSaved);
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);

  async function post(url: string, body?: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? `${res.status}`);
    return json;
  }

  async function save() {
    setBusy("save");
    try {
      await post("/api/save", { config });
      markSaved();
      setStatus("Draft saved");
    } catch (e) {
      setStatus(`Save failed — ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function publish() {
    setBusy("publish");
    try {
      await post("/api/save", { config });
      const out = await post("/api/publish");
      markSaved();
      setStatus(out.deploying ? "Published — deploy running" : "Published (no build hook configured)");
    } catch (e) {
      setStatus(`Publish failed — ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="flex items-center gap-2">
        <span className="grid h-[22px] w-[22px] place-items-center rounded-md bg-blue-600 text-white" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-3 w-3">
            <path d="M3 6h18M3 12h18M3 18h11" />
          </svg>
        </span>
        <b className="font-display text-[15px] font-extrabold tracking-[-0.01em]">Section Studio</b>
        <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${
          dirty ? "border-amber-500 text-amber-600" : "border-emerald-600 text-emerald-700"
        }`}>
          {dirty ? "Unsaved" : "Saved"}
        </span>
      </span>

      <span className="flex-1" />

      <div className="flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700" role="group" aria-label="Preview width">
        {DEVICES.map((d) => (
          <button key={d.id} type="button" onClick={() => setDevice(d.id)} aria-pressed={device === d.id}
                  className={`border-r border-zinc-300 px-2.5 py-1.5 text-xs last:border-r-0 dark:border-zinc-700 ${
                    device === d.id ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "text-zinc-500"
                  }`}>
            {d.label}
          </button>
        ))}
      </div>

      <label className="sr-only" htmlFor="theme-select">Site theme</label>
      <select id="theme-select" className={btn} value={config.theme}
              onChange={(e) => setTheme(e.target.value as ThemeName)}>
        {THEMES.map((t) => <option key={t.id} value={t.id}>Theme · {t.label}</option>)}
      </select>

      <button type="button" className={btn} onClick={reset} disabled={!dirty}>Revert</button>
      <button type="button" className={btn} onClick={save} disabled={busy !== null || !dirty}>
        {busy === "save" ? "Saving…" : "Save draft"}
      </button>
      <button type="button" onClick={publish} disabled={busy !== null}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:brightness-110 disabled:opacity-50">
        {busy === "publish" ? "Publishing…" : "Publish"}
      </button>

      <span aria-live="polite" className="w-full text-right font-mono text-[11px] text-zinc-500 sm:w-auto">{status}</span>
    </header>
  );
}
