/**
 * CI guard: the editor must never leak into the public site bundle.
 * Fails the build if a public route imports editor-only packages.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN = ["@dnd-kit", "zustand", "components/studio"];
const ROOTS = ["app/(site)"];

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const offenders = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (!/\.(tsx?|jsx?)$/.test(file)) continue;
    const src = readFileSync(file, "utf8");
    for (const bad of FORBIDDEN) {
      if (src.includes(bad)) offenders.push(`${file} imports ${bad}`);
    }
  }
}

if (offenders.length) {
  console.error("Public bundle guard failed:\n" + offenders.map((o) => `  - ${o}`).join("\n"));
  process.exit(1);
}
console.log("Public bundle guard passed — no editor code under app/(site).");
