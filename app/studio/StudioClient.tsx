"use client";
import { useRef, useState } from "react";
import { useStore } from "zustand";
import { createStudioStore } from "@/components/studio/store";
import { SectionList } from "@/components/studio/SectionList";
import { Inspector } from "@/components/studio/Inspector";
import { Toolbar } from "@/components/studio/Toolbar";
import { getDef } from "@/sections/registry";
import { ThemeStyle } from "@/components/ThemeStyle";
import type { SiteConfig } from "@/sections/types";

const WIDTH = { desktop: "100%", tablet: "834px", mobile: "392px" } as const;

export function StudioClient({ initial }: { initial: SiteConfig }) {
  const storeRef = useRef(createStudioStore(initial));
  const store = storeRef.current;
  const config = useStore(store, (s) => s.config);
  const device = useStore(store, (s) => s.device);
  const [pane, setPane] = useState<"sections" | "canvas" | "settings">("canvas");

  const visible = config.sections.filter((s) => s.visible);

  // Identical wrapper to the public page, so per-section CSS resolves the same way here.
  const render = (s: (typeof visible)[number]) => {
    const def = getDef(s.type);
    if (!def) return null;
    const { Component } = def;
    return (
      <div key={s.id} data-sid={s.id} data-section={s.type}>
        <Component s={s.settings} />
      </div>
    );
  };

  const show = (p: typeof pane) => (pane === p ? "flex" : "hidden") + " lg:flex";

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar store={store} />

      <nav className="sticky top-[53px] z-30 flex border-b border-zinc-200 bg-white lg:hidden dark:border-zinc-800 dark:bg-zinc-950" role="group" aria-label="Editor panes">
        {(["sections", "canvas", "settings"] as const).map((p) => (
          <button key={p} type="button" onClick={() => setPane(p)} aria-pressed={pane === p}
                  className={`flex-1 border-b-2 py-2.5 text-[12.5px] font-medium capitalize ${
                    pane === p ? "border-blue-600 text-blue-700" : "border-transparent text-zinc-500"
                  }`}>
            {p === "canvas" ? "Preview" : p}
          </button>
        ))}
      </nav>

      <main className="grid flex-1 grid-cols-1 lg:grid-cols-[274px_minmax(0,1fr)_304px]">
        <aside className={`${show("sections")} flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950`}>
          <SectionList store={store} />
        </aside>

        <div className={`${pane === "canvas" ? "block" : "hidden"} lg:block bg-zinc-100 p-4 pb-14 dark:bg-zinc-900`}>
          <div className="mx-auto mb-2.5 flex max-w-[1180px] flex-wrap items-center justify-between gap-2">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11.5px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              Live preview — changes are not public until you press Publish
            </span>
            <span className="font-mono text-[10.5px] tracking-[0.04em] text-zinc-400">{device} · {WIDTH[device]}</span>
          </div>
          <div
            data-theme={config.theme}
            style={{ maxWidth: WIDTH[device] }}
            className="mx-auto overflow-hidden rounded-xl border border-zinc-200 bg-bg shadow-sm transition-[max-width] dark:border-zinc-800"
          >
            <ThemeStyle config={config} />
            {visible.map(render)}
          </div>
        </div>

        <aside className={`${show("settings")} flex-col border-l border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950`}>
          <Inspector store={store} />
        </aside>
      </main>
    </div>
  );
}
