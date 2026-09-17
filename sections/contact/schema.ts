import type { SectionSchema } from "@/sections/types";
export const schema: SectionSchema = {
  type: "contact", name: "Contact",
  blurb: "One ask, one button. Do not bury the email address.",
  settings: [
    { key: "layout",   label: "Layout", type: "select", options: ["Band", "Card"], default: "Band" },
    { key: "headline", label: "Headline", type: "textarea", default: "Hiring for something hard?" },
    { key: "sub",      label: "Supporting line", type: "textarea", default: "I read every message and reply within a day. Tell me what is breaking." },
    { key: "email",    label: "Email", type: "text", default: "hello@dustin.dev" },
    { key: "cta",      label: "Button label", type: "text", default: "Send a note" },
    { key: "pad",      label: "Vertical padding", type: "range", min: 40, max: 150, step: 5, unit: "px", default: 72 },
  ],
};
