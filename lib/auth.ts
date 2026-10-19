import { googleIdentityEnabled, googleNonceFromCookieHeader, verifyGoogleIdentity } from "@/lib/google-identity";
import { accountConfigured } from "@/lib/deployment";
import { mailEnabled } from "@/lib/account-mail";
import { clientAddress } from "@/lib/request-security";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { allowAttempt, allowClient, createReader, endReaderSession, normalEmail, passwordMatches, readerByEmail, readerByGoogleSub, readerById, readerSessionCreatedAt, limitReached, startReaderSession, validEmail, validReaderSession, type Reader } from "@/lib/accounts";
import { audit } from "@/lib/audit";
import { registrationOpen } from "@/lib/settings";

const isStaff=(reader:Reader)=>Boolean(reader.admin || reader.moderator);
/** Staff sign-in outcomes are audited; failures are capped per account so a password-guessing run cannot flood the log. */
function auditStaffSignIn(reader:Reader,outcome:"auth.sign_in"|"auth.sign_in_failed"|"auth.sign_in_blocked",method:string):void {
  try {if(outcome!=="auth.sign_in" && !allowAttempt(`audit-signin:${reader.id}`,5,15*60_000))return;audit({id:reader.id,label:reader.email},outcome,{type:"user",id:reader.id},{method});}catch{console.error("staff sign-in audit failed");}
}

/** Only advertise a provider whose required configuration is complete. */
export const googleEnabled = googleIdentityEnabled();
const legacyGoogleEnabled = process.env.GOOGLE_IDENTITY_ENABLED !== "true" && Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && accountConfigured());

export const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider({name:"Email and password",credentials:{email:{type:"email"},password:{type:"password"}},async authorize(credentials,request){
    if(!accountConfigured())return null;
    const email=normalEmail(credentials?.email),password=credentials?.password;
    const ip=clientAddress(new Headers(request.headers as Record<string,string>));
    // Failed guesses are counted per address when it is trusted, otherwise against one high site-wide ceiling;
    // successful sign-ins never use up that budget. Every account keeps its own limit of 12 attempts per 15 minutes.
    const failKey=ip==="unknown"?"login-fail:shared":`login-fail:${ip}`,failMax=ip==="unknown"?600:30;
    if(limitReached(failKey,failMax) || !allowAttempt(`login-email:${email}`,12,15*60_000))return null;
    if(typeof password!=="string" || password.length>128 || password.length<1 || email.length>254)return null;
    const reader=readerByEmail(email);const matches=await passwordMatches(password,reader?.password_hash ?? null);
    if(!reader || !matches){allowAttempt(failKey,failMax,15*60_000);if(reader && isStaff(reader))auditStaffSignIn(reader,"auth.sign_in_failed","password");return null;}
    if((process.env.NODE_ENV==="production" || mailEnabled) && !reader.email_verified)return null;
    if(reader.disabled_at){if(isStaff(reader))auditStaffSignIn(reader,"auth.sign_in_blocked","password");return null;}
    if(isStaff(reader))auditStaffSignIn(reader,"auth.sign_in","password");
    return {id:reader.id,email:reader.email,name:reader.name};
  }}),...(googleEnabled?[CredentialsProvider({id:"google-identity",name:"Google",credentials:{credential:{type:"text"},nonce:{type:"text"}},async authorize(credentials,request){
    const requestHeaders=new Headers(request.headers as Record<string,string>);
    if(!allowClient(clientAddress(requestHeaders),"google-login",30,600,15*60_000))return null;
    const identity=await verifyGoogleIdentity(credentials?.credential,googleNonceFromCookieHeader(requestHeaders.get("cookie")),credentials?.nonce,requestHeaders.get("origin"));
    if(!identity || !validEmail(identity.email))return null;
    const linked=readerByGoogleSub(identity.sub);
    if(linked){if(linked.disabled_at)return null;if(isStaff(linked))auditStaffSignIn(linked,"auth.sign_in","google");return {id:linked.id,email:linked.email,name:linked.name};}
    if(readerByEmail(identity.email))throw Error("Use your original sign-in method for this email. Google cannot be linked automatically.");
    if(!registrationOpen())throw Error("New account registration is currently closed.");
    try {const reader=createReader(identity.email,null,identity.sub,identity.name);return {id:reader.id,email:reader.email,name:reader.name};}catch{return null;}
  }})]:[]),...(legacyGoogleEnabled?[GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID as string, clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, allowDangerousEmailAccountLinking:false })]:[])],
  session: { strategy: "jwt", maxAge: 30*24*3600 },
  cookies: Object.fromEntries([['sessionToken','session'],['csrfToken','csrf'],['callbackUrl','callback'],['pkceCodeVerifier','pkce'],['state','state'],['nonce','nonce']].map(([key,suffix])=>[key,{name:`${process.env.NODE_ENV==='production'?'__Host-':''}vexa-public-${suffix}`,options:{httpOnly:true,sameSite:'lax',path:'/',secure:process.env.NODE_ENV==='production',...(suffix==='pkce'||suffix==='state'||suffix==='nonce'?{maxAge:900}:{})}}])) as NextAuthOptions['cookies'],
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.NEXTAUTH_SECRET,
  logger: {error(code){console.error("reader authentication failed",code);},warn(code){console.warn("reader authentication warning",code);},debug(){}},
  pages: { signIn:"/account", error:"/account" },
  callbacks:{
    async signIn({account,profile,user}) {
      if(account?.provider!=="google")return true;
      const p=profile as {email?:string;email_verified?:boolean;sub?:string}|undefined;
      if(!p?.email_verified || !p.sub)return false;
      const email=normalEmail(p.email);if(!validEmail(email))return false;const linked=readerByGoogleSub(p.sub);const existing=linked || readerByEmail(email);
      // A verified Google address must never take over a password account with the same email.
      if(existing && existing.google_sub!==p.sub)return false;
      if(existing?.disabled_at || (!existing && !registrationOpen()))return false;
      try {const reader=existing || createReader(email,null,p.sub,user.name || "");user.id=reader.id;user.email=reader.email;return true;}catch{return false;}
    },
    async jwt({token,user}) {
      // A fresh sign-in replaces, rather than orphans, the session this browser held before.
      if(user){if(typeof token.readerSession==="string")endReaderSession(token.readerSession);token.readerId=user.id;token.readerSession=startReaderSession(user.id);}
      if(typeof token.readerId!=="string" || typeof token.readerSession!=="string" || !validReaderSession(token.readerSession,token.readerId)) {delete token.readerId;delete token.readerSession;}
      return token;
    },
    async session({session,token}) {
      const found=typeof token.readerId==="string"?readerById(token.readerId):null,reader=found&&!found.disabled_at?found:null;
      session.user=reader?{id:reader.id,name:reader.name,email:reader.email,image:null} as typeof session.user:undefined;
      // When this browser last signed in. Server-side admin checks require a recent sign-in.
      (session as typeof session&{authTime?:number|null}).authTime=reader&&typeof token.readerSession==="string"?readerSessionCreatedAt(token.readerSession):null;
      return session;
    }
  },
  events:{async signOut({token}) {if(typeof token?.readerSession==="string")endReaderSession(token.readerSession);}},
};
