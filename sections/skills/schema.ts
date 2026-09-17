import type { SectionSchema } from "@/sections/types";
export const schema: SectionSchema = {
  type: "skills", name: "Skills",
  blurb: "Grouped capabilities. Keep it honest and scannable.",
  settings: [
    { key: "title",  label: "Heading", type: "text", default: "Skills" },
    { key: "style",  label: "Style", type: "select", options: ["Chips", "Bars"], default: "Chips" },
    { key: "groups", label: "Groups", type: "textarea", hint: "One per line — Group: item, item, item",
      default: "Languages: TypeScript, Go, Python, SQL, Rust\nFrontend: React, Next.js, Tailwind, Vite, Testing Library\nBackend: Node, Postgres, Redis, gRPC, REST\nInfrastructure: Docker, GitHub Actions, Terraform, Netlify, Supabase" },
    { key: "pad",    label: "Vertical padding", type: "range", min: 40, max: 150, step: 5, unit: "px", default: 80 },
  ],
};
