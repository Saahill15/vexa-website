import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Grievance Officer",
  description:
    "Grievance officer contact details for vexadigital.in under India's IT Rules, 2021.",
};

export default function GrievanceOfficerPage(): React.ReactElement {
  return (
    <div className="pb-20">
      <PageIntro eyebrow="Legal" title="Grievance officer">
        <p>
          In accordance with the Information Technology (Intermediary Guidelines and Digital Media
          Ethics Code) Rules, 2021 and the Digital Personal Data Protection Act, 2023, the
          following Grievance Officer has been appointed for vexadigital.in.
        </p>
      </PageIntro>
      <div className="mx-auto max-w-3xl space-y-8 px-5 text-base leading-relaxed text-vx-neutral-600 md:px-8">
        <dl className="space-y-4 rounded-lg border border-vx-neutral-200 bg-vx-white p-6">
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-vx-neutral-400">
              Name
            </dt>
            <dd className="mt-1 text-vx-ink-900">Kaustubh Srivastava</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-vx-neutral-400">
              Designation
            </dt>
            <dd className="mt-1 text-vx-ink-900">Founder, VEXA Digital</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-vx-neutral-400">
              Contact email
            </dt>
            <dd className="mt-1 text-vx-ink-900">
              <a
                href="mailto:partnerships@vexadigital.in"
                className="rounded-sm font-medium text-vx-accent-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-vx-accent-500"
              >
                partnerships@vexadigital.in
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-vx-neutral-400">
              Address
            </dt>
            <dd className="mt-1 text-vx-ink-900">
              77A, LGF, Bhawani Kunj, Sector D-2, New Delhi 110070
            </dd>
          </div>
        </dl>
        <p>
          Complaints and grievances sent to the Grievance Officer are acknowledged within 24
          hours of receipt and resolved within 15 days, in line with the Information Technology
          (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the Digital
          Personal Data Protection Act, 2023.
        </p>
      </div>
    </div>
  );
}
