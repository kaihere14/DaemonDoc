import type { Metadata } from "next";
import Link from "next/link";
import {
  SubPageShell,
  PageHeader,
  LegalDocument,
  type LegalSection,
} from "../_components/SubPage";

export const metadata: Metadata = {
  title: "Terms of Service - DaemonDoc",
  description:
    "The terms that govern your use of DaemonDoc, the automated README generation and sync service for GitHub repositories.",
  alternates: { canonical: "https://www.daemondoc.online/terms" },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Acceptance of terms",
    body: (
      <p>
        By creating an account or using DaemonDoc, you agree to these terms. If
        you use DaemonDoc on behalf of an organisation, you confirm you are
        authorised to accept them for that organisation.
      </p>
    ),
  },
  {
    heading: "The service",
    body: (
      <p>
        DaemonDoc connects to GitHub repositories you choose, analyses their
        code and generates or updates README documentation, including by
        committing changes to those repositories when you enable it. Features
        may change, be added or be removed as the product evolves.
      </p>
    ),
  },
  {
    heading: "Your account",
    body: (
      <p>
        You sign in with GitHub and are responsible for activity under your
        account. Only connect repositories you own or have permission to modify,
        and keep your GitHub account secure.
      </p>
    ),
  },
  {
    heading: "Your content",
    body: (
      <>
        <p>
          You keep all rights to your code and to the documentation generated
          for it. You grant us a limited licence to access and process your
          repository content solely to provide the service.
        </p>
        <p>
          How we handle that content is described in our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    heading: "Acceptable use",
    body: (
      <ul>
        <li>Do not use DaemonDoc to process code you have no right to use.</li>
        <li>
          Do not attempt to disrupt, overload or reverse engineer the service.
        </li>
        <li>
          Do not use the service to generate unlawful, harmful or misleading
          content.
        </li>
      </ul>
    ),
  },
  {
    heading: "AI-generated output",
    body: (
      <p>
        Documentation is produced by AI models and may contain mistakes or
        omissions. Review generated content before relying on it; you are
        responsible for what is published in your repositories.
      </p>
    ),
  },
  {
    heading: "Availability and disclaimers",
    body: (
      <p>
        DaemonDoc is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo;, without warranties of any kind. We do not guarantee
        the service will be uninterrupted or error-free, and to the extent
        permitted by law we are not liable for indirect or consequential losses
        arising from its use.
      </p>
    ),
  },
  {
    heading: "Termination",
    body: (
      <p>
        You can stop using DaemonDoc and revoke its GitHub access at any time.
        We may suspend or end access for accounts that breach these terms.
      </p>
    ),
  },
  {
    heading: "Changes to these terms",
    body: (
      <p>
        We may revise these terms from time to time. Continued use after an
        update means you accept the revised terms.
      </p>
    ),
  },
  {
    heading: "Contact",
    body: (
      <p>
        Questions about these terms? Open an issue on{" "}
        <a
          href="https://github.com/kaihere14/daemondoc"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <SubPageShell>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description="The ground rules for using DaemonDoc, in plain language."
      />
      <LegalDocument updated="October 5, 2026" sections={SECTIONS} />
    </SubPageShell>
  );
}
