export const dynamic="force-dynamic";
import { notFound } from "next/navigation";
import { currentReader } from "@/lib/account-security";
import { Moderation } from "@/components/comments/Moderation";
import styles from "@/components/account/Account.module.css";
export default async function ModerationPage(){const reader=await currentReader();if(!reader?.moderator)notFound();return <section className={styles.shell}><h1 className="font-display text-[36px]">Comment moderation</h1><Moderation/></section>;}
