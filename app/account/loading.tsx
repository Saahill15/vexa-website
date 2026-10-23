import { PageSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <section className="auth acc-page-section">
      <PageSkeleton label="Loading your account" />
    </section>
  );
}
