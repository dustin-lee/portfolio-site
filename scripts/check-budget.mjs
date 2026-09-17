/**
 * Two guarantees for the public home page, checked against the real emitted build:
 *
 *   1. No editor code is reachable from it (scans chunk CONTENTS, not filenames).
 *   2. Its total JavaScript stays inside the budget.
 *
 * ~168 kB is Next 16's App Router baseline (React runtime + router) for a page
 * with zero client components. The budget is set just above it so that any real
 * regression — a stray "use client", dnd-kit leaking in — fails the build.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_KB = Number(process.env.JS_BUDGET_KB ?? 185);
const EDITOR_MARKERS = ["dnd-kit", "useSortable", "zustand", "createStudioStore", "SectionList"];
const html = join(".next", "server", "app", "index.html");

if (!existsSync(html)) {
  console.log("No prerendered home page found — run `npm run build` first. Skipping.");
  process.exit(0);
}

const refs = [
  ...new Set(
    [...readFileSync(html, "utf8").matchAll(/\/_next\/(static\/[^"'\\\s>]+?\.js)/g)].map((m) => m[1]),
  ),
].sort();

let bytes = 0;
const leaks = [];
for (const rel of refs) {
  const p = join(".next", rel);
  if (!existsSync(p)) continue;
  const buf = readFileSync(p);
  bytes += gzipSync(buf).length;
  const text = buf.toString("utf8");
  const hits = EDITOR_MARKERS.filter((m) => text.includes(m));
  if (hits.length) leaks.push(`${rel} contains ${hits.join(", ")}`);
}

const kb = bytes / 1024;
console.log(`Home page JS: ${kb.toFixed(1)} kB gzipped across ${refs.length} chunk(s) — budget ${BUDGET_KB} kB`);

if (leaks.length) {
  console.error("Editor code leaked into the public bundle:\n" + leaks.map((l) => `  - ${l}`).join("\n"));
  process.exit(1);
}
if (kb > BUDGET_KB) {
  console.error(`Over budget by ${(kb - BUDGET_KB).toFixed(1)} kB.`);
  process.exit(1);
}
console.log("No editor code in the public bundle.");
