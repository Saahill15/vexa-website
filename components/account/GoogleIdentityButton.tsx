"use client";
import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "./Account.module.css";
type GoogleId = {
  initialize: (options: {client_id:string;nonce:string;callback:(response:{credential:string})=>void;auto_select:boolean;ux_mode:string})=>void;
  renderButton: (element:HTMLElement, options:{type:string;theme:string;size:string;text:string;shape:string;width:number})=>void;
};
declare global {interface Window {google?:{accounts:{id:GoogleId}};}}
let loading: Promise<void> | undefined;
function loadGoogle(): Promise<void> {
  if(window.google?.accounts.id)return Promise.resolve();
  if(!loading)loading=new Promise((resolve,reject)=>{
    const script=document.createElement("script");script.src="https://accounts.google.com/gsi/client";script.async=true;
    script.onload=()=>resolve();script.onerror=()=>{loading=undefined;script.remove();reject(Error("Google could not load. Check your connection or use email below."));};document.head.appendChild(script);
  });
  return loading;
}
export function GoogleIdentityButton({onSignedIn,onError,disabled}:{onSignedIn:()=>Promise<void>;onError:(message:string)=>void;disabled:boolean}) {
  const element=useRef<HTMLDivElement>(null),callbacks=useRef({onSignedIn,onError});callbacks.current={onSignedIn,onError};
  const [status,setStatus]=useState("Loading Google sign-in…"),[attempt,setAttempt]=useState(0),[failed,setFailed]=useState(false);
  useEffect(()=>{
    let active=true,timer:ReturnType<typeof setTimeout>;
    async function initialise(){
      try {
        setFailed(false);
        const response=await fetch("/api/account/google-nonce",{method:"POST",credentials:"same-origin",cache:"no-store"});
        const config=await response.json();if(!response.ok)throw Error(config.error || "Google sign-in is unavailable. Use email below.");
        await loadGoogle();if(!active || !element.current || !window.google)return;
        window.google.accounts.id.initialize({client_id:config.clientId,nonce:config.nonce,auto_select:false,ux_mode:"popup",callback:async({credential})=>{
          if(!active)return;setStatus("Signing you in…");
          try {
            const result=await signIn("google-identity",{credential,nonce:config.nonce,redirect:false});
            if(!result?.ok)throw Error(result?.error?.startsWith("Use your original")?result.error:"Google sign-in could not be completed. Try again or use your original sign-in method.");
            await callbacks.current.onSignedIn();
          }catch(cause){if(active){callbacks.current.onError(cause instanceof Error?cause.message:"Try Google sign-in again.");setAttempt(value=>value+1);}}
        }});
        element.current.replaceChildren();
        window.google.accounts.id.renderButton(element.current,{type:"standard",theme:"outline",size:"large",text:"continue_with",shape:"pill",width:Math.min(360,Math.max(200,element.current.clientWidth))});
        setStatus("");timer=setTimeout(()=>setAttempt(value=>value+1),4*60_000);
      }catch(cause){if(active){setStatus(cause instanceof Error?cause.message:"Google could not load. Use email below.");setFailed(true);}}
    }
    void initialise();return()=>{active=false;clearTimeout(timer);};
  },[attempt]);
  return <div><p className={styles.notice}>By continuing, you agree to our <Link href="/legal/terms">terms</Link> and <Link href="/legal/privacy">privacy policy</Link>. No marketing subscription.</p><div ref={element} aria-label="Continue with Google" aria-disabled={disabled} style={disabled?{pointerEvents:"none",opacity:0.6}:undefined}/>{status?<p role="status" className={styles.notice}>{status}</p>:null}{failed?<button type="button" className={`${styles.button} ${styles.secondary}`} onClick={()=>setAttempt(value=>value+1)}>Try Google again</button>:null}</div>;
}
