import type { Metadata } from "next";
import { getPlans } from "./(landing)/_lib/plans";
import PageEntrance from "./(landing)/_components/PageEntrance";
import LandingNavigation from "./(landing)/_components/LandingNavigation";
import Hero from "./(landing)/_components/Hero";
import Features from "./(landing)/_components/Features";
import Footer from "./(landing)/_components/Footer";

export const metadata: Metadata = {
  title:
    "DaemonDoc - AI-Powered README Generator for GitHub | Automate Your Documentation",
  description:
    "Stop wasting hours on documentation. DaemonDoc automatically generates and updates your GitHub README files using AI. Connect your repos and keep documentation fresh as your code evolves.",
  keywords:
    "README generator, AI documentation, GitHub automation, automatic README, documentation tool, code documentation, GitHub README, AI README generator, developer tools, documentation automation, README automation, continuous documentation sync, automated GitHub README, documentation-as-code, AST-based patching, deterministic patching, stateless sync, webhook-driven documentation",
  authors: [{ name: "DaemonDoc" }],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://daemondoc.online/",
  },
  openGraph: {
    type: "website",
    url: "https://daemondoc.online/",
    siteName: "DaemonDoc",
    locale: "en_US",
    title: "DaemonDoc - AI-Powered README Generator for GitHub",
    description:
      "Set and Forget GitHub documentation. DaemonDoc uses AST-based patching and webhook-driven sync to keep your README accurate on every push — no manual effort required.",
    images: [
      {
        url: "https://daemondoc.online/main_og.png",
        width: 1200,
        height: 630,
        alt: "DaemonDoc - Automate Your GitHub Documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@daemondoc",
    creator: "@daemondoc",
    title: "DaemonDoc - AI-Powered README Generator for GitHub",
    description:
      "Set and Forget GitHub documentation. DaemonDoc uses AST-based patching and webhook-driven sync to keep your README accurate on every push — no manual effort required.",
    images: ["https://daemondoc.online/x_og.png"],
  },
  other: {
    "theme-color": "#0f172a",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "DaemonDoc",
    "application-name": "DaemonDoc",
    "msapplication-TileColor": "#0f172a",
    "revisit-after": "7 days",
    language: "English",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DaemonDoc",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "AI-powered README generator that automatically creates and updates documentation for your GitHub repositories.",
  url: "https://daemondoc.online",
  image: "https://daemondoc.online/main_og.png",
  author: {
    "@type": "Organization",
    name: "DaemonDoc",
  },
  featureList: [
    "AI-powered code analysis",
    "Automatic README generation",
    "GitHub OAuth integration",
    "Real-time documentation updates",
    "Monorepo support",
    "Secure and private",
    "AST-based section patching",
    "SHA-256 section hashing for deterministic patch detection",
    "Webhook-driven README sync on every push",
    "BullMQ async queue for non-blocking generation",
    "Gemini primary with Groq fallback AI provider chain",
    "Convex live log streaming",
  ],
  keywords:
    "README automation, continuous documentation sync, automated GitHub README, documentation-as-code, AST-based patching, deterministic patching, stateless sync, webhook-driven documentation, MERN stack, BullMQ, Convex",
};

export default async function Home() {
  const { monthly, yearly } = await getPlans();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageEntrance>
        <LandingNavigation />
        <Hero />
        <Features monthly={monthly} yearly={yearly} />
        <Footer />
      </PageEntrance>
    </>
  );
}
