import Image from "next/image";
import Link from "next/link";
import { SECTION_X } from "@/app/(landing)/_lib/section";

const PRODUCT_LINKS = [{ label: "Solutions", href: "/solutions" }];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const FOOTER_LINK =
  "hover:text-primary rounded text-sm text-slate-600 transition-colors";

export function UsefulShelfBadge() {
  return (
    <a
      href="https://usefulshelf.co/?utm_source=daemondoc.online&amp;utm_medium=referral&amp;utm_campaign=badge&amp;utm_content=lime"
      target="_blank"
      rel="noopener"
    >
      {/* Plain <img> on purpose: next/image would proxy the src, and
          UsefulShelf verifies the badge by its original URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://usefulshelf.co/badge/usefulshelf.svg?theme=lime"
        alt="Featured on UsefulShelf"
        width={248}
        height={66}
        className="h-8 w-auto"
      />
    </a>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-slate-100 bg-linear-to-b from-white via-slate-50/50 to-white pt-14 pb-12 lg:pt-20">
      <div className={SECTION_X}>
        <div className="grid grid-cols-1 gap-12 pb-14 md:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-4 md:col-span-8">
            {/* The footer has room for the full standing mascot; the navbars
                use the cropped bust. */}
            <div className="flex items-end gap-3 self-start">
              <Image
                src="/mascot-full.png"
                alt=""
                width={364}
                height={480}
                className="h-16 w-auto"
              />
              <span className="font-display pb-1 text-2xl font-semibold tracking-tight text-slate-900">
                DaemonDoc
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed font-light text-slate-600">
              The automation layer for your codebase documentation.
            </p>
            <div className="self-start">
              <UsefulShelfBadge />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-4">
            <div>
              <h4 className="mb-6 text-xs font-semibold tracking-wider text-slate-900 uppercase">
                Product
              </h4>
              <ul className="space-y-4">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={FOOTER_LINK}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-xs font-semibold tracking-wider text-slate-900 uppercase">
                Legal
              </h4>
              <ul className="space-y-4">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={FOOTER_LINK}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 md:flex-row">
          <div className="flex items-center gap-8">
            <span className="text-sm text-slate-500">
              © {currentYear} DaemonDoc Inc.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://x.com/armankiyotaka"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-slate-400 transition-colors hover:text-slate-900"
              aria-label="X (Twitter)"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com/kaihere14/daemondoc"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-slate-400 transition-colors hover:text-slate-900"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
