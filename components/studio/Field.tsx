"use client";
import type { FieldDef } from "@/sections/types";

interface Props {
  field: FieldDef;
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
  id: string;
}

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-[13px] text-zinc-900 outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const labelCls = "text-[11.5px] font-semibold text-zinc-600 dark:text-zinc-400";

export function Field({ field, value, onChange, id }: Props) {
  if (field.type === "toggle") {
    const on = Boolean(value);
    return (
      <div className="flex items-center justify-between gap-2.5 py-0.5">
        <span className="text-[12.5px] font-medium text-zinc-600 dark:text-zinc-400">{field.label}</span>
        <button
          type="button" id={id} role="switch" aria-checked={on} aria-label={field.label}
          onClick={() => onChange(!on)}
          className={`relative h-[19px] w-[34px] flex-none rounded-full transition-colors ${on ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
        >
          <span className={`absolute top-[2px] left-[2px] h-[15px] w-[15px] rounded-full bg-white shadow transition-transform ${on ? "translate-x-[15px]" : ""}`} />
        </button>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-1.5">
        <span className={labelCls}>{field.label}</span>
        <div role="group" aria-label={field.label} className="flex flex-wrap gap-1.5">
          {field.options.map((o) => (
            <button
              key={o} type="button" aria-pressed={String(value) === o} onClick={() => onChange(o)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                String(value) === o
                  ? "border-blue-600 bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "border-zinc-300 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "range") {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className={labelCls}>{field.label}</label>
        <div className="flex items-center gap-2.5">
          <input
            id={id} type="range" min={field.min} max={field.max} step={field.step}
            value={Number(value)} onChange={(e) => onChange(Number(e.target.value))}
            className="min-w-0 flex-1 accent-blue-600"
          />
          <span className="min-w-9 text-right font-mono text-[11px] tabular-nums text-zinc-500">
            {Number(value)}{field.unit ?? ""}
          </span>
        </div>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className={labelCls}>{field.label}</label>
        <textarea id={id} rows={3} value={String(value)} onChange={(e) => onChange(e.target.value)} className={`${inputCls} min-h-[58px] resize-y leading-relaxed`} />
        {field.hint ? <span className="text-[11px] text-zinc-500">{field.hint}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelCls}>{field.label}</label>
      <input id={id} type="text" value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      {field.hint ? <span className="text-[11px] text-zinc-500">{field.hint}</span> : null}
    </div>
  );
}
