import { data } from "@/lib/data";
import type { Settings } from "@/sections/types";

export function Writing({ s }: { s: Settings }) {
  return (
    <section id="writing" className="border-b border-line">
      <div className="wrap pad" style={{ ["--pad" as string]: `${s.pad}px` }}>
        <h2 className="h-sec mb-[30px]">{String(s.title)}</h2>
        <div>
          {data.posts.slice(0, Number(s.count)).map((p, i) => (
            <a key={p.url} href={p.url}
               className={`flex items-baseline justify-between gap-4 border-line py-3.5 no-underline ${i === 0 ? "border-t-0 pt-0" : "border-t"}`}>
              <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em]">{p.title}</h3>
              <time dateTime={p.date} className="flex-none font-mono text-[11px] text-mut">{p.date}</time>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
