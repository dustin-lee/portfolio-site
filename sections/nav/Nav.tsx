import { csv, type Settings } from "@/sections/types";

export function Nav({ s }: { s: Settings }) {
  const sticky = s.sticky ? "sticky top-0 z-20 backdrop-blur-md" : "";
  return (
    <header className={`${sticky} border-b border-line bg-bg/90`}>
      <div className="wrap flex flex-wrap items-center justify-between gap-4 py-4">
        <a href="/" className="font-display text-[17px] font-extrabold tracking-[-0.02em] no-underline">{String(s.logo)}</a>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-5">
          {csv(s.links).map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-mut no-underline hover:text-ink">{l}</a>
          ))}
          {s.cta ? <a href="/resume.pdf" className="pill-ghost">{String(s.cta)}</a> : null}
        </nav>
      </div>
    </header>
  );
}
