export const dynamic="force-dynamic";
import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { accountConfigured } from "@/lib/deployment";
const handler=NextAuth(authOptions);
async function configuredHandler(request:NextRequest,context:{params:Promise<{nextauth:string[]}>}){
 if(!accountConfigured())return NextResponse.json({error:"Reader accounts are temporarily unavailable."},{status:503});
 if(request.method==="POST"){
  if(request.headers.get("origin")!==new URL(process.env.NEXTAUTH_URL || request.url).origin)return NextResponse.json({error:"Invalid request origin."},{status:403});
  const stream=request.body?.getReader(),chunks:Uint8Array[]=[];let size=0;
  if(stream)while(true){const part=await stream.read();if(part.done)break;size+=part.value.length;if(size>16000){await stream.cancel();return NextResponse.json({error:"Request too large."},{status:413});}chunks.push(part.value);}
  request=new NextRequest(request.url,{method:"POST",headers:request.headers,body:Buffer.concat(chunks)});
 }
 return handler(request,{params:await context.params});
}
export {configuredHandler as GET,configuredHandler as POST};
