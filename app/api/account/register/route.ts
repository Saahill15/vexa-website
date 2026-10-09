export const dynamic="force-dynamic";
import { accountConfigured } from "@/lib/deployment";
import { NextResponse } from "next/server";
import { allowAttempt, createReader, hashPassword, normalEmail, validEmail, validPassword } from "@/lib/accounts";
import { deliverAccountLink, mailEnabled } from "@/lib/account-mail";
import { error, mutationGuard, readBody, requestIp } from "@/lib/account-security";
export async function POST(request:Request) {
 const blocked=mutationGuard(request);if(blocked)return blocked;
 if(!accountConfigured() || (process.env.NODE_ENV==="production" && !mailEnabled))return error("Account registration is temporarily unavailable.",503);
 if(!allowAttempt(`register:${requestIp(request)}`,5,3600_000))return error("Too many attempts. Please try again in an hour.",429);
 try {const body=await readBody(request),email=normalEmail(body.email);
  if(!validEmail(email))return error("Enter a valid email address.");
  if(!validPassword(body.password))return error("Use a password with 12 to 128 characters.");
  if(body.consent!==true)return error("Agree to the account and profile notice to continue.");
  const hash=await hashPassword(body.password);
  // Hash even on duplicates so account existence is not revealed through a fast response.
  let reader;try {reader=createReader(email,hash,null);}catch{return error("An account could not be created with these details. If you already registered, try signing in.",409);}
  if(mailEnabled){try{await deliverAccountLink(reader,"verify");}catch{return error("Your account was saved, but we could not send the verification email. Use resend verification to try again.",503);}}
  return NextResponse.json({ok:true,verificationRequired:mailEnabled},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch {return error("Check your account details and try again.");}
}
