import type { Metadata } from "next";
import { withShare } from "@/lib/meta";
import { ENTITY } from "@/components/entity";
import { type LegalBlock } from "@/components/LegalBlocks";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = withShare({
  title: "Privacy policy",
  description: "How Blue Wings, trading as VEXA Digital, collects, uses and protects personal data through www.vexadigital.in.",
  alternates: { canonical: "/legal/privacy" },
});

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
    "text": "We collect only what you send us through the contact form, by email or by phone, plus basic server logs. We use it to reply to you and to discuss working together. We do not sell it, and this site sets no analytics or advertising cookies. You can ask to see, correct or delete your data, and you can complain to us or to the Data Protection Board of India. Write to partnerships@vexadigital.in."
  }
];

// COUNSEL TO CONFIRM: entity line (trade name, proprietorship, proprietor, GSTIN, Udyam number) is
// copied from the GST REG-06 and Udyam certificates. The registered address on both certificates is in
// Ahmedabad and is shown as the registered place of business; Delhi is the operating office. Confirm before publication.
const SECTIONS: readonly { id: string; blocks: readonly LegalBlock[] }[] = [
  {
    "id": "PRIV-02",
    "blocks": [
      {
        "t": "h2",
        "text": "Who is responsible for your data"
      },
      {
        "t": "p",
        "text": "Blue Wings, trading as VEXA Digital (\"VEXA\", \"we\", \"us\"), is responsible for personal data collected through www.vexadigital.in."
      },
      { "t": "p", "text": ENTITY.licence, "counsel": true },
      { "t": "p", "text": ENTITY.registrations, "counsel": true },
      { "t": "p", "text": ENTITY.operatingOffice, "counsel": true },
      { "t": "p", "text": ENTITY.registeredOffice, "counsel": true },
      { "t": "p", "text": ENTITY.invoicing, "counsel": true },
      {
        "t": "ul",
        "items": [
          {
            "text": "Under the DPDP Act 2023, this makes us the data fiduciary for that data.",
            "counsel": true
          }
        ]
      }
    ]
  },
  {
    "id": "PRIV-03",
    "blocks": [
      {
        "t": "h2",
        "text": "What we collect"
      },
      {
        "t": "h3",
        "text": "Through the contact form"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "your email address, role and brief"
          },
          {
            "text": "your name, company or channel, budget range and launch date, if you give them"
          },
          {
            "text": "how you heard about us, if you tell us"
          }
        ]
      },
      {
        "t": "h3",
        "text": "When you email or call us"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "your name, email address, phone number and what you tell us"
          }
        ]
      },
      {
        "t": "h3",
        "text": "Through our web server"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "your IP address, browser type and the pages you visit, in standard server logs"
          }
        ]
      },
      {
        "t": "p",
        "text": "We do not collect payment details or government ID numbers through this site."
      },
      {
        "t": "h3",
        "text": "Children"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "This site is for business users aged 18 and over. We do not knowingly collect personal data from anyone under 18 through it.",
            "counsel": true
          }
        ]
      }
    ]
  },
  {
    "id": "PRIV-04",
    "blocks": [
      {
        "t": "h2",
        "text": "Why we use it"
      },
      {
        "t": "p",
        "text": "We use your data to:"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "reply to your enquiry"
          },
          {
            "text": "decide with you whether to work together"
          },
          {
            "text": "arrange calls and tell you about our services"
          }
        ]
      },
      {
        "t": "p",
        "text": "We do not use it for unrelated marketing without your consent, and we do not sell it."
      },
      {
        "t": "h3",
        "text": "Lawful basis"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "We process enquiry data because you give it to us voluntarily for this purpose, or with your consent where we ask for it.",
            "counsel": true
          }
        ]
      }
    ]
  },
  {
    "id": "PRIV-05",
    "blocks": [
      {
        "t": "h2",
        "text": "How long we keep it"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "We keep enquiries, client records and server logs only for as long as we need them for the purpose you gave them, or for as long as the law requires.",
            "counsel": true
          }
        ]
      },
      {
        "t": "p",
        "text": "To ask us to delete your data sooner, email partnerships@vexadigital.in. We confirm by email once your data is deleted."
      }
    ]
  },
  {
    "id": "PRIV-06",
    "blocks": [
      {
        "t": "h2",
        "text": "Who we share it with"
      },
      {
        "t": "p",
        "text": "We do not sell your data. We share it only with:"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "service providers who run our email, website hosting and contact form, under a duty to keep it confidential and use it only for us"
          },
          {
            "text": "authorities in India, when the law or a valid court or government order requires it",
            "counsel": true
          }
        ]
      }
    ]
  },
  {
    "id": "PRIV-07",
    "blocks": [
      {
        "t": "h2",
        "text": "Cookies"
      },
      {
        "t": "p",
        "text": "This site does not use analytics, advertising or tracking cookies."
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "If we add analytics later, we will update this policy first and ask for your consent where the law requires it.",
            "counsel": true
          }
        ]
      }
    ]
  },
  {
    "id": "PRIV-08",
    "blocks": [
      {
        "t": "h2",
        "text": "How we protect it"
      },
      {
        "t": "p",
        "text": "We use reasonable security practices to protect your data from unauthorised access, disclosure, change or destruction."
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "We follow the reasonable security practices duty under the IT Act 2000 and the SPDI Rules 2011.",
            "counsel": true
          },
          {
            "text": "The DPDP Act 2023 and the DPDP Rules 2025 also require reasonable security safeguards.",
            "counsel": true
          }
        ]
      },
      {
        "t": "p",
        "text": "No system is completely secure, so we cannot promise absolute security."
      },
      {
        "t": "h3",
        "text": "If there is a data breach"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "We will tell the Data Protection Board of India and each affected person.",
            "counsel": true
          },
          {
            "text": "We will tell them without delay, and send the Board a detailed report within 72 hours.",
            "counsel": true
          }
        ]
      }
    ]
  },
  {
    "id": "PRIV-09",
    "blocks": [
      {
        "t": "h2",
        "text": "Your rights"
      },
      {
        "t": "p",
        "text": "Under the DPDP Act 2023, as a data principal you can:"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "ask what personal data we hold about you",
            "counsel": true
          },
          {
            "text": "ask us to correct or update it",
            "counsel": true
          },
          {
            "text": "ask us to erase data we no longer need",
            "counsel": true
          },
          {
            "text": "withdraw consent you gave earlier, without affecting what we did before you withdrew it",
            "counsel": true
          },
          {
            "text": "nominate someone to use these rights for you if you die or cannot act",
            "counsel": true
          },
          {
            "text": "complain to us, and then to the Data Protection Board of India",
            "counsel": true
          }
        ]
      },
      {
        "t": "p",
        "text": "To use any of these rights, email partnerships@vexadigital.in."
      }
    ]
  },
  {
    "id": "PRIV-10",
    "blocks": [
      {
        "t": "h2",
        "text": "Complaints"
      },
      {
        "t": "p",
        "text": "If you have a complaint about how we handle your data, write to our Grievance Officer, Kaustubh Srivastava, at partnerships@vexadigital.in. The Grievance Officer page sets out response times."
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "If you are not satisfied with our answer, you can complain to the Data Protection Board of India.",
            "counsel": true
          }
        ]
      },
      {
        "t": "p",
        "text": "Postal address: Blue Wings (VEXA Digital), 77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070."
      }
    ]
  },
  {
    "id": "PRIV-11",
    "blocks": [
      {
        "t": "h2",
        "text": "Changes to this policy"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "We will post any update here with a new effective date, and tell you directly if a change affects how we use data you have already given us.",
            "counsel": true
          }
        ]
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
  }
];

export default function PrivacyPage(): React.ReactElement {
  return <LegalLayout title="Privacy policy" segment="PRIV-01" intro={INTRO} sections={SECTIONS} />;
}
