import { csv, type Settings } from "@/sections/types";

function parse(groups: unknown) {
  return String(groups ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const i = l.indexOf(":");
    return i < 0 ? { name: l, items: [] as string[] } : { name: l.slice(0, i), items: csv(l.slice(i + 1)) };
  });
}

export function Skills({ s }: { s: Settings }) {
  const groups = parse(s.groups);
  return (
    <section id="skills" className="border-b border-line">
      <div className="wrap pad" style={{ ["--pad" as string]: `${s.pad}px` }}>
        <h2 className="h-sec mb-[30px]">{String(s.title)}</h2>
        <div className="grid gap-[26px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {groups.map((g, gi) => (
            <div key={g.name}>
              <h3 className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.11em] text-mut">{g.name}</h3>
              {s.style === "Bars" ? (
                <div className="flex flex-col gap-2.5">
                  {g.items.map((it, i) => {
                    const p = Math.max(40, 92 - i * 7 - gi * 3);
                    return (
                      <div key={it}>
                        <div className="flex items-baseline justify-between gap-2.5">
                          <span className="text-[13px]">{it}</span>
                          <em className="font-mono text-[11px] not-italic tabular-nums text-mut">{p}</em>
                        </div>
                        <span className="mt-1 block h-1 rounded-full bg-soft">
                          <b className="block h-full rounded-full bg-acc" style={{ width: `${p}%` }} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((it) => <span key={it} className="tag">{it}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
