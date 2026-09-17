import { data } from "@/lib/data";
import type { Settings } from "@/sections/types";

export function GitHubActivity({ s }: { s: Settings }) {
  const { stats, languages, contributions } = data;
  return (
    <section id="activity" className="border-b border-line">
      <div className="wrap pad" style={{ ["--pad" as string]: `${s.pad}px` }}>
        <div className="mb-[30px] flex flex-wrap items-baseline justify-between gap-3.5">
          <h2 className="h-sec">{String(s.title)}</h2>
          <span className="font-mono text-[11px] tracking-[0.05em] text-mut">snapshot · rebuilt nightly</span>
        </div>

        {s.metrics ? (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
            {([
              [stats.commits, "Commits · 12 mo"],
              [stats.repos, "Public repos"],
              [stats.stars, "Stars"],
              [stats.prs, "PRs merged"],
            ] as [number | null, string][])
              // Omit anything unverified, and anything at zero: a row of noughts
              // is worse than no row at all.
              .filter(([v]) => typeof v === "number" && v > 0)
              .map(([v, l]) => [(v as number).toLocaleString(), l])
              .map(([v, l]) => (
              <div key={l} className="flex flex-col gap-1 bg-surf px-5 py-[18px]">
                <b className="font-display text-[27px] font-bold leading-none tabular-nums">{v}</b>
                <small className="font-mono text-[10px] uppercase tracking-[0.1em] text-mut">{l}</small>
              </div>
            ))}
          </div>
        ) : null}

        {s.langs ? (
          <>
            <div role="img" aria-label={`Language split: ${languages.map((l) => `${l.name} ${l.pct}%`).join(", ")}`}
                 className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-soft">
              {languages.map((l) => <i key={l.name} className="block h-full" style={{ width: `${l.pct}%`, background: l.color }} />)}
            </div>
            <div className="mt-3 flex flex-wrap gap-[18px]">
              {languages.map((l) => (
                <span key={l.name} className="inline-flex items-center gap-1.5 font-mono text-xs text-mut">
                  <i className="block h-2 w-2 rounded-sm" style={{ background: l.color }} />{l.name} {l.pct}%
                </span>
              ))}
            </div>
          </>
        ) : null}

        {s.heat ? (
          <div role="img" aria-label="Contribution activity, last 13 weeks" className="mt-6 flex flex-wrap gap-[3px]">
            {contributions.map((v, i) => (
              <i key={i} className="block h-[11px] w-[11px] rounded-sm bg-soft"
                 style={v > 0 ? { background: "var(--p-acc)", opacity: v } : undefined} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
