export const dynamic="force-dynamic";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { error, readBody } from "@/lib/account-security";
import { moderateComment } from "@/lib/admin-data";
import { actorOf, staffApi } from "@/lib/staff";
// The original moderator queue (/account/moderation). Same checks as /admin (recent staff sign-in, comment
// permission, same-origin JSON for changes) and the same audited decision path as /admin/comments.
export async function GET(request:Request){const {response}=await staffApi(request,"comments",{mutation:false});if(response)return response;return NextResponse.json({comments:getDb().prepare("SELECT c.id,c.slug,c.body,c.created_at,r.name FROM reader_comments c JOIN readers r ON r.id=c.reader_id WHERE c.status='pending' ORDER BY c.created_at ASC LIMIT 100").all()},{headers:{"Cache-Control":"no-store"}});}
export async function PATCH(request:Request){const {staff,response}=await staffApi(request,"comments");if(response)return response;try{const b=await readBody(request);if(typeof b.id!=="string"||!["approved","rejected"].includes(String(b.status)))return error("Choose approve or reject.");const result=moderateComment(b.id,b.status==="approved"?"approve":"reject",{...actorOf(staff),id:staff.id,role:staff.role});if(result==="own_comment")return error("Another moderator needs to review your own comment.",403);return result==="ok"?NextResponse.json({ok:true}):error("Pending comment not found.",404);}catch{return error("Invalid moderation request.");}}
