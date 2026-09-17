import type { SectionSchema } from "@/sections/types";
export const schema: SectionSchema = {
  type: "stack", name: "Tech strip",
  blurb: "A running band of the tools you actually reach for.",
  settings: [
    { key: "style", label: "Style", type: "select", options: ["Marquee", "Static grid"], default: "Marquee" },
    { key: "items", label: "Items", type: "textarea", hint: "Comma separated",
      default: "TypeScript, React, Next.js, Tailwind, Node, Go, PostgreSQL, Redis, Docker, GitHub Actions, Playwright, Terraform" },
    { key: "speed", label: "Scroll speed", type: "range", min: 16, max: 70, step: 2, unit: "s", default: 34 },
  ],
};
