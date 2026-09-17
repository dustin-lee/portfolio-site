import type { SectionDef } from "@/sections/types";

import { schema as navSchema } from "./nav/schema";
import { Nav } from "./nav/Nav";
import { schema as heroSchema } from "./hero/schema";
import { Hero } from "./hero/Hero";
import { schema as stackSchema } from "./stack/schema";
import { Stack } from "./stack/Stack";
import { schema as projectsSchema } from "./projects/schema";
import { Projects } from "./projects/Projects";
import { schema as githubSchema } from "./github/schema";
import { GitHubActivity } from "./github/GitHubActivity";
import { schema as skillsSchema } from "./skills/schema";
import { Skills } from "./skills/Skills";
import { schema as experienceSchema } from "./experience/schema";
import { Experience } from "./experience/Experience";
import { schema as writingSchema } from "./writing/schema";
import { Writing } from "./writing/Writing";
import { schema as contactSchema } from "./contact/schema";
import { Contact } from "./contact/Contact";
import { schema as footerSchema } from "./footer/schema";
import { Footer } from "./footer/Footer";

/**
 * The whole editor is generated from this map.
 * To add a section type: create sections/<name>/{schema.ts,Component.tsx}
 * and add one line here. Nothing else changes.
 */
export const REGISTRY: Record<string, SectionDef> = {
  nav:        { schema: navSchema,        Component: Nav },
  hero:       { schema: heroSchema,       Component: Hero },
  stack:      { schema: stackSchema,      Component: Stack },
  projects:   { schema: projectsSchema,   Component: Projects },
  github:     { schema: githubSchema,     Component: GitHubActivity },
  skills:     { schema: skillsSchema,     Component: Skills },
  experience: { schema: experienceSchema, Component: Experience },
  writing:    { schema: writingSchema,    Component: Writing },
  contact:    { schema: contactSchema,    Component: Contact },
  footer:     { schema: footerSchema,     Component: Footer },
};

export const SECTION_TYPES = Object.keys(REGISTRY);
export const getDef = (type: string): SectionDef | undefined => REGISTRY[type];
