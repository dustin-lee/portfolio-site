/**
 * Fonts are loaded from Google Fonts via <link>, which builds anywhere with no
 * network access at build time.
 *
 * UPGRADE (recommended once you are deploying on Netlify, which has network at
 * build time): swap this for next/font/google to self-host the files, remove the
 * third-party request and eliminate layout shift:
 *
 *   import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
 *   const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-display", display: "swap" });
 *   const sans    = Instrument_Sans({ subsets: ["latin"], variable: "--f-sans", display: "swap" });
 *   const mono    = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono", display: "swap" });
 *   // then put `${display.variable} ${sans.variable} ${mono.variable}` on <html>
 *   // and delete <FontLinks /> plus the fontVars rule below.
 */
export const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap";

export function FontLinks() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={FONT_HREF} />
      <style>{`:root{--f-display:"Bricolage Grotesque";--f-sans:"Instrument Sans";--f-mono:"JetBrains Mono"}`}</style>
    </>
  );
}
