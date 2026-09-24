import type { Metadata } from "next";
import { type LegalBlock } from "@/components/LegalBlocks";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Grievance officer",
  description: "How to complain to the VEXA Grievance Officer about this site or about how we handle your personal data.",
  alternates: { canonical: "/legal/grievance-officer" },
};

const INTRO: readonly LegalBlock[] = [
  {
    "t": "p",
    "text": "If you have a complaint about this site or about how we handle your personal data, write to our Grievance Officer."
  },
  {
    "t": "ul",
    "items": [
      {
        "text": "The Grievance Officer is named under the DPDP Act 2023 and rule 5(9) of the SPDI Rules 2011.",
        "counsel": true
      }
    ]
  }
];

const SECTIONS: readonly { id: string; blocks: readonly LegalBlock[] }[] = [
  {
    "id": "GRIEV-02",
    "blocks": [
      {
        "t": "kv",
        "rows": [
          [
            "Name",
            "Kaustubh Srivastava"
          ],
          [
            "Role",
            "Founder, VEXA Digital (a trade name of Blue Wings)"
          ],
          [
            "Email",
            "partnerships@vexadigital.in"
          ],
          [
            "Phone",
            "+91 9958895505"
          ],
          [
            "Address",
            "77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070"
          ]
        ]
      }
    ]
  },
  {
    "id": "GRIEV-03",
    "blocks": [
      {
        "t": "h2",
        "text": "How to complain"
      },
      {
        "t": "p",
        "text": "Email the Grievance Officer with \"Grievance\" in the subject line. Tell us who you are, what happened and what you would like us to do."
      },
      {
        "t": "h2",
        "text": "What happens next"
      },
      {
        "t": "ul",
        "items": [
          {
            "text": "We acknowledge your complaint within 24 hours.",
            "counsel": true
          },
          {
            "text": "We resolve it within 15 days.",
            "counsel": true
          },
          {
            "text": "If you are not satisfied with our answer, you can complain to the Data Protection Board of India.",
            "counsel": true
          }
        ]
      }
    ]
  }
];

export default function GrievanceOfficerPage(): React.ReactElement {
  return <LegalLayout title="Grievance officer" segment="GRIEV-01" intro={INTRO} sections={SECTIONS} />;
}
