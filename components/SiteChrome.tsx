"use client";
import { usePathname } from "next/navigation";

/** The public header, footer and preview notice belong to the website, not to the admin area. */
export function PublicOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname === "/admin" || pathname?.startsWith("/admin/") ? null : <>{children}</>;
}
