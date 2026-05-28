import type { Metadata } from "next";
import { Martel, Martel_Sans } from "next/font/google";
import { SiteRockProvider } from "@/components/SiteRockProvider";
import { getWorks } from "@/sanity/queries";
import "./globals.css";

const display = Martel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["200", "300", "400", "600"],
});

const sans = Martel_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  title: "Triston Wu",
  description:
    "Portfolio of furniture and object design by Triston Wu.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const works = await getWorks();

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full">
        <SiteRockProvider works={works}>{children}</SiteRockProvider>
      </body>
    </html>
  );
}
