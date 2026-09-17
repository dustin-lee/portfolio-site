import type { SectionSchema } from "@/sections/types";
export const schema: SectionSchema = {
  type: "experience", name: "Experience",
  blurb: "Roles in reverse order, each with one measurable outcome.",
  settings: [
    { key: "title",   label: "Heading", type: "text", default: "Experience" },
    { key: "density", label: "Density", type: "select", options: ["Compact", "Comfortable"], default: "Comfortable" },
    { key: "pad",     label: "Vertical padding", type: "range", min: 40, max: 150, step: 5, unit: "px", default: 80 },
  ],
};
