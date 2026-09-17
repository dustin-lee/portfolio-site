import { data } from "@/lib/data";
import type { Settings } from "@/sections/types";

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="border-t border-line">
      <div className="wrap flex flex-wrap items-center justify-between gap-3.5 py-[26px]">
        <small className="font-mono text-[11px] tracking-[0.03em] text-mut">{String(s.text)}</small>
        {s.social ? (
          <span className="flex gap-4">
            <a href={data.profile.github} className="text-[13px] text-mut no-underline hover:text-ink">GitHub</a>
            <a href={data.profile.linkedin} className="text-[13px] text-mut no-underline hover:text-ink">LinkedIn</a>
            <a href={`mailto:${data.profile.email}`} className="text-[13px] text-mut no-underline hover:text-ink">Email</a>
          </span>
        ) : null}
      </div>
    </footer>
  );
}
