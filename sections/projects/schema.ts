import type { SectionSchema } from "@/sections/types";
export const schema: SectionSchema = {
  type: "projects", name: "Featured work",
  blurb: "Curated repos. Order, count and metadata come from the nightly GitHub sync.",
  settings: [
    { key: "title",  label: "Heading", type: "text", default: "Selected work" },
    { key: "source", label: "Source", type: "select", options: ["GitHub · curated", "Manual"], default: "GitHub · curated" },
    { key: "cols",   label: "Columns", type: "range", min: 1, max: 3, step: 1, default: 2 },
    { key: "count",  label: "Projects shown", type: "range", min: 2, max: 6, step: 1, default: 4 },
    { key: "stars",  label: "Show star counts", type: "toggle", default: true },
    { key: "topics", label: "Show topic tags", type: "toggle", default: true },
    { key: "pad",    label: "Vertical padding", type: "range", min: 40, max: 150, step: 5, unit: "px", default: 90 },
  ],
};
