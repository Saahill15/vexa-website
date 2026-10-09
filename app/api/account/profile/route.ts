export const dynamic="force-dynamic";
import { NextResponse } from "next/server";
import { allowAttempt, privateReader, profileInput, readerById, saveProfile } from "@/lib/accounts";
import { currentReader, error, mutationGuard, readBody } from "@/lib/account-security";
export async function GET(){const reader=await currentReader();return reader?NextResponse.json(privateReader(reader),{headers:{"Cache-Control":"no-store"}}):error("Sign in first.",401);}
export async function PATCH(request:Request){const blocked=mutationGuard(request);if(blocked)return blocked;const reader=await currentReader();if(!reader)return error("Sign in first.",401);if(!allowAttempt(`profile:${reader.id}`,20,60_000))return error("Please wait a minute before saving again.",429);try{const body=await readBody(request);if(body.consent!==true)return error("Agree to the profile notice before saving.");saveProfile(reader.id,profileInput(body));return NextResponse.json(privateReader(readerById(reader.id)!));}catch{return error("Enter a name, choose a role and keep each optional detail under 100 characters.");}}
