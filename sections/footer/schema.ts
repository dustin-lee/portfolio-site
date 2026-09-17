import type { SectionSchema } from "@/sections/types";
export const schema: SectionSchema = {
  type: "footer", name: "Footer", locked: "footer",
  blurb: "Pinned to the bottom of every page.",
  settings: [
    { key: "text",   label: "Left text", type: "text", default: "© 2026 Dustin Lee — built with React, deployed on Netlify" },
    { key: "social", label: "Show social links", type: "toggle", default: true },
  ],
};
