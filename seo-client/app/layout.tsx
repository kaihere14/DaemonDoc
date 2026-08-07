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
    <html
      lang="en"
      className={`${interDisplay.variable} ${spaceGrotesk.variable} h-full`}
      style={{
        fontFamily: "var(--font-inter-display), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
