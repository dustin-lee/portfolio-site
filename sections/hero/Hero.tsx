import { data } from "@/lib/data";
import type { Settings } from "@/sections/types";

export function Hero({ s }: { s: Settings }) {
  const split = s.layout === "Split";
  const centered = s.layout === "Centered";
  const grid = split
    ? "grid-cols-1 lg:grid-cols-[1.35fr_0.8fr]"
    : centered
      ? "grid-cols-1 max-w-[680px] mx-auto text-center justify-items-center"
      : "grid-cols-1 max-w-[760px]";
  return (
    <section className="border-b border-line">
      <div className={`wrap pad grid items-center gap-11 ${grid}`} style={{ ["--pad" as string]: `${s.pad}px` }}>
        <div className="flex min-w-0 flex-col gap-5">
          {s.eyebrow ? <span className="eyebrow">{String(s.eyebrow)}</span> : null}
          <h1 className="font-display text-[clamp(33px,5.6vw,56px)] font-extrabold leading-[1.03] tracking-[-0.02em] text-balance">
            {String(s.headline)}
          </h1>
          <p className="max-w-[52ch] text-[clamp(15px,1.5vw,17px)] leading-relaxed text-mut">{String(s.sub)}</p>
          <div className="flex flex-wrap gap-2.5">
            {s.cta ? <a href="#work" className="pill">{String(s.cta)}</a> : null}
            {s.cta2 ? <a href={data.profile.github} className="pill-ghost">{String(s.cta2)}</a> : null}
          </div>
          {s.stats ? (
            <div className="flex flex-wrap gap-[30px] pt-1.5">
              {[
                [String(data.stats.featured), "Featured repos"],
                [data.stats.stars.toLocaleString(), "Stars earned"],
                [data.stats.years, "Shipping"],
              ].map(([v, l]) => (
                <div key={l} className="flex flex-col gap-0.5">
                  <b className="font-display text-[23px] font-bold tabular-nums">{v}</b>
                  <small className="font-mono text-[10px] uppercase tracking-[0.11em] text-mut">{l}</small>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {s.portrait && split ? (
          <div
            className="grid aspect-[4/5] max-w-full place-items-center rounded-2xl border border-line bg-surf"
            style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--p-soft) 0 9px, transparent 9px 18px)" }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mut">Portrait</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
