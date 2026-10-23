import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Vexa Digital handles your information on this website." };

const mail = <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;

export default function PrivacyPage() {
  return (
    <LegalPage
      current="privacy"
      title="Privacy Policy"
      updated="22 October 2026"
      summary="What information this website handles, why, and the choices you have. Vexa Digital is a trade name used by Blue Wings, which is responsible for this website."
      sections={[
        {
          title: "Information you send us",
          body: (
            <>
              <p>When you send the Start a conversation form, we receive what you enter: who you are building for, your message, and your email address. Your name, company or channel, and timing are optional.</p>
              <p>Each message is saved on our server and passed to the email system we use to receive enquiries. We use it only to reply to you and to discuss working together.</p>
            </>
          ),
        },
        {
          title: "How long we keep it",
          body: <p>We keep enquiries while we are discussing or delivering work with you, and for as long as our records require afterwards. You can ask us to delete your enquiry at any time.</p>,
        },
        {
          title: "Comments on articles",
          body: <p>Comments are currently saved only in your own browser, on your device. They are not sent to us or shown to other visitors.</p>,
        },
        {
          title: "Accounts",
          body: <p>Accounts are not available yet. When they are, this policy will be updated to explain what account information is kept and why.</p>,
        },
        {
          title: "Cookies and analytics",
          body: <p>The website does not use advertising or analytics cookies. Your browser may keep small files needed for the site to work.</p>,
        },
        {
          title: "Your choices",
          body: <p>You can ask us what information we hold about you, ask us to correct it, or ask us to delete it, by emailing {mail}.</p>,
        },
        {
          title: "Contact",
          body: <p>Questions about this policy can be sent to {mail}. Operating office: {SITE.address}.</p>,
        },
      ]}
    />
  );
}
