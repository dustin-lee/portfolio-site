import { data } from "@/lib/data";
import type { Settings } from "@/sections/types";

export function Experience({ s }: { s: Settings }) {
  const pb = s.density === "Compact" ? "py-3.5" : "py-6";
  return (
    <section id="experience" className="border-b border-line">
      <div className="wrap pad" style={{ ["--pad" as string]: `${s.pad}px` }}>
        <h2 className="h-sec mb-[30px]">{String(s.title)}</h2>
        <div>
          {data.roles.map((r, i) => (
            <div key={r.org + r.when}
                 className={`grid gap-1.5 border-line sm:grid-cols-[130px_1fr] sm:gap-[22px] ${pb} ${i === 0 ? "border-t-0 pt-0" : "border-t"}`}>
              <div className="pt-1 font-mono text-xs tracking-[0.03em] text-mut">{r.when}</div>
              <div>
                <h3 className="mb-[3px] font-display text-[17px] font-bold tracking-[-0.02em]">{r.org}</h3>
                <div className="mb-2 text-[13px] font-semibold text-acc">{r.role}</div>
                <p className="text-sm leading-relaxed text-mut">{r.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
