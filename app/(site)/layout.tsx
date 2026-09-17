import type { Metadata } from "next";
import { getPublishedConfig } from "@/lib/content";
import { data } from "@/lib/data";
import { ThemeStyle } from "@/components/ThemeStyle";
import { FontLinks } from "../fonts";
import "../globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(data.profile.site),
  title: `${data.profile.name} — ${data.profile.title}`,
  description: "Selected work, open-source projects and experience.",
  openGraph: { type: "website", title: `${data.profile.name} — ${data.profile.title}`, url: data.profile.site },
  // NOT INDEXED YET. The site is live so it can be edited at /studio, but it
  // should not appear in search results until the content is real.
  // Flip both values to true when you are ready to be found.
  robots: { index: false, follow: false },
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const config = await getPublishedConfig();
  return (
    <html lang="en" data-theme={config.theme}>
      <head>
        <FontLinks />
        <ThemeStyle config={config} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:z-50 focus:bg-acc focus:px-4 focus:py-2.5 focus:text-accink">
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org", "@type": "Person",
              name: data.profile.name, jobTitle: data.profile.title, url: data.profile.site,
              sameAs: [data.profile.github, data.profile.linkedin],
            }),
          }}
        />
      </body>
    </html>
  );
}
