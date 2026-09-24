import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing access to and use of vexadigital.in, operated by VEXA Digital.",
};

const linkClass =
  "rounded-sm font-medium text-vx-accent-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500";

export default function TermsPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro eyebrow="Legal" title="Terms of Use">
        <p>
          Effective 23 September 2026. These terms govern your access to and use of
          vexadigital.in, operated by VEXA Digital. By using this site, you agree to these terms.
        </p>
      </PageIntro>
      <div className="mx-auto max-w-3xl space-y-8 px-5 text-base leading-relaxed text-vx-neutral-600 md:px-8">
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            What this site is
          </h2>
          <p className="mt-3">
            VEXA Digital (&quot;VEXA&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a
            gaming and esports brand campaign business operating in India. This site is an
            informational and lead generation site describing our services and inviting
            enquiries; it is not a platform with user accounts at this stage.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Use of the site
          </h2>
          <p className="mt-3">
            You may browse this site and submit enquiries through the contact form for legitimate
            business purposes only. You agree not to misuse the site, including by attempting to
            gain unauthorised access to it, interfering with its normal operation, scraping it at
            scale, or submitting false, misleading, or unlawful information through the contact
            form.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Intellectual property
          </h2>
          <p className="mt-3">
            The VEXA name, the VEXA logo, and the content, design, and layout of this site are the
            property of VEXA Digital or its licensors and are protected by applicable
            intellectual property laws. Except as needed to view the site in a standard web
            browser, you may not copy, reproduce, modify, distribute, or create derivative works
            from any part of this site without our prior written permission.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            No professional advice
          </h2>
          <p className="mt-3">
            The content on this site is provided for general information about VEXA and its
            services only. It does not constitute legal, financial, tax, or other professional
            advice, and you should not rely on it as such. Any business, commercial, or legal
            decisions you make remain your own responsibility, and we recommend seeking
            independent professional advice where appropriate.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Third-party links
          </h2>
          <p className="mt-3">
            This site may link to third-party websites or content that we do not own or control,
            including partner, media, or social platforms. We are not responsible for the
            content, accuracy, or practices of any third-party site, and linking to it does not
            mean we endorse it. You access third-party sites at your own risk and subject to
            their own terms and privacy policies.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Limitation of liability
          </h2>
          <p className="mt-3">
            This site and its content are provided on an &quot;as is&quot; and &quot;as
            available&quot; basis, without warranties of any kind, express or implied. To the
            maximum extent permitted by applicable law, VEXA Digital will not be liable for any
            indirect, incidental, special, or consequential loss or damage arising out of or in
            connection with your use of, or inability to use, this site. Nothing in these terms
            excludes or limits liability that cannot lawfully be excluded or limited under Indian
            law.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Governing law and jurisdiction
          </h2>
          <p className="mt-3">
            These terms are governed by the laws of India. Subject to applicable law, the courts
            at Delhi shall have exclusive jurisdiction over any dispute arising out of or in
            connection with these terms or your use of this site.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Changes to these terms
          </h2>
          <p className="mt-3">
            We may update these terms from time to time to reflect changes in our services or in
            applicable law. We will post the revised terms on this page with an updated effective
            date. Continued use of the site after a change takes effect means you accept the
            revised terms.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Contact
          </h2>
          <p className="mt-3">
            For any questions about these terms, write to us at{" "}
            <a href="mailto:partnerships@vexadigital.in" className={linkClass}>
              partnerships@vexadigital.in
            </a>
            , or by post at 77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070.
          </p>
        </section>
      </div>
    </div>
  );
}
