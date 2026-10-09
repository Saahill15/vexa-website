export const dynamic="force-dynamic";
import { NextResponse } from "next/server";
import { completeReader, safeReturnTo } from "@/lib/accounts";
import { currentReader } from "@/lib/account-security";
export async function GET(request:Request){const reader=await currentReader(),returnTo=safeReturnTo(new URL(request.url).searchParams.get("returnTo"));const path=reader&&completeReader(reader)?returnTo:`/account?returnTo=${encodeURIComponent(returnTo)}`;const origin=process.env.NEXTAUTH_URL || request.url;return NextResponse.redirect(new URL(path,origin),{status:303,headers:{"Cache-Control":"no-store"}});}
