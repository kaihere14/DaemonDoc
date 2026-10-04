import Link from "next/link";
import PageEntrance from "./PageEntrance";
import LandingNavigation from "./LandingNavigation";
import Footer from "./Footer";
import { SECTION_X, SECTION_Y } from "@/app/(landing)/_lib/section";
import { CandyLink } from "@/components/ui/candy-button";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.daemondoc.online";

/** The chrome every page other than the home page shares. */
export function SubPageShell({ children }: { children: React.ReactNode }) {
  return (
    <PageEntrance>
      {/* No hero photo behind the bar here, so it never flips to white text. */}
      <LandingNavigation overPhoto={false} />
      <main>{children}</main>
      <Footer />
    </PageEntrance>
  );
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

/**
 * Stands in for the hero on inner pages: same type scale and soft brand
 * gradient, without the full-bleed photo.
 */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="hero-gradient relative overflow-hidden border-b border-slate-100 pt-36 pb-16 lg:pt-44 lg:pb-24">
      <div className={`${SECTION_X} text-center`}>
        <p className="text-primary mb-4 text-sm font-medium">{eyebrow}</p>
        <h1 className="font-display mx-auto max-w-3xl text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-light tracking-[-0.012em] text-slate-600">
          {description}
        </p>
      </div>
    </header>
  );
}

/** Closing call to action, shared by the product pages. */
export function CtaBand() {
  return (
    <section className={SECTION_Y}>
      <div className={SECTION_X}>
        <div className="relative mx-auto max-w-4xl bg-white px-6 py-14 text-center">
          <div className="pointer-events-none absolute top-0 -left-4 w-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
          <div className="pointer-events-none absolute -top-4 left-0 h-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
          <div className="pointer-events-none absolute -top-4 right-0 h-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
          <div className="pointer-events-none absolute bottom-0 -left-4 w-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>

          <h2 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">
            Push once. Sync forever.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg font-light tracking-[-0.012em] text-slate-600">
            Connect a repository in under a minute and let DaemonDoc keep its
            README current on every push.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <CandyLink href={`${APP_URL}/login`} className="px-8 py-3">
              Get Started
            </CandyLink>
            <Link
              href="/"
              className="hover:text-primary rounded text-sm font-medium text-slate-600 transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

/** Long-form prose layout for the legal pages. */
export function LegalDocument({
  updated,
  sections,
}: {
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <section className={SECTION_Y}>
      <div className={SECTION_X}>
        <article className="mx-auto max-w-3xl">
          <p className="mb-12 text-sm text-slate-500">Last updated {updated}</p>
          <div className="space-y-12">
            {sections.map((s, i) => (
              <section key={s.heading}>
                <h2 className="font-display mb-4 text-2xl font-bold text-slate-900">
                  {i + 1}. {s.heading}
                </h2>
                <div className="[&_a]:text-primary space-y-4 text-base leading-relaxed text-slate-600 [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-slate-900 [&_ul]:space-y-2">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
