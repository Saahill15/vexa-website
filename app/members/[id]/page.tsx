import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { completeReader, publicReader, readerById, READER_ROLES } from "@/lib/accounts";
import styles from "@/components/account/Account.module.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Reader profile",robots:{index:false,follow:true}};
export default async function MemberPage({params: routeParams}:{params:Promise<{id:string}>}){const params=await routeParams;const reader=readerById(params.id);if(!reader||!completeReader(reader))notFound();const p=publicReader(reader);return <section className={styles.shell}><p className="vx-label">Article reader</p><h1 className="font-display text-[36px] mt-4">{p.name}</h1><p className={styles.notice}>{READER_ROLES.find(r=>r.value===p.role)?.label} · Self-reported role</p><div className={styles.profile}>{p.job?<p>{p.job}</p>:null}{p.organisation?<p>{p.organisation}</p>:null}{p.industry?<p>Industry: {p.industry}</p>:null}<p className={styles.notice}>Member since {new Date(p.createdAt).toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</p></div><Link href="/learn" className={styles.button}>Read articles</Link></section>;}
