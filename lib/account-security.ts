import { accountConfigured } from "@/lib/deployment";
import { clientAddress } from "@/lib/request-security";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readerById } from "@/lib/accounts";
export async function currentReader() {if(!accountConfigured())return null;const session=await getServerSession(authOptions);const id=(session?.user as {id?:string}|undefined)?.id;return id?readerById(id):null;}
export function error(message:string,status=400) {return NextResponse.json({error:message},{status,headers:{"Cache-Control":"no-store"}});}
export function mutationGuard(request:Request):NextResponse|null {
 const origin=request.headers.get("origin");const expected=new URL(process.env.NEXTAUTH_URL || request.url).origin;
 if(origin!==expected || !request.headers.get("content-type")?.startsWith("application/json"))return error("This request could not be verified. Reload the page and try again.",403);
 return null;
}
export { boundedJson as readBody } from "@/lib/request-security";
export function requestIp(request:Request):string {return clientAddress(request.headers);}

/** Local reviews use one cookie origin even when opened through the other loopback alias. */
export async function canonicalPreviewAccount(path:string):Promise<void> {if(process.env.VEXA_PREVIEW!=="1" || !process.env.NEXTAUTH_URL)return;const expected=new URL(process.env.NEXTAUTH_URL),actual=(await headers()).get("host") || "";const loopback=new Set([`localhost:${expected.port}`,`127.0.0.1:${expected.port}`]);if(loopback.has(actual)&&actual!==expected.host)redirect(`${expected.origin}${path}`);}
