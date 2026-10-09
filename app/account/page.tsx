export const dynamic="force-dynamic";
import type { Metadata } from "next";
import { googleEnabled } from "@/lib/auth";
import { canonicalPreviewAccount, currentReader } from "@/lib/account-security";
import { privateReader, safeReturnTo } from "@/lib/accounts";
import { AccountForm } from "@/components/account/AccountForm";
import styles from "@/components/account/Account.module.css";
export const metadata:Metadata={title:"Your reader account",robots:{index:false,follow:false}};
export default async function AccountPage({searchParams: queryParams}:{searchParams:Promise<{returnTo?:string;error?:string}>}){const searchParams=await queryParams;await canonicalPreviewAccount(`/account?returnTo=${encodeURIComponent(safeReturnTo(searchParams.returnTo))}`);const reader=await currentReader();return <section className={styles.shell}><h1 className="font-display text-[36px] mb-6">Your reader account</h1>{searchParams.error?<p role="alert" className={styles.error}>Sign-in could not be completed. Try your original sign-in method.</p>:null}<AccountForm profile={reader?privateReader(reader):null} googleEnabled={googleEnabled} returnTo={safeReturnTo(searchParams.returnTo)}/></section>;}
