import { data } from "@/lib/data";
import type { Settings } from "@/sections/types";

export function Footer({ s }: { s: Settings }) {
  // A social link is only rendered when it has a real destination.
  const links = [
    { label: "GitHub", href: data.profile.github },
    { label: "LinkedIn", href: data.profile.linkedin },
    { label: "Email", href: data.profile.email ? `mailto:${data.profile.email}` : "" },
  ].filter((l) => l.href);

  return (
    <footer className="border-t border-line">
      <div className="wrap flex flex-wrap items-center justify-between gap-3.5 py-[26px]">
        <small className="font-mono text-[11px] tracking-[0.03em] text-mut">{String(s.text)}</small>
        {s.social && links.length ? (
          <span className="flex gap-4">
            {links.map((l) => (
              <a key={l.label} href={l.href} className="text-[13px] text-mut no-underline hover:text-ink">{l.label}</a>
            ))}
          </span>
        ) : null}
      </div>
    </footer>
  );
}
