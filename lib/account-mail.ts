import { createHash, randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
export const mailEnabled=Boolean(process.env.ACCOUNT_MAIL_WEBHOOK_URL && process.env.ACCOUNT_MAIL_WEBHOOK_TOKEN);
export type Purpose="verify"|"reset";
const digest=(token:string)=>createHash("sha256").update(token).digest("hex");
export async function deliverAccountLink(reader:{id:string;email:string},purpose:Purpose):Promise<void>{
 if(!mailEnabled)throw Error("Account email delivery unavailable");
 const token=randomBytes(32).toString("hex"),hash=digest(token),db=getDb(),now=Date.now();
 db.transaction(()=>{db.prepare("DELETE FROM reader_tokens WHERE expires_at<? OR (reader_id=? AND purpose=?)").run(now,reader.id,purpose);db.prepare("INSERT INTO reader_tokens VALUES(?,?,?,?)").run(hash,reader.id,purpose,now+(purpose==="verify"?24*3600_000:30*60_000));})();
 const url=new URL(`/account/${purpose}?token=${token}`,process.env.NEXTAUTH_URL);
 try {const response=await fetch(process.env.ACCOUNT_MAIL_WEBHOOK_URL!,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.ACCOUNT_MAIL_WEBHOOK_TOKEN}`},body:JSON.stringify({to:reader.email,purpose,link:url.toString()}),signal:AbortSignal.timeout(20_000),redirect:"error"});if(!response.ok)throw Error("Mail service rejected delivery");}catch{db.prepare("DELETE FROM reader_tokens WHERE hash=?").run(hash);throw Error("Account email could not be sent");}
}
export function consumeAccountToken(token:unknown,purpose:Purpose,passwordHash?:string):boolean {if(typeof token!=="string"||!/^([a-f0-9]{64})$/.test(token))return false;const db=getDb();return db.transaction(()=>{const row=db.prepare("SELECT reader_id FROM reader_tokens WHERE hash=? AND purpose=? AND expires_at>?").get(digest(token),purpose,Date.now()) as {reader_id:string}|undefined;if(!row)return false;if(purpose==="verify")db.prepare("UPDATE readers SET email_verified=1 WHERE id=?").run(row.reader_id);else{if(!passwordHash)return false;db.prepare("UPDATE readers SET password_hash=?,email_verified=1 WHERE id=? AND password_hash IS NOT NULL").run(passwordHash,row.reader_id);db.prepare("DELETE FROM reader_sessions WHERE reader_id=?").run(row.reader_id);}db.prepare("DELETE FROM reader_tokens WHERE reader_id=?").run(row.reader_id);return true;})();}
