export const dynamic="force-dynamic";
import { notFound, redirect } from "next/navigation";
import { currentReader } from "@/lib/account-security";
import { staffRole } from "@/lib/staff";
// Moderation now lives in /admin/comments, which applies the recent sign-in and two-step checks. Non-staff still see 404.
export default async function ModerationPage(){const reader=await currentReader();if(!reader||!staffRole(reader))notFound();redirect("/admin/comments");}
