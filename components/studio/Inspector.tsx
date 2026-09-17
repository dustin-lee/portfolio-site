"use client";
import { useStore } from "zustand";
import { getDef } from "@/sections/registry";
import { Field } from "./Field";
import { CssBox } from "./CssBox";
import { ThemePanel } from "./ThemePanel";
import { THEME_PANEL, type StudioStore } from "./store";

export function Inspector({ store }: { store: StudioStore }) {
  const config = useStore(store, (s) => s.config);
  const selected = useStore(store, (s) => s.selected);
  const setSetting = useStore(store, (s) => s.setSetting);
  const setSectionCss = useStore(store, (s) => s.setSectionCss);

  if (selected === THEME_PANEL) return <ThemePanel store={store} />;

  const section = config.sections.find((s) => s.id === selected);
  if (!section) {
    return <p className="p-4 text-[13px] text-zinc-500">Select a section to edit it.</p>;
  }
  const def = getDef(section.type);
  if (!def) return <p className="p-4 text-[13px] text-zinc-500">Unknown section type.</p>;

  return (
    <div className="flex flex-col gap-3.5 overflow-y-auto p-3.5 pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-base font-bold tracking-[-0.01em]">{def.schema.name}</h2>
        {def.schema.blurb ? <p className="text-xs leading-snug text-zinc-500">{def.schema.blurb}</p> : null}
      </div>
      <hr className="border-zinc-200 dark:border-zinc-800" />
      {def.schema.settings.map((f) => (
        <Field
          key={f.key}
          id={`f-${section.id}-${f.key}`}
          field={f}
          value={section.settings[f.key] ?? f.default}
          onChange={(v) => setSetting(section.id, f.key, v)}
        />
      ))}
      <hr className="border-zinc-200 dark:border-zinc-800" />
      <CssBox
        id={`css-${section.id}`}
        label="Custom CSS (this section only)"
        value={section.css ?? ""}
        onChange={(v) => setSectionCss(section.id, v)}
        placeholder={`background: #101418;\n\nh2 { color: #F5A54A }\n.card { border-radius: 2px }`}
        hint="Scoped to this section. Declarations style the section wrapper; nested selectors style what is inside it."
      />
      <hr className="border-zinc-200 dark:border-zinc-800" />
      <p className="border-l-2 border-zinc-200 pl-2.5 text-[11.5px] leading-relaxed text-zinc-500 dark:border-zinc-800">
        These controls come from <code className="font-mono text-[10.5px]">sections/{section.type}/schema.ts</code>.
        Add a key there and it appears here, saves to the config and renders on the site.
      </p>
    </div>
  );
}
