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

export function Projects({ s }: { s: Settings }) {
  const repos = data.repos.filter((r) => !r.hidden).slice(0, Number(s.count));
  return (
    <section id="work" className="border-b border-line">
      <div className="wrap pad" style={{ ["--pad" as string]: `${s.pad}px` }}>
        <div className="mb-[30px] flex flex-wrap items-baseline justify-between gap-3.5">
          <h2 className="h-sec">{String(s.title)}</h2>
          <span className="font-mono text-[11px] tracking-[0.05em] text-mut">
            {s.source === "Manual" ? "hand-written entries" : `github.com/${data.profile.username} · curated`}
          </span>
        </div>
        <div className={`grid gap-4 ${COLS[Number(s.cols)] ?? COLS[2]}`}>
          {repos.map((r) => (
            <a key={r.name} href={r.url}
               className="flex min-w-0 flex-col gap-2.5 rounded-xl border border-line bg-surf p-5 no-underline transition-colors hover:border-acc">
              <div className="flex items-center justify-between gap-2.5">
                <h3 className="truncate font-mono text-base font-bold tracking-[-0.01em]">{r.name}</h3>
                {s.stars ? (
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
