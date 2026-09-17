"use client";
import {
  DndContext, PointerSensor, KeyboardSensor, closestCenter,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "zustand";
import { getDef, SECTION_TYPES, REGISTRY } from "@/sections/registry";
import { THEME_PANEL, type StudioStore } from "./store";
import type { SectionInstance } from "@/sections/types";

const Eye = ({ off }: { off?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
    {off
      ? <><path d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2" strokeLinecap="round" /><path d="M6.9 6.9C4.2 8.5 2 12 2 12s3.6 7 10 7c2 0 3.7-.7 5.1-1.6M19.5 8.6C21.1 10.2 22 12 22 12" strokeLinecap="round" /></>
      : <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>}
  </svg>
);
const Trash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-3.5 w-3.5">
    <path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13" />
  </svg>
);
const Grip = () => (
  <svg viewBox="0 0 10 16" fill="currentColor" className="h-3.5 w-2.5">
    {[2.5, 8, 13.5].flatMap((y) => [<circle key={`a${y}`} cx="2.5" cy={y} r="1.3" />, <circle key={`b${y}`} cx="7.5" cy={y} r="1.3" />])}
  </svg>
);

const rowBase =
  "group relative flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors";

function Row({ section, store, sortable }: { section: SectionInstance; store: StudioStore; sortable: boolean }) {
  const selected = useStore(store, (s) => s.selected);
  const select = useStore(store, (s) => s.select);
  const toggleVisible = useStore(store, (s) => s.toggleVisible);
  const remove = useStore(store, (s) => s.remove);
  const def = getDef(section.type);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id, disabled: !sortable,
  });

  const isSel = selected === section.id;
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={`${rowBase} ${
        isSel
          ? "border-blue-600 bg-white shadow-[inset_2px_0_0_var(--color-blue-600)] dark:bg-zinc-900"
          : "border-transparent hover:border-zinc-200 hover:bg-white dark:hover:border-zinc-800 dark:hover:bg-zinc-900"
      }`}
    >
      <button
        type="button"
        {...attributes} {...listeners}
        aria-label={sortable ? `Reorder ${def?.schema.name}` : `${def?.schema.name} is pinned`}
        disabled={!sortable}
        className={`flex-none text-zinc-400 ${sortable ? "cursor-grab active:cursor-grabbing" : "cursor-default opacity-40"}`}
      >
        <Grip />
      </button>

      <button type="button" onClick={() => select(section.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <span className={`truncate text-[13px] font-medium ${section.visible ? "" : "text-zinc-400 line-through"}`}>
          {def?.schema.name ?? section.type}
        </span>
      </button>

      <span className="flex flex-none items-center">
        <button type="button" onClick={() => toggleVisible(section.id)}
                aria-label={`${section.visible ? "Hide" : "Show"} ${def?.schema.name}`}
                className="rounded p-1 text-zinc-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950">
          <Eye off={!section.visible} />
        </button>
        {sortable ? (
          <button type="button" onClick={() => remove(section.id)}
                  aria-label={`Remove ${def?.schema.name}`}
                  className="rounded p-1 text-zinc-400 hover:text-red-600">
            <Trash />
          </button>
        ) : null}
      </span>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="px-1.5 pt-2.5 pb-1 font-mono text-[9.5px] uppercase tracking-[0.11em] text-zinc-400">{children}</div>
);

function ThemeRow({ store }: { store: StudioStore }) {
  const selected = useStore(store, (s) => s.selected);
  const select = useStore(store, (s) => s.select);
  const config = useStore(store, (s) => s.config);
  const active = selected === THEME_PANEL;
  const edits = config.themeOverrides?.[config.theme];
  const count =
    Object.keys(edits?.tokens ?? {}).length + Object.keys(edits?.elements ?? {}).length;

  return (
    <button
      type="button"
      onClick={() => select(THEME_PANEL)}
      className={`${rowBase} w-full text-left ${
        active
          ? "border-blue-600 bg-white shadow-[inset_2px_0_0_var(--color-blue-600)] dark:bg-zinc-900"
          : "border-transparent hover:border-zinc-200 hover:bg-white dark:hover:border-zinc-800 dark:hover:bg-zinc-900"
      }`}
    >
      <span className="flex-none text-zinc-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18 4.5 4.5 0 0 1 0-9 4.5 4.5 0 0 0 0-9Z" />
        </svg>
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium">Theme settings</span>
      {count > 0 || config.customCss ? (
        <span className="flex-none font-mono text-[9px] uppercase tracking-wider text-blue-700 dark:text-blue-300">
          edited
        </span>
      ) : null}
    </button>
  );
}

export function SectionList({ store }: { store: StudioStore }) {
  const config = useStore(store, (s) => s.config);
  const reorder = useStore(store, (s) => s.reorder);
  const add = useStore(store, (s) => s.add);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const header = config.sections.filter((s) => getDef(s.type)?.schema.locked === "header");
  const footer = config.sections.filter((s) => getDef(s.type)?.schema.locked === "footer");
  const body = config.sections.filter((s) => !getDef(s.type)?.schema.locked);
  const missing = SECTION_TYPES.filter((t) => !REGISTRY[t].schema.locked && !config.sections.some((s) => s.type === t));

  const onDragEnd = (e: DragEndEvent) => {
    if (e.over && e.active.id !== e.over.id) reorder(String(e.active.id), String(e.over.id));
  };

  return (
    <div className="flex flex-col gap-1 overflow-y-auto p-3 pb-8">
      <Label>Header</Label>
      {header.map((s) => <Row key={s.id} section={s} store={store} sortable={false} />)}

      <Label>Template — drag to reorder</Label>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
        <SortableContext items={body.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1">
            {body.map((s) => <Row key={s.id} section={s} store={store} sortable />)}
          </div>
        </SortableContext>
      </DndContext>

      {missing.length ? (
        <details className="mt-2">
          <summary className="cursor-pointer list-none rounded-lg border border-dashed border-zinc-300 py-2 text-center text-[12.5px] font-medium text-zinc-500 hover:border-blue-600 hover:text-blue-700 dark:border-zinc-700">
            + Add section
          </summary>
          <div className="flex flex-col gap-1 pt-2">
            {missing.map((t) => (
              <button key={t} type="button" onClick={() => add(t)}
                      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-left text-[12.5px] hover:border-blue-600 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-900">
                {REGISTRY[t].schema.name}
              </button>
            ))}
          </div>
        </details>
      ) : null}

      <Label>Footer</Label>
      {footer.map((s) => <Row key={s.id} section={s} store={store} sortable={false} />)}

      <Label>Theme</Label>
      <ThemeRow store={store} />
    </div>
  );
}
