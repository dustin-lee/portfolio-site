import type { Metadata } from "next";
import { FontLinks } from "../fonts";
import "../globals.css";


export const metadata: Metadata = {
  title: "Section Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <FontLinks />
      </head>
      <body className="bg-zinc-100 font-sans text-zinc-900 antialiased dark:bg-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
