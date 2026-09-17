import { getPublishedConfig } from "@/lib/content";
import { getDef } from "@/sections/registry";

/** Fully static. No runtime database call, ever. */
export const dynamic = "force-static";
export const revalidate = false;

export default async function HomePage() {
  const config = await getPublishedConfig();
  const sections = config.sections.filter((s) => s.visible);
  const header = sections.filter((s) => getDef(s.type)?.schema.locked === "header");
  const footer = sections.filter((s) => getDef(s.type)?.schema.locked === "footer");
  const body = sections.filter((s) => !getDef(s.type)?.schema.locked);

  // Each section is wrapped so its own custom CSS has a stable scope to target.
  const render = (s: (typeof sections)[number]) => {
    const def = getDef(s.type);
    if (!def) return null;
    const { Component } = def;
    return (
      <div key={s.id} data-sid={s.id} data-section={s.type}>
        <Component s={s.settings} />
      </div>
    );
  };

  return (
    <>
      {header.map(render)}
      <main id="main">{body.map(render)}</main>
      {footer.map(render)}
    </>
  );
}
