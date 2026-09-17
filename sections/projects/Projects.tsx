import { data } from "@/lib/data";
import type { Settings } from "@/sections/types";

const Star = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-3 w-3">
    <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6Z" />
  </svg>
);

const COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
};

const CARD =
  "flex min-w-0 flex-col gap-2.5 rounded-xl border border-line bg-surf p-5 no-underline";

export function Projects({ s }: { s: Settings }) {
  const manual = s.source === "Manual";
  const count = Number(s.count);

  /* ---- manual entries: work that has no public repo to point at ---- */
  if (manual) {
    const items = data.manualProjects.slice(0, count);
    return (
      <section id="work" className="border-b border-line">
        <div className="wrap pad" style={{ ["--pad" as string]: `${s.pad}px` }}>
          <h2 className="h-sec mb-[30px]">{String(s.title)}</h2>
          <div className={`grid gap-4 ${COLS[Number(s.cols)] ?? COLS[2]}`}>
            {items.map((p) => {
              const Inner = (
                <>
                  <div className="flex items-start justify-between gap-2.5">
                    <h3 className="font-display text-[17px] font-bold tracking-[-0.02em]">{p.title}</h3>
                    {p.url ? null : (
                      <span className="flex-none rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-mut">
                        Private
                      </span>
                    )}
                  </div>
                  {p.role ? <p className="text-[13px] font-semibold text-acc">{p.role}</p> : null}
                  <p className="text-sm leading-relaxed text-mut">{p.summary}</p>
                  {p.tech.length ? (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                      {p.tech.map((t) => (
                        <span key={t} className="rounded bg-soft px-[7px] py-0.5 font-mono text-[11px] text-mut">{t}</span>
                      ))}
                    </div>
                  ) : null}
                </>
              );
              // Only a linkable project becomes a link. A private one is a plain
              // card, because a link a visitor cannot open is worse than no link.
              return p.url ? (
                <a key={p.title} href={p.url} className={`${CARD} transition-colors hover:border-acc`}>{Inner}</a>
              ) : (
                <div key={p.title} className={CARD}>{Inner}</div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  /* ---- repos pulled from GitHub at build time ---- */
  const repos = data.repos.filter((r) => !r.hidden).slice(0, count);
  return (
    <section id="work" className="border-b border-line">
      <div className="wrap pad" style={{ ["--pad" as string]: `${s.pad}px` }}>
        <div className="mb-[30px] flex flex-wrap items-baseline justify-between gap-3.5">
          <h2 className="h-sec">{String(s.title)}</h2>
          <span className="font-mono text-[11px] tracking-[0.05em] text-mut">
            github.com/{data.profile.username} · curated
          </span>
        </div>
        <div className={`grid gap-4 ${COLS[Number(s.cols)] ?? COLS[2]}`}>
          {repos.map((r) => (
            <a key={r.name} href={r.url} className={`${CARD} transition-colors hover:border-acc`}>
              <div className="flex items-center justify-between gap-2.5">
                <h3 className="truncate font-mono text-base font-bold tracking-[-0.01em]">{r.name}</h3>
                {s.stars && r.stars > 0 ? (
                  <span className="inline-flex flex-none items-center gap-1 font-mono text-xs tabular-nums text-mut">
                    <Star />{r.stars}
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-relaxed text-mut">{r.description}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-1">
                {r.language ? (
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-mut">
                    <i className="block h-2 w-2 rounded-full" style={{ background: r.color }} />{r.language}
                  </span>
                ) : null}
                {s.topics ? (
                  <span className="flex flex-wrap gap-1.5">
                    {r.topics.slice(0, 3).map((t) => (
                      <span key={t} className="rounded bg-soft px-[7px] py-0.5 font-mono text-[11px] text-mut">{t}</span>
                    ))}
                  </span>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
