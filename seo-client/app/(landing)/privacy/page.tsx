import type { Metadata } from "next";
import {
  SubPageShell,
  PageHeader,
  LegalDocument,
  type LegalSection,
} from "../_components/SubPage";

export const metadata: Metadata = {
  title: "Privacy Policy - DaemonDoc",
  description:
    "What DaemonDoc collects when you connect a GitHub repository, how that data is used and protected, and the choices you have.",
  alternates: { canonical: "https://www.daemondoc.online/privacy" },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    body: (
      <p>
        DaemonDoc (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides a service that
        generates and updates README documentation for GitHub repositories. This
        policy explains what information we handle when you use daemondoc.online
        and the DaemonDoc app.
      </p>
    ),
  },
  {
    heading: "Information we collect",
    body: (
      <ul>
        <li>
          <strong>Account information</strong> from GitHub when you sign in:
          your username, display name, email address and avatar.
        </li>
        <li>
          <strong>Access tokens</strong> issued by GitHub OAuth, which let us
          read the repositories you connect and commit README updates to them.
        </li>
        <li>
          <strong>Repository content</strong> from the repositories you
          explicitly connect, read only to generate documentation.
        </li>
        <li>
          <strong>Usage data</strong> such as pages visited and features used,
          collected through privacy-friendly analytics.
        </li>
      </ul>
    ),
  },
  {
    heading: "How we use it",
    body: (
      <>
        <p>We use this information only to run and improve DaemonDoc:</p>
        <ul>
          <li>to authenticate you and show your connected repositories;</li>
          <li>to generate README content and commit it on your behalf;</li>
          <li>to show job progress and logs in your dashboard;</li>
          <li>to understand which features are used and fix problems.</li>
        </ul>
        <p>We do not sell your data or use your code to train AI models.</p>
      </>
    ),
  },
  {
    heading: "AI processing",
    body: (
      <p>
        To write documentation, relevant parts of your code are sent to
        third-party large language model providers. They process it to return a
        response and, under their API terms, do not use it to train their
        models. Only the files needed for the current job are sent, and our
        exclusion rules omit tests, boilerplate and sensitive configuration
        where possible.
      </p>
    ),
  },
  {
    heading: "Storage and security",
    body: (
      <p>
        GitHub tokens are encrypted with AES-256 at rest and all traffic is
        encrypted in transit. Repository content is processed for the duration
        of a job and is not kept as a copy of your codebase. We keep the minimum
        metadata needed to detect changes, such as section hashes.
      </p>
    ),
  },
  {
    heading: "Third-party services",
    body: (
      <p>
        We rely on GitHub for sign-in and repository access, cloud hosting
        providers, LLM providers for generation, and analytics providers to
        measure usage. Each processes data only as needed to provide its service
        to us.
      </p>
    ),
  },
  {
    heading: "Your choices",
    body: (
      <ul>
        <li>
          Disconnect a repository at any time from your dashboard to stop all
          processing of it.
        </li>
        <li>
          Revoke DaemonDoc&rsquo;s access from your GitHub settings under
          Applications.
        </li>
        <li>
          Ask us to delete your account and associated data by contacting us.
        </li>
      </ul>
    ),
  },
  {
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the product evolves. Material changes will
        be reflected in the &ldquo;last updated&rdquo; date above.
      </p>
    ),
  },
  {
    heading: "Contact",
    body: (
      <p>
        Questions about privacy? Open an issue on{" "}
        <a
          href="https://github.com/kaihere14/daemondoc"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>{" "}
        or reach out on{" "}
        <a
          href="https://x.com/armankiyotaka"
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
        .
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <SubPageShell>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="Your code stays yours. Here is exactly what we touch, why, and how it's protected."
      />
      <LegalDocument updated="October 5, 2026" sections={SECTIONS} />
    </SubPageShell>
  );
}
