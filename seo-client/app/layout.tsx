import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Body/UI font — self-hosted from public/, same setup as daemondoc-v2
const interDisplay = localFont({
  src: "../public/inter-display.p.woff2",
  variable: "--font-inter-display",
  display: "swap",
});

// Headings keep Space Grotesk
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://daemondoc.online"),
  icons: {
    icon: "/siteLogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // next/font self-hosts both faces at build time, so there is nothing to
    // preconnect to — the fonts ship from this origin.
    <html
      lang="en"
      className={`${interDisplay.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-slate-900 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
