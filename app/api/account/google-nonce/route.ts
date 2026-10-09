import { NextResponse } from "next/server";
import { allowAttempt } from "@/lib/accounts";
import { clientAddress } from "@/lib/request-security";
import { googleIdentityEnabled, googleNonceCookie, GOOGLE_NONCE_TTL, identityOriginMatches, issueGoogleNonce } from "@/lib/google-identity";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const headers = {"Cache-Control": "private, no-store"};
  if (!googleIdentityEnabled()) return NextResponse.json({error: "Google sign-in is unavailable."}, {status: 503, headers});
  if (!identityOriginMatches(request.headers.get("origin"))) return NextResponse.json({error: "Reload the page and try again."}, {status:403, headers});
  if (!allowAttempt(`google-nonce:${clientAddress(request.headers)}`,60,15*60_000)) return NextResponse.json({error: "Please wait before trying again."}, {status:429, headers});
  try {
    const nonce = issueGoogleNonce();
    const response = NextResponse.json({nonce, clientId: process.env.GOOGLE_CLIENT_ID}, {headers});
    response.cookies.set(googleNonceCookie(), nonce, {httpOnly:true, secure:process.env.NODE_ENV === "production", sameSite:"strict", path:"/", maxAge:GOOGLE_NONCE_TTL/1000});
    return response;
  } catch {return NextResponse.json({error:"Please wait before trying again."},{status:429,headers});}
}
