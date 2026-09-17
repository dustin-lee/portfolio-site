"use client";
import { sanitizeCss } from "@/lib/theme";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  max?: number;
}

/**
 * A raw CSS editor. Intentionally plain — a real syntax-highlighting editor
 * would pull a code-editor bundle into the studio for very little gain.
 */
export function CssBox({ id, label, value, onChange, placeholder, hint, max = 8_000 }: Props) {
  const stripped = sanitizeCss(value, max) !== value.trim();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[11.5px] font-semibold text-zinc-600 dark:text-zinc-400">
          {label}
        </label>
        <span className="font-mono text-[10px] tabular-nums text-zinc-400">
          {value.length}/{max}
        </span>
      </div>
      <textarea
        id={id}
        rows={6}
        value={value}
        spellCheck={false}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        className="w-full resize-y rounded-md border border-zinc-300 bg-white px-2.5 py-2 font-mono text-[11.5px] leading-relaxed text-zinc-900 outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      {hint ? <span className="text-[11px] leading-relaxed text-zinc-500">{hint}</span> : null}
      {stripped ? (
        <span className="text-[11px] text-amber-600">
          Some characters will be removed on save — <code className="font-mono">&lt;</code>,{" "}
          <code className="font-mono">@import</code> and <code className="font-mono">expression()</code> are not allowed.
        </span>
      ) : null}
    </div>
  );
}
