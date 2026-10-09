"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AccountForm, type Profile } from "@/components/account/AccountForm";
import styles from "@/components/account/Account.module.css";
export function Gate({slug,googleEnabled,profile}:{slug:string;googleEnabled:boolean;profile?:Profile|null}){
 const checkpoint=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),[opened,setOpened]=useState(false),[dismissed,setDismissed]=useState(false);
 const returnTo=`/learn/${slug}#continue`;
 function open(){if(!dialog.current?.open){dialog.current?.showModal();setOpened(true);}}
 useEffect(()=>{if(dismissed||opened||!checkpoint.current)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){dialog.current?.showModal();setOpened(true);observer.disconnect();}},{threshold:.35});observer.observe(checkpoint.current);return()=>observer.disconnect();},[dismissed,opened]);
 function close(){dialog.current?.close();setDismissed(true);trigger.current?.focus({preventScroll:true});}
 return <div ref={checkpoint} id="continue" className={styles.card}><h2>Continue reading for free</h2><p>{profile?"Complete your profile to finish the article and join the discussion.":"Create a reader profile or sign in to finish this article and join the discussion."}</p><button ref={trigger} className={styles.button} onClick={open}>{profile?"Complete your profile":"Sign in or create an account"}</button><noscript><p><Link href={`/account?returnTo=${encodeURIComponent(returnTo)}`}>Continue to your reader account</Link></p></noscript><p className={styles.notice}>Your name and self-reported role will be public. Your email stays private. No marketing subscription.</p><dialog ref={dialog} className={styles.dialog} aria-label="Continue reading with a reader account" onCancel={event=>{event.preventDefault();close();}}><button type="button" className={styles.close} onClick={close} aria-label="Close account dialog">Close ✕</button>{opened?<AccountForm profile={profile} googleEnabled={googleEnabled} returnTo={returnTo}/>:null}</dialog></div>;
}
