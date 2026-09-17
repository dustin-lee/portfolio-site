import type { SectionSchema } from "@/sections/types";
export const schema: SectionSchema = {
  type: "github", name: "GitHub activity",
  blurb: "Aggregate numbers from the GitHub API, snapshotted at build time.",
  settings: [
    { key: "title",   label: "Heading", type: "text", default: "What the commit history says" },
    { key: "metrics", label: "Show headline numbers", type: "toggle", default: true },
    { key: "langs",   label: "Show language split", type: "toggle", default: true },
    { key: "heat",    label: "Show contribution strip", type: "toggle", default: true },
    { key: "pad",     label: "Vertical padding", type: "range", min: 40, max: 150, step: 5, unit: "px", default: 80 },
  ],
};
