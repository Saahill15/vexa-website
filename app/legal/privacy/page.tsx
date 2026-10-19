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
  {t:"p", text:"VEXA’s website and Valuate use separate accounts. If you choose Google sign-in, each service receives your Google account identifier, name and verified email address to sign you in. Google does not share your password. This policy covers the VEXA website. Valuate has its own privacy policy and terms.", links:[{href:"https://valuate.vexadigital.in/privacy",label:"Valuate privacy policy"},{href:"https://valuate.vexadigital.in/terms",label:"Valuate terms"}]},

  {
    "t": "p",
    "text": "Last updated 17 October 2026."
  },
  {
    "t": "h3",
    "text": "Summary"
  },
  {
    "t": "p",
    "text": "We use the details you provide to answer enquiries, manage your reader account, open full articles and support the discussion below them. Your public profile shows your chosen name and self-described role. Workplace details are private unless you choose to display them. Your email is not shown with your comments. Registration does not subscribe you to marketing. We also keep essential security and server records. To ask about your information or request a correction or deletion, write to partnerships@vexadigital.in."
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
        "text": "When you create a reader account or comment"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "your email address, a one-way hash of your password for email accounts, and the information needed to manage your sign-in session"
          },
          {
            "text": "your chosen public name and self-described role: brand professional, esports professional or gaming enthusiast; optional job, industry and organisation details, with a separate choice about displaying them publicly"
          },
          {
            "text": "the comments you submit, the article they belong to, their review status and the times they were created or changed"
          },
          {
            "text": "if Google sign-in is enabled and you use it, your Google account identifier, name and email address, including the email verification status. Google does not share your password with us. Email/password readers verify their inbox through a single-use link. Password recovery uses an expiring email link and ends existing reader sessions"
          }
        ]
      },
      {
        "t": "h3",
        "text": "When you email us"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "your name, email address and the information you choose to include"
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
            "text": "This site is for people aged 18 and over. If you are younger, a parent or guardian must agree before you give us your details. We do not knowingly keep the details of anyone under 18 without that agreement.",
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
            "text": "arrange a conversation about the services you asked about"
          },
          {
            "text": "manage your reader account and profile, provide full article access, and review and display comments"
          },
          {
            "text": "understand the professional interests readers choose to share, maintain sign-in security and limit abuse"
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
            "text": "We keep enquiries, account and profile records, comments and server logs for the purpose they were provided, subject to applicable retention requirements. A comment you delete through your account is permanently erased, and deleting your account erases all of your comments. A comment removed by a moderator is hidden from readers; that record, with who removed it and when, is kept for review and security until you ask us to delete it. You can ask us to delete your account and related personal data by email.",
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
        "text": "Your chosen name and self-described role form your public reader profile. If you opt to display your workplace details, those appear there too. Approved comments are readable by other signed-in readers and link to that public profile. Pending comments are visible to you and authorised moderators; other readers do not see them. Your email is never included in the public profile or comment list."
      },
      {
        "t": "p",
        "text": "We do not sell your data. Beyond the public information you choose to share, we share it only with:"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "service providers needed to run our email, website hosting and account access. If you choose Google sign-in, Google also handles that sign-in under its own policies"
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
        "text": "The site uses essential sign-in and security cookies to remember your account, protect sign-in requests and return you to the article you were reading. These are needed for full article access and comments. The current site does not install advertising or analytics cookies."
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
            "text": "17 October 2026. Clarified what happens when you delete a comment and when a moderator removes one."
          },
          {
            "text": "8 October 2026. Updated the reader account, public profile, comment and essential cookie descriptions."
          }
        ]
      }
    ]
  }
];

export default function PrivacyPage(): React.ReactElement {
  return <LegalLayout title="Privacy policy" segment="PRIV-01" intro={INTRO} sections={SECTIONS} />;
}
