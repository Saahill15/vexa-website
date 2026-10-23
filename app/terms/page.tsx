import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms & Conditions", description: "Terms for using the Vexa Digital website." };

export default function TermsPage() {
  return (
    <LegalPage
      current="terms"
      title="Terms & Conditions"
      updated="22 October 2026"
      summary="The terms for using this website. Vexa Digital is a trade name used by Blue Wings, which operates this website."
      sections={[
        {
          title: "Using the website",
          body: <p>You may browse and share the website for personal and business purposes. Please do not misuse it, attempt to disrupt it, or copy its content for resale.</p>,
        },
        {
          title: "Information on the website",
          body: <p>Articles and service descriptions are general information, not professional advice for your situation. Examples are illustrative and do not describe delivered client work unless stated.</p>,
        },
        {
          title: "Services",
          body: <p>Any engagement for our services is agreed separately in writing with Blue Wings. That written agreement, not this website, sets out the scope, fees and responsibilities. A sponsorship or income is never guaranteed.</p>,
        },
        {
          title: "Comments",
          body: <p>If you post a comment, keep it respectful and relevant. We may remove comments that are not.</p>,
        },
        {
          title: "Links to other websites",
          body: <p>The website links to other services, such as Instagram, LinkedIn and our Valuate tool. We are not responsible for the content or policies of services we do not run.</p>,
        },
        {
          title: "Changes",
          body: <p>We may update these terms. The date at the top shows the latest version.</p>,
        },
        {
          title: "Contact",
          body: <p>Questions about these terms can be sent to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>,
        },
      ]}
    />
  );
}
