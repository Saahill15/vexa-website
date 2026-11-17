import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_ENTITY, REGISTERED_ADDRESS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms for using the Vexa Digital website: accounts, comments, intellectual property, our services, links and governing law.",
};

/*
 * Organised like the website terms of Indian organisations: use of the site, accounts, rules for what users post (after rule 3(1)(b) of the
 * IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021), copyright, hyperlinking, liability and governing law.
 */
export default function TermsPage() {
  return (
    <LegalPage
      current="terms"
      title="Terms & Conditions"
      updated="17 November 2026"
      summary={`The terms for using this website. Vexa Digital is a trade name of ${LEGAL_ENTITY}, the legal entity that operates this website. By using it you accept these terms.`}
      sections={[
        {
          title: "About these terms",
          body: (
            <>
              <p>These Terms &amp; Conditions apply to your use of the Vexa Digital website (“Vexa”, “we”, “us”). Vexa Digital is a trade name of {LEGAL_ENTITY}, a sole proprietorship, which is the legal entity that operates the website. By using the website you accept these terms. If you do not accept them, please do not use it.</p>
              <p>Please read them together with our <Link href="/privacy">Privacy Policy</Link>. This is an electronic record under the Information Technology Act, 2000 and the rules made under it, and it does not need a physical or digital signature.</p>
            </>
          ),
        },
        {
          title: "About this website",
          body: <p>The website describes our consultancy for brands, esports teams and tournament organisers, publishes articles on brand partnerships and creators, links to our Valuate tool, lets you send us an enquiry, and lets you create an account to read articles in full and comment.</p>,
        },
        {
          title: "Information on the website",
          body: (
            <>
              <p>Articles and service descriptions are general information. They are not legal, financial, tax or other professional advice, and they are not a substitute for advice on your own situation. Examples are illustrative and do not describe delivered client work unless we say so.</p>
              <p>We take care to keep the information accurate and up to date, but we do not promise that it is complete or free of errors. Opinions in articles are those of their authors.</p>
            </>
          ),
        },
        {
          title: "Our services",
          body: (
            <>
              <p>Any engagement for our services is agreed separately and in writing with {LEGAL_ENTITY}. That written agreement, not this website, sets out the scope, fees, timing and responsibilities. Invoices are issued by {LEGAL_ENTITY}.</p>
              <p>A sponsorship, partnership or income is never guaranteed. Results depend on partners, audiences and events that we do not control.</p>
            </>
          ),
        },
        {
          title: "Accounts",
          body: (
            <ul>
              <li>You must be 18 or older to create an account, and give correct information that is yours.</li>
              <li>Keep your password and any sign-in codes to yourself. You are responsible for what is done through your account, so tell us at once if you think someone else has used it.</li>
              <li>You can delete your account at any time from your account page.</li>
              <li>We may suspend or close an account that breaks these terms, is used to harm the website or other people, or is inactive for a long time.</li>
            </ul>
          ),
        },
        {
          title: "Comments and what you post",
          body: (
            <>
              <p>You are responsible for what you post. Keep comments respectful and relevant. Do not post anything that:</p>
              <ul>
                <li>belongs to someone else, or that you have no right to share;</li>
                <li>is obscene, pornographic, harmful to children, or invades another person’s privacy;</li>
                <li>is defamatory, abusive, harassing, hateful or threatening;</li>
                <li>infringes a patent, trademark, copyright or other right;</li>
                <li>pretends to be another person, or misleads people about who it comes from;</li>
                <li>is false or misleading, or spreads a message you know to be untrue;</li>
                <li>contains a virus or other code meant to harm a computer;</li>
                <li>threatens the unity, integrity, defence, security or sovereignty of India, public order or friendly relations with other countries, or breaks any law in force.</li>
              </ul>
              <p>You keep ownership of your comments. By posting one you allow us to show it on the website. We may remove or edit comments that break these rules, and we may close accounts that repeat it.</p>
              <p>To report a comment, write to the Grievance Officer, Kaustubh Srivastava, named in the <Link href="/privacy">Privacy Policy</Link>. We acknowledge a complaint within 24 hours and resolve it within 15 days.</p>
            </>
          ),
        },
        {
          title: "Using the website",
          body: (
            <>
              <p>You must use the website lawfully. You must not:</p>
              <ul>
                <li>try to reach parts of the website or its systems that are not meant for you, or interfere with their security or working;</li>
                <li>send spam, malicious code, or an unreasonable number of requests;</li>
                <li>give false or someone else’s information in a form or an account;</li>
                <li>copy the website in bulk by automated means without our written permission.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Copyright and intellectual property",
          body: (
            <>
              <p>The text, articles, design, logo and other material on this website belong to {LEGAL_ENTITY} or are used with permission, and are protected by the Copyright Act, 1957 and other laws. Game titles, team names, logos and brands mentioned here belong to their owners and are used only to identify them.</p>
              <p>You may read, print and share links to pages for personal and non-commercial use, giving us credit. To reproduce material elsewhere, write to us first. It must then be reproduced accurately, with the source clearly stated, and not in a misleading way. This does not cover material that belongs to a third party: ask its owner.</p>
            </>
          ),
        },
        {
          title: "Valuate and other tools",
          body: <p>Valuate gives an indicative range for a sponsored post. It is a starting point for discussion, not a quote, a guaranteed price or advice, and what a brand actually pays is for you and the brand to agree. Valuate is a separate website and may have its own terms.</p>,
        },
        {
          title: "Links to and from other websites",
          body: (
            <>
              <p><strong>Links from this website.</strong> The website links to other services, such as Instagram, LinkedIn and Valuate, for your convenience. We do not control them and are not responsible for their content, privacy practices or availability. A link is not an endorsement, and when you follow it you leave this website.</p>
              <p><strong>Links to this website.</strong> You may link to any page, and no permission is needed. Please do not show our pages inside another page (framing) or suggest that we support you or your site.</p>
            </>
          ),
        },
        {
          title: "Availability",
          body: <p>We may change, pause or withdraw any part of the website at any time, for example for maintenance. We do not promise that it will always be available or free of interruptions.</p>,
        },
        {
          title: "Limits of our responsibility",
          body: <p>To the fullest extent the law allows, we are not liable for any loss or damage that comes from using the website, relying on its content, or events beyond our reasonable control. Nothing in these terms limits any liability that cannot be limited by law, and they do not affect your rights as a consumer under law.</p>,
        },
        {
          title: "Governing law and disputes",
          body: <p>These terms are governed by the laws of India. If a dispute arises, please write to us first so we can try to settle it. Any dispute that is not settled is subject to the jurisdiction of the courts at Ahmedabad, Gujarat, without affecting any right you have by law.</p>,
        },
        {
          title: "Changes and general terms",
          body: (
            <>
              <p>We may change these terms. The date at the top shows the latest version, and if you keep using the website after a change, you accept the new terms. If any part of these terms cannot be enforced, the rest still applies.</p>
            </>
          ),
        },
        {
          title: "Contact",
          body: (
            <>
              <p><strong>Vexa Digital</strong>, a trade name of {LEGAL_ENTITY}<br />Registered place of business: {REGISTERED_ADDRESS}.<br />Operating office: {SITE.address}.</p>
              <p>For personal data and complaints, see the Grievance Officer, Kaustubh Srivastava, named in the <Link href="/privacy">Privacy Policy</Link>.</p>
            </>
          ),
        },
      ]}
    />
  );
}
