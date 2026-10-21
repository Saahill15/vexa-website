import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/AuthPlaceholder";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthPlaceholder mode="login" next={next} />;
}
