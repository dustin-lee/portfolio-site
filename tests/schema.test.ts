import { describe, it, expect } from "vitest";
import { REGISTRY, SECTION_TYPES } from "@/sections/registry";
import { instantiate } from "@/sections/types";
import { parseConfig } from "@/lib/config-schema";
import { withDefaults } from "@/lib/content";
import snapshot from "@/content.snapshot.json";

describe("section registry", () => {
  it("every section's type matches its registry key", () => {
    for (const [key, def] of Object.entries(REGISTRY)) expect(def.schema.type).toBe(key);
  });

  it("every setting has a default of the right shape", () => {
    for (const def of Object.values(REGISTRY)) {
      for (const f of def.schema.settings) {
        if (f.type === "toggle") expect(typeof f.default).toBe("boolean");
        else if (f.type === "range") expect(typeof f.default).toBe("number");
        else expect(typeof f.default).toBe("string");
        if (f.type === "select") expect(f.options).toContain(f.default);
        if (f.type === "range") expect(f.default).toBeGreaterThanOrEqual(f.min);
      }
    }
  });

  it("exactly one header and one footer are locked", () => {
    const locked = Object.values(REGISTRY).map((d) => d.schema.locked).filter(Boolean);
    expect(locked.filter((l) => l === "header")).toHaveLength(1);
    expect(locked.filter((l) => l === "footer")).toHaveLength(1);
  });

  it("instantiate fills every default", () => {
    for (const type of SECTION_TYPES) {
      const inst = instantiate(REGISTRY[type].schema);
      for (const f of REGISTRY[type].schema.settings) expect(inst.settings[f.key]).toBe(f.default);
    }
  });
});

describe("config", () => {
  it("the committed snapshot validates", () => {
    expect(() => parseConfig(snapshot.config)).not.toThrow();
  });

  it("withDefaults backfills settings the snapshot omits", () => {
    const filled = withDefaults({ id: "x", type: "hero", visible: true, settings: {} });
    expect(filled.settings.layout).toBe("Split");
    expect(typeof filled.settings.pad).toBe("number");
  });

  it("rejects an unknown section type", () => {
    expect(() => parseConfig({ theme: "paper", sections: [{ id: "a", type: "nope", visible: true, settings: {} }] })).toThrow();
  });
});
