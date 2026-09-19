import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Archivo, Newsreader } from "next/font/google";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const serif = Newsreader({ subsets: ["latin"], display: "swap", variable: "--font-serif" });
const sans = Archivo({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
