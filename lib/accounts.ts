import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { getDb } from "@/lib/db";
import { isEmail } from "@/lib/roles";

const derive=(password:string,salt:string,keylen:number,options:{N:number;r:number;p:number;maxmem:number}):Promise<Buffer>=>new Promise((resolve,reject)=>scrypt(password,salt,keylen,options,(error,key)=>error?reject(error):resolve(key)));
export const READER_ROLES = [{value:"brand",label:"Brand professional"},{value:"esports",label:"Esports professional"},{value:"enthusiast",label:"Gaming enthusiast"}] as const;
export type Reader = {id:string;email:string;password_hash:string|null;google_sub:string|null;email_verified:number;name:string;role:string;industry:string;job:string;organisation:string;public_details:number;moderator:number;contributor:number;created_at:string};
export function readerById(id:string):Reader|null { return (getDb().prepare("SELECT * FROM readers WHERE id=?").get(id) as Reader|undefined) ?? null; }
export function readerByEmail(email:string):Reader|null { return (getDb().prepare("SELECT * FROM readers WHERE email=?").get(email) as Reader|undefined) ?? null; }
export function readerByGoogleSub(sub:string):Reader|null {return (getDb().prepare("SELECT * FROM readers WHERE google_sub=?").get(sub) as Reader|undefined) ?? null;}
export function completeReader(reader:Reader):boolean { return Boolean(reader.name.trim() && READER_ROLES.some(r=>r.value===reader.role)); }
export function publicReader(r:Reader) {return {id:r.id,name:r.name,role:r.role,createdAt:r.created_at,industry:r.public_details?r.industry:"",job:r.public_details?r.job:"",organisation:r.public_details?r.organisation:""};}
export function privateReader(r:Reader) {return {...publicReader(r),email:r.email,emailVerified:Boolean(r.email_verified),industry:r.industry,job:r.job,organisation:r.organisation,publicDetails:Boolean(r.public_details),complete:completeReader(r),moderator:Boolean(r.moderator)};}
export function normalEmail(value:unknown):string {return typeof value==="string"?value.trim().toLowerCase():"";}
export function validEmail(email:string):boolean {return isEmail(email);}
export function profileInput(body:Record<string,unknown>) {
 const text=(key:string,max:number)=>{if(typeof body[key]!=="string") return ""; const value=(body[key] as string).trim();if(value.length>max || /[\u0000-\u001f\u007f]/.test(value))throw Error("Please keep your profile details within the indicated lengths.");return value;};
 const name=text("name",80),role=text("role",30);if(name.length<2 || !READER_ROLES.some(r=>r.value===role))throw Error("Enter your name and choose the role that describes you.");
 return {name,role,industry:text("industry",100),job:text("job",100),organisation:text("organisation",100),publicDetails:body.publicDetails===true};
}
export async function hashPassword(password:string):Promise<string> {
 const salt=randomBytes(16).toString("hex");const key=await derive(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024}) as Buffer;
 return `scrypt:32768:8:3:${salt}:${key.toString("hex")}`;
}
const dummyHash="scrypt:32768:8:3:00000000000000000000000000000000:"+"00".repeat(64);
export async function passwordMatches(password:string,stored:string|null):Promise<boolean> {
 const valid=typeof stored==="string" && /^scrypt:32768:8:3:[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored);
 const parts=(valid?stored:dummyHash).split(":");
 try {const key=await derive(password,parts[4],64,{N:32768,r:8,p:3,maxmem:64*1024*1024});const expected=Buffer.from(parts[5],"hex");return Boolean(valid && expected.length===key.length && timingSafeEqual(key,expected));}catch{return false;}
}
export function validPassword(value:unknown):value is string {return typeof value==="string" && value.length>=12 && value.length<=128;}
export function createReader(email:string,passwordHash:string|null,googleSub:string|null,name=""):Reader {
 const id=randomUUID();getDb().prepare("INSERT INTO readers (id,email,password_hash,google_sub,email_verified,name,created_at) VALUES (?,?,?,?,?,?,?)").run(id,email,passwordHash,googleSub,googleSub?1:0,name,new Date().toISOString());return readerById(id)!;
}
export function saveProfile(id:string,p:ReturnType<typeof profileInput>):void {getDb().prepare("UPDATE readers SET name=?,role=?,industry=?,job=?,organisation=?,public_details=? WHERE id=?").run(p.name,p.role,p.industry,p.job,p.organisation,p.publicDetails?1:0,id);}
export function allowAttempt(key:string,max:number,windowMs:number):boolean {
 const hashed=createHash("sha256").update(key).digest("hex"),now=Date.now();return getDb().transaction(()=>{
  const row=getDb().prepare("SELECT count,reset_at FROM account_limits WHERE key=?").get(hashed) as {count:number;reset_at:number}|undefined;
  if(!row || row.reset_at<=now){getDb().prepare("INSERT INTO account_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=1,reset_at=excluded.reset_at").run(hashed,now+windowMs);getDb().prepare("DELETE FROM account_limits WHERE reset_at<?").run(now);return true;}
  getDb().prepare("UPDATE account_limits SET count=count+1 WHERE key=?").run(hashed);return row.count<max;
 })();
}
export function startReaderSession(readerId:string):string {const id=randomBytes(32).toString("hex");getDb().prepare("DELETE FROM reader_sessions WHERE expires_at<?").run(Date.now());getDb().prepare("INSERT INTO reader_sessions VALUES(?,?,?)").run(id,readerId,Date.now()+30*24*3600*1000);return id;}
export function validReaderSession(id:string,readerId:string):boolean {return Boolean(getDb().prepare("SELECT id FROM reader_sessions WHERE id=? AND reader_id=? AND expires_at>?").get(id,readerId,Date.now()));}
export function endReaderSession(id:string):void {getDb().prepare("DELETE FROM reader_sessions WHERE id=?").run(id);}
export function safeReturnTo(value:unknown):string {return typeof value==="string" && /^\/learn\/[a-z0-9-]+(?:#continue)?$/.test(value)?value:"/learn";}
