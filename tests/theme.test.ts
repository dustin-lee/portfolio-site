import { describe, it, expect } from "vitest";
import {
  PRESETS, TOKEN_KEYS, ELEMENT_KEYS, isColor, sanitizeCss, resolveTokens, themeCss, sectionCss,
} from "@/lib/theme";
import { parseConfig } from "@/lib/config-schema";
import type { SiteConfig } from "@/sections/types";

const base: SiteConfig = {
  theme: "paper",
  sections: [{ id: "hero-1", type: "hero", visible: true, settings: {} }],
};

describe("sanitizeCss", () => {
  it("removes the one character that could close the style tag", () => {
    expect(sanitizeCss("a{}</style><script>alert(1)</script>")).not.toContain("<");
  });
  it("keeps child combinators", () => {
    expect(sanitizeCss(".card > h3 { color: red }")).toContain(">");
  });
  it("strips @import and expression()", () => {
    expect(sanitizeCss('@import url("https://evil.test/x.css"); a{color:red}')).not.toMatch(/@import/i);
    expect(sanitizeCss("width: expression(alert(1))")).not.toMatch(/expression\s*\(/i);
  });
  it("caps length", () => {
    expect(sanitizeCss("a".repeat(500), 100)).toHaveLength(100);
  });
});

describe("isColor", () => {
  it("accepts hex, functions and keywords", () => {
    for (const v of ["#fff", "#1B4D3E", "#1B4D3EAA", "rgb(1 2 3)", "hsl(200 50% 40%)", "oklch(0.7 0.1 200)", "transparent"])
      expect(isColor(v)).toBe(true);
  });
  it("rejects anything that could break out of a declaration", () => {
    for (const v of ["red; } body { display:none", "url(x)", "<script>", "", "a".repeat(200)])
      expect(isColor(v)).toBe(false);
  });
});

describe("resolveTokens", () => {
  it("returns the preset untouched with no overrides", () => {
    expect(resolveTokens("graphite")).toEqual(PRESETS.graphite.tokens);
  });
  it("applies a valid override and ignores an invalid one", () => {
    const out = resolveTokens("paper", { paper: { tokens: { acc: "#FF0000", ink: "red; }" } } });
    expect(out.acc).toBe("#FF0000");
    expect(out.ink).toBe(PRESETS.paper.tokens.ink);
  });
  it("keeps overrides separate per preset", () => {
    const overrides = { paper: { tokens: { acc: "#FF0000" } } };
    expect(resolveTokens("paper", overrides).acc).toBe("#FF0000");
    expect(resolveTokens("signal", overrides).acc).toBe(PRESETS.signal.tokens.acc);
  });
});

describe("themeCss", () => {
  it("emits every token for the active preset", () => {
    const css = themeCss(base);
    expect(css).toContain('[data-theme="paper"]');
    for (const k of TOKEN_KEYS) expect(css).toContain(PRESETS.paper.tokens[k]);
  });

  it("emits no element rules until one is set", () => {
    const css = themeCss(base);
    for (const k of ELEMENT_KEYS) expect(css).not.toContain(`${k}:not(`);
  });

  it("emits an element rule that opts out of inverted surfaces", () => {
    const css = themeCss({ ...base, themeOverrides: { paper: { elements: { h2: "#123456" } } } });
    expect(css).toContain("h2:not([data-invert] *){color:#123456}");
  });

  it("only styles the active preset", () => {
    const css = themeCss({ ...base, theme: "signal" });
    expect(css).toContain('[data-theme="signal"]');
    expect(css).not.toContain('[data-theme="paper"]');
  });

  it("scopes and sanitises global custom CSS", () => {
    const css = themeCss({ ...base, customCss: ".wrap { max-width: 900px } </style>" });
    expect(css).toContain("max-width: 900px");
    expect(css).not.toContain("<");
  });
});

describe("sectionCss", () => {
  it("scopes to the section wrapper", () => {
    expect(sectionCss("hero-1", "background:#000")).toBe('[data-sid="hero-1"]{background:#000}');
  });
  it("returns nothing for empty input", () => {
    expect(sectionCss("hero-1", "   ")).toBe("");
  });
  it("cannot escape its scope via a quote in the id", () => {
    // Quotes are stripped, so the whole id stays inside one attribute selector.
    const out = sectionCss('a"] , body [x="', "color:red");
    expect(out).not.toContain('"]  ');
    expect(out.match(/\{/g) ?? []).toHaveLength(1);
  });

  it("the schema rejects ids that are not plain identifiers in the first place", () => {
    expect(() =>
      parseConfig({ theme: "paper", sections: [{ id: 'a"] x', type: "hero", visible: true, settings: {} }] }),
    ).toThrow();
  });
});

describe("config validation", () => {
  it("accepts overrides, custom CSS and section CSS", () => {
    const parsed = parseConfig({
      theme: "graphite",
      themeOverrides: { graphite: { tokens: { acc: "#00FF00" }, elements: { p: "#CCCCCC" } } },
      customCss: "h1 { letter-spacing: -0.03em }",
      sections: [{ id: "hero-1", type: "hero", visible: true, settings: {}, css: ".card { border-radius: 0 }" }],
    });
    expect(parsed.themeOverrides?.graphite?.tokens?.acc).toBe("#00FF00");
    expect(parsed.sections[0].css).toContain("border-radius");
  });

  it("rejects a colour that tries to break out", () => {
    expect(() =>
      parseConfig({ theme: "paper", themeOverrides: { paper: { tokens: { acc: "red } body { display:none" } } }, sections: base.sections }),
    ).toThrow();
  });

  it("stores custom CSS already sanitised", () => {
    const parsed = parseConfig({ ...base, customCss: "a{}</style>" });
    expect(parsed.customCss).not.toContain("<");
  });
});
