import { googleIdentityEnabled, googleNonceFromCookieHeader, verifyGoogleIdentity } from "@/lib/google-identity";
import { accountConfigured } from "@/lib/deployment";
import { mailEnabled } from "@/lib/account-mail";
import { clientAddress } from "@/lib/request-security";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { allowAttempt, createReader, endReaderSession, normalEmail, passwordMatches, readerByEmail, readerByGoogleSub, readerById, startReaderSession, validEmail, validReaderSession } from "@/lib/accounts";

/** Only advertise a provider whose required configuration is complete. */
export const googleEnabled = googleIdentityEnabled();
const legacyGoogleEnabled = process.env.GOOGLE_IDENTITY_ENABLED !== "true" && Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && accountConfigured());

export const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider({name:"Email and password",credentials:{email:{type:"email"},password:{type:"password"}},async authorize(credentials,request){
    if(!accountConfigured())return null;
    const email=normalEmail(credentials?.email),password=credentials?.password;
    const ip=clientAddress(new Headers(request.headers as Record<string,string>));
    if(!allowAttempt(`login-ip:${ip}`,30,15*60_000) || !allowAttempt(`login-email:${email}`,12,15*60_000))return null;
    if(typeof password!=="string" || password.length>128 || password.length<1 || email.length>254)return null;
    const reader=readerByEmail(email);if(!await passwordMatches(password,reader?.password_hash ?? null) || !reader)return null;
    if((process.env.NODE_ENV==="production" || mailEnabled) && !reader.email_verified)return null;
    return {id:reader.id,email:reader.email,name:reader.name};
  }}),...(googleEnabled?[CredentialsProvider({id:"google-identity",name:"Google",credentials:{credential:{type:"text"},nonce:{type:"text"}},async authorize(credentials,request){
    const requestHeaders=new Headers(request.headers as Record<string,string>);
    if(!allowAttempt(`google-login:${clientAddress(requestHeaders)}`,30,15*60_000))return null;
    const identity=await verifyGoogleIdentity(credentials?.credential,googleNonceFromCookieHeader(requestHeaders.get("cookie")),credentials?.nonce,requestHeaders.get("origin"));
    if(!identity || !validEmail(identity.email))return null;
    const linked=readerByGoogleSub(identity.sub);
    if(linked)return {id:linked.id,email:linked.email,name:linked.name};
    if(readerByEmail(identity.email))throw Error("Use your original sign-in method for this email. Google cannot be linked automatically.");
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
      try {const reader=existing || createReader(email,null,p.sub,user.name || "");user.id=reader.id;user.email=reader.email;return true;}catch{return false;}
    },
    async jwt({token,user}) {
      if(user){token.readerId=user.id;token.readerSession=startReaderSession(user.id);}
      if(typeof token.readerId!=="string" || typeof token.readerSession!=="string" || !validReaderSession(token.readerSession,token.readerId)) {delete token.readerId;delete token.readerSession;}
      return token;
    },
    async session({session,token}) {
      const reader=typeof token.readerId==="string"?readerById(token.readerId):null;
      session.user=reader?{id:reader.id,name:reader.name,email:reader.email,image:null} as typeof session.user:undefined;
      return session;
    }
  },
  events:{async signOut({token}) {if(typeof token?.readerSession==="string")endReaderSession(token.readerSession);}},
};
