import type { SectionSchema } from "@/sections/types";
export const schema: SectionSchema = {
  type: "nav", name: "Navigation", locked: "header",
  blurb: "Pinned to the top of every page. Editable, but not reorderable or removable.",
  settings: [
    { key: "logo",   label: "Wordmark",   type: "text", default: "Dustin Lee" },
    { key: "links",  label: "Links",      type: "text", default: "Work, Activity, Skills, Experience", hint: "Comma separated" },
    { key: "cta",    label: "Button label", type: "text", default: "Résumé" },
    { key: "sticky", label: "Stick to top on scroll", type: "toggle", default: true },
  ],
};
