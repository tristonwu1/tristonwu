import type { Metadata } from "next";
import { Martel, Martel_Sans } from "next/font/google";
import { SiteRockProvider } from "@/components/SiteRockProvider";
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
  title: "Triston Wu — Furniture & Objects",
  description:
    "Portfolio of furniture and object design by Triston Wu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full">
        <SiteRockProvider>{children}</SiteRockProvider>
      </body>
    </html>
  );
}
