import type { SectionSchema } from "@/sections/types";
export const schema: SectionSchema = {
  type: "writing", name: "Writing",
  blurb: "Posts or notes. Optional — only turn it on if you actually write.",
  settings: [
    { key: "title", label: "Heading", type: "text", default: "Writing" },
    { key: "count", label: "Posts shown", type: "range", min: 1, max: 6, step: 1, default: 3 },
    { key: "pad",   label: "Vertical padding", type: "range", min: 40, max: 150, step: 5, unit: "px", default: 80 },
  ],
};
