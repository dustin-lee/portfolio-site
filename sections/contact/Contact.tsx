import type { Settings } from "@/sections/types";

export function Contact({ s }: { s: Settings }) {
  const band = s.layout === "Band";
  return (
    <section id="contact" data-invert={band ? "" : undefined}
             className={band ? "bg-acc text-accink" : "border-b border-line"}>
      <div className="wrap pad" style={{ ["--pad" as string]: `${s.pad}px` }}>
        <div className={band ? "flex flex-col items-start gap-4" : "flex flex-col items-start gap-4 rounded-2xl border border-line bg-surf p-8"}>
          <h2 className="font-display text-[clamp(25px,4vw,36px)] font-extrabold tracking-[-0.02em] text-balance">
            {String(s.headline)}
          </h2>
          <p className={`max-w-[50ch] text-[15.5px] leading-relaxed ${band ? "opacity-90" : "text-mut"}`}>{String(s.sub)}</p>
          <a href={`mailto:${s.email}`} className={band ? "inline-flex items-center rounded-full bg-accink px-[18px] py-[9px] text-sm font-semibold text-acc no-underline" : "pill"}>
            {String(s.cta)}
          </a>
          <span className={`font-mono text-[13px] ${band ? "opacity-80" : "text-mut"}`}>{String(s.email)}</span>
        </div>
      </div>
    </section>
  );
}
