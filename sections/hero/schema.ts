import type { SectionSchema } from "@/sections/types";
export const schema: SectionSchema = {
  type: "hero", name: "Hero",
  blurb: "The first ten seconds. Name, what you do, one proof point.",
  settings: [
    { key: "layout",   label: "Layout", type: "select", options: ["Split", "Centered", "Stacked left"], default: "Split" },
    { key: "eyebrow",  label: "Eyebrow", type: "text", default: "Available for senior roles" },
    { key: "headline", label: "Headline", type: "textarea", default: "I build the boring infrastructure that makes products feel fast." },
    { key: "sub",      label: "Subhead", type: "textarea", default: "Full-stack engineer working across TypeScript, Go and Postgres. Most of what I ship is measured in milliseconds saved and pages that stop breaking." },
    { key: "cta",      label: "Primary button", type: "text", default: "See the work" },
    { key: "cta2",     label: "Secondary button", type: "text", default: "GitHub" },
    { key: "portrait", label: "Show portrait", type: "toggle", default: true },
    { key: "stats",    label: "Show quick stats", type: "toggle", default: true },
    { key: "pad",      label: "Vertical padding", type: "range", min: 40, max: 150, step: 5, unit: "px", default: 104 },
  ],
};
