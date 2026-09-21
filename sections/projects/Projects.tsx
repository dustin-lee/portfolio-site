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

interface CardData {
  key: string;
  title: string;
  description: string;
  language?: string | null;
  color?: string;
  chips: string[];
  corner: React.ReactNode;
  href?: string;
}

/** The original repo card. Manual entries render through it too, so both look identical. */
function Card({ c }: { c: CardData }) {
  const cls = "flex min-w-0 flex-col gap-2.5 rounded-xl border border-line bg-surf p-5 no-underline";
  const body = (
    <>
      <div className="flex items-center justify-between gap-2.5">
        <h3 className="truncate font-mono text-base font-bold tracking-[-0.01em]">{c.title}</h3>
        {c.corner}
      </div>
      <p className="text-sm leading-relaxed text-mut">{c.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-1">
        {c.language ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-mut">
            <i className="block h-2 w-2 rounded-full" style={{ background: c.color }} />{c.language}
          </span>
        ) : null}
        {c.chips.length ? (
          <span className="flex flex-wrap gap-1.5">
            {c.chips.map((t) => (
              <span key={t} className="rounded bg-soft px-[7px] py-0.5 font-mono text-[11px] text-mut">{t}</span>
            ))}
          </span>
        ) : null}
      </div>
    </>
  );
  // A card only becomes a link when a visitor can actually open the destination.
  return c.href ? (
    <a href={c.href} className={`${cls} transition-colors hover:border-acc`}>{body}</a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Projects({ s }: { s: Settings }) {
  const manual = s.source === "Manual";
  const count = Number(s.count);

  const cards: CardData[] = manual
    ? data.manualProjects.slice(0, count).map((p) => ({
        key: p.title,
        title: p.title,
        description: p.summary,
        language: p.language,
        color: p.color,
        chips: s.topics ? p.tech.slice(0, 4) : [],
        corner: p.url ? null : (
          <span className="flex-none font-mono text-[11px] uppercase tracking-[0.06em] text-mut">Private</span>
        ),
        href: p.url,
      }))
    : data.repos.filter((r) => !r.hidden).slice(0, count).map((r) => ({
        key: r.name,
        title: r.name,
        description: r.description,
        language: r.language,
        color: r.color,
        chips: s.topics ? r.topics.slice(0, 3) : [],
        corner: s.stars && r.stars > 0 ? (
          <span className="inline-flex flex-none items-center gap-1 font-mono text-xs tabular-nums text-mut"><Star />{r.stars}</span>
        ) : null,
        href: r.url,
      }));

  const meta = manual
    ? `${cards.length} private ${cards.length === 1 ? "repository" : "repositories"} · solo builds`
    : `github.com/${data.profile.username} · curated`;

  return (
    <section id="work" className="border-b border-line">
      <div className="wrap pad" style={{ ["--pad" as string]: `${s.pad}px` }}>
        <div className="mb-[30px] flex flex-wrap items-baseline justify-between gap-3.5">
          <h2 className="h-sec">{String(s.title)}</h2>
          <span className="font-mono text-[11px] tracking-[0.05em] text-mut">{meta}</span>
        </div>
        <div className={`grid gap-4 ${COLS[Number(s.cols)] ?? COLS[2]}`}>
          {cards.map((c) => <Card key={c.key} c={c} />)}
        </div>
      </div>
    </section>
  );
}
