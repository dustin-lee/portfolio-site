import { csv, type Settings } from "@/sections/types";

export function Stack({ s }: { s: Settings }) {
  const items = csv(s.items);
  if (s.style === "Static grid") {
    return (
      <section className="border-b border-line bg-soft" aria-label="Tools">
        <div className="wrap flex flex-wrap gap-[7px] py-5">
          {items.map((i) => <span key={i} className="tag">{i}</span>)}
        </div>
      </section>
    );
  }
  return (
    <section className="overflow-hidden border-b border-line bg-soft" aria-label="Tools">
      <div className="marquee" style={{ ["--dur" as string]: `${s.speed}s` }}>
        {[...items, ...items].map((i, n) => (
          <span key={`${i}-${n}`} className="inline-flex items-center py-3.5 font-mono text-xs uppercase tracking-[0.08em] text-mut">
            {i}
            <i className="mx-6 block h-1 w-1 rounded-full bg-acc opacity-60" />
          </span>
        ))}
      </div>
    </section>
  );
}
