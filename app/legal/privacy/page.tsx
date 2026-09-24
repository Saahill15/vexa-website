import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How VEXA Digital collects, uses, and protects personal data through vexadigital.in.",
};

const linkClass =
  "rounded-sm font-medium text-vx-accent-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500";

export default function PrivacyPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro eyebrow="Legal" title="Privacy Policy">
        <p>
          Effective 23 September 2026. This policy explains what personal data VEXA Digital
          collects through vexadigital.in, why we collect it, and the rights you have over it
          under Indian law.
        </p>
      </PageIntro>
      <div className="mx-auto max-w-3xl space-y-8 px-5 text-base leading-relaxed text-vx-neutral-600 md:px-8">
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Who we are
          </h2>
          <p className="mt-3">
            VEXA Digital (&quot;VEXA&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a
            gaming and esports brand campaign business operating in India. This policy applies to
            personal data collected through vexadigital.in (the &quot;site&quot;).
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            What personal data we collect
          </h2>
          <p className="mt-3">
            We collect the personal data you choose to give us directly, primarily through the
            contact form on this site and any email or phone contact you initiate with us. This
            typically includes your name, email address, phone number, company or brand name, and
            the details of the enquiry or message you send. We do not knowingly collect payment
            information, government identifiers, or other sensitive personal data through the
            site.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Why we collect it
          </h2>
          <p className="mt-3">
            We use this information to respond to your enquiry, assess whether a partnership makes
            sense, schedule calls, and otherwise communicate with you about our services. We do
            not use contact form data for unrelated marketing without your consent, and we do not
            sell personal data to third parties.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            How long we keep it
          </h2>
          <p className="mt-3">
            We retain enquiry and contact data for as long as needed to respond to you and to
            maintain a record of our business communications, and in any event no longer than is
            reasonably necessary for those purposes or as required by applicable law. You may ask
            us to delete your data earlier by writing to{" "}
            <a href="mailto:partnerships@vexadigital.in" className={linkClass}>
              partnerships@vexadigital.in
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Sharing your information
          </h2>
          <p className="mt-3">
            We do not sell your personal data. We may share it with service providers who help us
            operate the site or run our business (for example, email, hosting, or scheduling
            providers), under obligations to keep it confidential and use it only to provide that
            service to us. We may also disclose personal data where required by law, regulation,
            or a valid order of a court or government authority in India.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Cookies and analytics
          </h2>
          <p className="mt-3">
            The site may use essential cookies needed for it to function and standard web
            analytics tools to understand aggregate traffic and usage, such as pages visited and
            general location at a country or city level. Analytics data is used to improve the
            site and is not used to individually identify visitors for marketing without their
            consent. You can control cookies through your browser settings; blocking them may
            affect how parts of the site work.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            How we protect your information
          </h2>
          <p className="mt-3">
            We use reasonable technical and organisational security practices appropriate to the
            nature of the data we hold, consistent with the reasonable security practices standard
            under the Information Technology Act, 2000 and the Information Technology (Reasonable
            Security Practices and Procedures and Sensitive Personal Data or Information) Rules,
            2011, to protect personal data against unauthorised access, disclosure, alteration, or
            destruction. No method of transmission or storage is completely secure, and we cannot
            guarantee absolute security.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Your rights as a data principal
          </h2>
          <p className="mt-3">
            Under the Digital Personal Data Protection Act, 2023, you have the right, as a data
            principal, to request access to the personal data we hold about you, to request
            correction or updating of inaccurate or incomplete data, to request erasure of data we
            no longer need to retain, to withdraw any consent you previously gave (without
            affecting the lawfulness of anything done before withdrawal), and to nominate another
            individual to exercise these rights on your behalf in the event of your death or
            incapacity. To exercise any of these rights, write to us at{" "}
            <a href="mailto:partnerships@vexadigital.in" className={linkClass}>
              partnerships@vexadigital.in
            </a>
            . We will respond within a reasonable time and in line with applicable law.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Grievance officer
          </h2>
          <p className="mt-3">
            If you have a complaint or grievance about how we handle your personal data, you may
            contact us at{" "}
            <a href="mailto:partnerships@vexadigital.in" className={linkClass}>
              partnerships@vexadigital.in
            </a>
            . We will acknowledge and address grievances in accordance with the Information
            Technology Act, 2000, the Information Technology (Reasonable Security Practices and
            Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital
            Personal Data Protection Act, 2023. See our{" "}
            <a href="/legal/grievance-officer" className={linkClass}>
              Grievance Officer
            </a>{" "}
            page for the officer appointed under India&apos;s IT Rules, 2021.
          </p>
          <p className="mt-3">
            Postal address: 77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight text-vx-ink-900">
            Changes to this policy
          </h2>
          <p className="mt-3">
            We may update this policy from time to time to reflect changes in our practices or in
            applicable law. We will post the revised policy on this page with an updated effective
            date. Continued use of the site after a change takes effect means you accept the
            revised policy.
          </p>
        </section>
      </div>
    </div>
  );
}
