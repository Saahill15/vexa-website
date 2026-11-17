import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_ENTITY, REGISTERED_ADDRESS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal data the Vexa Digital website collects, why, how it is kept safe, and how to use your rights under India's data protection law.",
};

const mail = <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;
const officerMail = <a href={`mailto:${SITE.grievanceEmail}`}>{SITE.grievanceEmail}</a>;

/*
 * Written from what this website actually does (enquiry form, accounts, comments, sign-in, email) and organised after the notice
 * content the Digital Personal Data Protection Rules, 2025 expect (rule 3) and the IT (Reasonable Security Practices and Procedures
 * and Sensitive Personal Data or Information) Rules, 2011 (a published policy and a Grievance Officer). Keep it in step with the code:
 * if the site starts collecting something new, change this page in the same change.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      current="privacy"
      title="Privacy Policy"
      updated="17 November 2026"
      summary={`What personal data this website collects, why, how it is protected, how long we keep it, and how you can use your rights. Vexa Digital is a trade name of ${LEGAL_ENTITY}, the legal entity responsible for this website.`}
      sections={[
        {
          title: "Who we are",
          body: (
            <>
              <p>This website is run by <strong>Vexa Digital</strong> (“Vexa”, “we”, “us”). Vexa Digital is a trade name of {LEGAL_ENTITY}, a sole proprietorship, which is the legal entity responsible for the website. For the personal data described here, {LEGAL_ENTITY} decides why and how it is used. The law calls such a person a Data Fiduciary.</p>
              <p>Registered place of business: {REGISTERED_ADDRESS}.<br />Operating office: {SITE.address}.<br />Email: {mail}</p>
              <p>We follow the Digital Personal Data Protection Act, 2023 and the rules made under it, the Information Technology Act, 2000 and its rules, including the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.</p>
            </>
          ),
        },
        {
          title: "The personal data we collect, and why",
          body: (
            <>
              <h3>When you send the Start a conversation form</h3>
              <p>You tell us who you are building for, give a short message and your email address. You may also add your name, company or channel, what you are interested in, and your timing. You give all of this yourself.</p>
              <p><strong>Why:</strong> to reply to you, to discuss working together, and to keep a record of the conversation. We use it only because you consent, by ticking the box on the form.</p>

              <h3>When you create an account</h3>
              <ul>
                <li>your name and email address, and a password, which we store only as a one-way scrambled value (a hash) that cannot be turned back into your password;</li>
                <li>if you sign in with Google instead: your name, email address and Google account identifier, which Google gives us when you agree;</li>
                <li>a confirmation link sent to your email. Until you use it (it works for 24 hours) your sign-up is kept pending and is then deleted.</li>
              </ul>
              <p><strong>Why:</strong> to let you read full articles, post comments and manage your own details. We use it because you consent when you sign up.</p>

              <h3>When you use your account</h3>
              <ul>
                <li>a sign-in cookie, and on our server a scrambled copy of it, so you stay signed in for up to 14 days;</li>
                <li>the times you last signed in and last changed your password;</li>
                <li>the comments you post: your name, the text, the time and the article;</li>
                <li>your enquiries, which your account page shows when they were sent from your confirmed email address.</li>
              </ul>

              <h3>Our own team</h3>
              <p>People who run the website have accounts with a second sign-in step. For that we keep an encrypted authenticator secret, scrambled backup codes and the public part of any passkey. None of this is visible to visitors.</p>
              <p>Sign-ins to the admin panel, and every change made there (for example editing an article or answering an enquiry), are recorded in an activity log with the time, the account, what was changed and the IP address. A team member who stays inactive for 45 minutes is signed out.</p>

              <h3>Email</h3>
              <p>What you send us by email, and what we send back, is kept in our mailbox. We also email you when the law or the service needs it, for example to confirm your address or to reset a password.</p>

              <h3>When you visit the website</h3>
              <ul>
                <li><strong>No advertising or tracking.</strong> We do not use advertising or tracking cookies, and we do not profile visitors.</li>
                <li><strong>Visit statistics.</strong> Only if you press Accept on the cookie notice, we use Cloudflare Web Analytics to count visits and which pages are read. It sets no cookies and does not follow you from one website to another. If you decline, it is not loaded. You can change your choice at any time with “Cookie settings” in the page footer.</li>
                <li><strong>Spam check.</strong> The enquiry and sign-up forms use Cloudflare Turnstile to tell people from automated programs. It receives technical details such as your IP address and browser information, and may keep a short-lived token in your browser to complete the check.</li>
                <li><strong>Technical records.</strong> Our servers keep short records of errors and refused requests (such as the page address, the time and your IP address) to keep the website working and safe.</li>
                <li><strong>Abuse protection.</strong> To stop spam and repeated attempts, our systems count requests to the forms and sign-in pages per IP address. These counts are kept for about a day.</li>
                <li><strong>Cookies.</strong> A visitor who is not signed in gets no cookies from us. When you sign in we set one sign-in cookie, and a short-lived one while you link Google or finish a second step. They are strictly needed for the website to work, so we do not ask you to accept them. If you use Google sign-in, Google may set its own cookies, under its own policy. Your answer to the cookie notice is remembered in your browser’s local storage (the key is “vexa-cookie-choice”), not in a cookie.</li>
              </ul>
            </>
          ),
        },
        {
          title: "What we do not ask for",
          body: <p>We do not ask for payment card or bank details, Aadhaar or other government ID numbers, or health information on this website. Please do not put them in the enquiry form or in comments. If you do, you do so at your own risk, and we will delete them when we notice.</p>,
        },
        {
          title: "Your consent, and how to withdraw it",
          body: (
            <>
              <p>We ask for your consent before using the details you give us, and we ask only for what we need. You can withdraw consent at any time, as easily as you gave it: delete your account from your account page, or write to us at {mail} from the email address you used.</p>
              <p>If you withdraw, we stop using your data for the purpose you agreed to, except where the law requires us to keep it. Withdrawing does not affect anything we did lawfully before.</p>
            </>
          ),
        },
        {
          title: "What other people can see",
          body: (
            <>
              <p>Comments are visible to other signed-in readers with the name on your account. Your email address is never shown. Your enquiries and account details are visible only to you and to our team.</p>
              <p>You can delete your own comments at any time. If you delete your account, your comments stay on the article as from a “Former member”, with your name removed. Enquiries stay as our business records. If you want a particular comment or enquiry removed, write to us and we will remove it unless the law requires us to keep it.</p>
            </>
          ),
        },
        {
          title: "How we protect your data",
          body: (
            <>
              <ul>
                <li>The website uses encrypted connections (HTTPS).</li>
                <li>Passwords and sign-in tokens are stored only as one-way scrambled values. Our team’s authenticator secrets are encrypted.</li>
                <li>Our team signs in with a password and a second step, and only people who need to see enquiries and accounts can open them.</li>
                <li>Requests to the forms and sign-in pages are rate limited, and the database is not open to the internet.</li>
              </ul>
              <p>No system is completely secure. If a breach affects your personal data, we will tell you and the Data Protection Board of India as the law requires.</p>
            </>
          ),
        },
        {
          title: "Who receives your data",
          body: (
            <>
              <p>We do not sell your data and we do not use it for advertising. We share it only with service providers who help us run the website, under our instructions, and where the law requires:</p>
              <ul>
                <li><strong>Hosting, network, visit statistics and spam check:</strong> Cloudflare, which serves the website, counts visits (Web Analytics) and runs the Turnstile check on forms.</li>
                <li><strong>Database:</strong> a managed database provider that stores accounts, enquiries and comments for us.</li>
                <li><strong>Email:</strong> Resend, which sends confirmation and password emails for us, and Google (Gmail), which carries the mail of our shared inbox.</li>
                <li><strong>Google sign-in:</strong> only if you choose it. Google then receives the fact that you are signing in to this website.</li>
                <li>A court, regulator or authority, if the law requires us to disclose data.</li>
              </ul>
              <p>Some of these providers may process data outside India. We do this only where the Digital Personal Data Protection Act, 2023 permits.</p>
              <p>Links to Instagram, LinkedIn and other sites are ordinary links: nothing is sent to them unless you click, and then their own policies apply. Our <strong>Valuate</strong> tool is a separate website. Please read the privacy notice there before using it.</p>
            </>
          ),
        },
        {
          title: "How long we keep it",
          body: (
            <ul>
              <li>Enquiries: while we are discussing or delivering work with you, and afterwards for as long as our records or the law require. You can ask us to delete an enquiry at any time.</li>
              <li>Accounts: until you delete your account. Unconfirmed sign-ups are deleted after 24 hours, and password reset links after 30 minutes.</li>
              <li>Sign-in sessions: up to 14 days, or until you sign out.</li>
              <li>Request counts: about one day. Technical records: for as long as needed to keep the website safe.</li>
              <li>The team activity log (sign-ins and changes in the admin panel): one year.</li>
              <li>Records we must keep by law, such as invoices for paid work, are kept for the period the law requires.</li>
            </ul>
          ),
        },
        {
          title: "Your rights",
          body: (
            <>
              <p>Under the Digital Personal Data Protection Act, 2023 you may:</p>
              <ul>
                <li>ask for a summary of the personal data we hold about you, how we use it and who we share it with;</li>
                <li>ask us to correct, complete or update it. You can change your name yourself on your account page;</li>
                <li>ask us to erase it, unless the law requires us to keep it. You can delete your account yourself on your account page;</li>
                <li>raise a grievance about how we handle your data;</li>
                <li>nominate another person to exercise these rights for you if you die or cannot act.</li>
              </ul>
              <p>To use a right, write to us at {mail} from the email address we hold for you. We may ask you to confirm who you are, and we will reply within one month.</p>
            </>
          ),
        },
        {
          title: "Grievance Officer",
          body: (
            <>
              <p>For any question, request or complaint about your personal data, or about a comment you believe breaks the law or these terms:</p>
              <p><strong>Kaustubh Srivastava</strong>, Grievance Officer<br />Founder, Vexa Digital<br />{SITE.address}<br />Email: {officerMail}</p>
              <p>We acknowledge a complaint within 24 hours of receiving it and resolve it within 15 days. A request about your own data is answered within one month, as above.</p>
              <p>If you are not satisfied with our reply, you may complain to the Data Protection Board of India under the Digital Personal Data Protection Act, 2023. The Act expects you to use our grievance process first.</p>
            </>
          ),
        },
        {
          title: "Children",
          body: <p>Accounts are for people aged 18 or over, and this website is not meant for children. We do not knowingly collect personal data of anyone under 18. If you think a child has given us data, write to us and we will delete it.</p>,
        },
        {
          title: "Changes to this policy",
          body: (
            <p>We may update this policy. The date at the top shows when it was last changed. If a change affects how we use the data you have given us, we will tell you and ask for your consent again where the law requires. See also our <Link href="/terms">Terms &amp; Conditions</Link>.</p>
          ),
        },
        {
          title: "Contact",
          body: (
            <p><strong>Vexa Digital</strong>, a trade name of {LEGAL_ENTITY}<br />Registered place of business: {REGISTERED_ADDRESS}.<br />Operating office: {SITE.address}.</p>
          ),
        },
      ]}
    />
  );
}
