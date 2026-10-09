export const dynamic="force-dynamic";
import type { Metadata } from "next";
import { AccountEmail } from "@/components/account/AccountEmail";
import styles from "@/components/account/Account.module.css";
export const metadata:Metadata={title:"Reader account",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){const {token}=await searchParams;return <section className={styles.shell}><AccountEmail action="reset" token={token}/></section>;}
