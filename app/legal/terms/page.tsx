import type { Metadata } from "next";
import { withShare } from "@/lib/meta";
import { ENTITY } from "@/components/entity";
import { type LegalBlock } from "@/components/LegalBlocks";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = withShare({
  title: "Terms of use",
  description: "Terms of use for www.vexadigital.in, run by Blue Wings, trading as VEXA Digital.",
  alternates: { canonical: "/legal/terms" },
});

// COUNSEL TO CONFIRM: entity line (trade name, proprietorship, proprietor, GSTIN, Udyam number) is
// copied from the GST REG-06 and Udyam certificates. The registered address on both certificates is in
// Ahmedabad and is shown as the registered place of business; Delhi is the operating office. Confirm before publication.
const INTRO: readonly LegalBlock[] = [
  {
    "t": "p",
    "text": "Effective 23 September 2026."
  },
  {
    "t": "h3",
    "text": "Summary"
  },
  {
    "t": "p",
    "text": "This site describes VEXA's services and lets you send us an enquiry. Use it lawfully and for genuine business purposes. Our content belongs to us. Nothing here is legal, tax or financial advice. Any service we provide runs under a separate written agreement with Blue Wings. Indian law applies, and the courts at Delhi decide disputes."
  },
  {
    "t": "p",
    "text": "These terms cover your use of www.vexadigital.in, run by Blue Wings, trading as VEXA Digital. By using this site, you agree to them."
  },
  { "t": "p", "text": ENTITY.licence, "counsel": true },
  { "t": "p", "text": ENTITY.registrations, "counsel": true },
  { "t": "p", "text": ENTITY.operatingOffice, "counsel": true },
  { "t": "p", "text": ENTITY.registeredOffice, "counsel": true },
  { "t": "p", "text": ENTITY.invoicing, "counsel": true },
  { "t": "p", "text": ENTITY.agreements, "counsel": true }
];

const SECTIONS: readonly { id: string; blocks: readonly LegalBlock[] }[] = [
  {
    "id": "TERMS-02",
    "blocks": [
      {
        "t": "h2",
        "text": "What this site is"
      },
      {
        "t": "p",
        "text": "Blue Wings, trading as VEXA Digital (\"VEXA\", \"we\", \"us\"), is an esports business consultancy in India. This site describes our services, offers free breakdowns and lets you contact us. You can sign in with Google or give your email to read a free sheet, and we keep the details you give us as our privacy policy says."
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "Any service we provide is governed by a separate written agreement with you.",
            "counsel": true
          }
        ]
      },
      {
        "t": "p",
        "text": "[Gap L11: link to a short public summary of how an engagement starts, runs and ends, once the Engagement terms page in L12 exists]"
      }
    ]
  },
  {
    "id": "TERMS-03",
    "blocks": [
      {
        "t": "h2",
        "text": "Using the site"
      },
      {
        "t": "p",
        "text": "You may browse this site, read the free sheets and send enquiries through the contact form for genuine purposes. You agree not to:"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "try to gain unauthorised access to the site"
          },
          {
            "text": "interfere with how the site works"
          },
          {
            "text": "scrape the site at scale"
          },
          {
            "text": "send false, misleading or unlawful information through the form"
          }
        ]
      }
    ]
  },
  {
    "id": "TERMS-04",
    "blocks": [
      {
        "t": "h2",
        "text": "Our content"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "The VEXA name and logo, and the text, design and layout of this site, belong to Blue Wings or its licensors.",
            "counsel": true
          }
        ]
      },
      {
        "t": "p",
        "text": "You may view the site in a browser. You may not copy, change, share or build on any part of it without our written permission."
      }
    ]
  },
  {
    "id": "TERMS-05",
    "blocks": [
      {
        "t": "h2",
        "text": "No professional advice"
      },
      {
        "t": "p",
        "text": "This site gives general information about VEXA and its services. It is not legal, financial, tax or other professional advice. Decisions you make are your own, and we suggest you take independent advice where it matters."
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "KPIs, reach and view figures on this site are targets or estimates, not guarantees.",
            "counsel": true
          },
          {
            "text": "Valuate results are estimates.",
            "counsel": true
          }
        ]
      },
      {
        "t": "p",
        "text": "[Gap L13: a separate Disclaimer page, linked from the footer]"
      },
      {
        "t": "p",
        "text": "[Gap L14: Valuate terms and disclaimer, live before the tool]"
      }
    ]
  },
  {
    "id": "TERMS-06",
    "blocks": [
      {
        "t": "h2",
        "text": "Links to other sites"
      },
      {
        "t": "p",
        "text": "This site may link to sites we do not own or control, such as our social media profiles."
      },
      {
        "t": "p",
        "text": "We are not responsible for their content or practices, and a link does not mean we endorse them. Their own terms and privacy policies apply."
      }
    ]
  },
  {
    "id": "TERMS-07",
    "blocks": [
      {
        "t": "h2",
        "text": "Limits on our liability"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "We provide this site \"as is\" and \"as available\", without warranties of any kind.",
            "counsel": true
          },
          {
            "text": "As far as Indian law allows, Blue Wings is not liable for any indirect, incidental, special or consequential loss that comes from using, or being unable to use, this site.",
            "counsel": true
          },
          {
            "text": "Nothing in these terms limits any liability that Indian law does not allow us to limit.",
            "counsel": true
          }
        ]
      }
    ]
  },
  {
    "id": "TERMS-08",
    "blocks": [
      {
        "t": "h2",
        "text": "Law and disputes"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "Indian law governs these terms.",
            "counsel": true
          },
          {
            "text": "The courts at Delhi have exclusive jurisdiction over any dispute about these terms or your use of this site.",
            "counsel": true
          }
        ]
      },
      {
        "t": "p",
        "text": "[Gap L11: counsel to consider a mediation or arbitration clause under the Arbitration and Conciliation Act 1996, seated in Delhi, for business clients]"
      }
    ]
  },
  {
    "id": "TERMS-09",
    "blocks": [
      {
        "t": "h2",
        "text": "Changes to these terms"
      },
      {
        "t": "p",
        "text": "We may update these terms when our services or the law change. We will post the new version here with a new effective date. If you keep using the site after a change, you accept the new terms."
      },
      {
        "t": "h3",
        "text": "Change log"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "23 September 2026. First version published."
          }
        ]
      }
    ]
  },
  {
    "id": "TERMS-10",
    "blocks": [
      {
        "t": "h2",
        "text": "Contact"
      },
      {
        "t": "p",
        "text": "For questions about these terms, email partnerships@vexadigital.in or write to Blue Wings (VEXA Digital), 77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070."
      }
    ]
  }
];

export default function TermsPage(): React.ReactElement {
  return <LegalLayout title="Terms of use" segment="TERMS-01" intro={INTRO} sections={SECTIONS} />;
}
