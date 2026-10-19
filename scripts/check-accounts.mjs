// Isolated, disposable HTTP security probe. Never points at preview or production data.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const root=process.cwd(),originalTsconfig=readFileSync(path.join(root,'tsconfig.json'),'utf8'),port='3323',data=mkdtempSync(path.join(tmpdir(),'vexa-account-test-')),base=`http://localhost:${port}`;
const mailToken=randomBytes(32).toString('hex');
const mailbox=path.join(data,'synthetic-mail.json');writeFileSync(mailbox,'[]');
const mailServer=createServer(async(req,res)=>{if(req.headers.authorization!==`Bearer ${mailToken}`){res.writeHead(403).end();return;}let body='';for await(const chunk of req)body+=chunk;const messages=JSON.parse(readFileSync(mailbox,'utf8'));const payload=JSON.parse(body);messages.push({...payload,text:payload.link});writeFileSync(mailbox,JSON.stringify(messages));res.writeHead(200).end('{}');});
await new Promise(resolve=>mailServer.listen(0,'127.0.0.1',resolve));
const env={...process.env,ACCOUNT_MAIL_WEBHOOK_URL:`http://127.0.0.1:${mailServer.address().port}/mail`,ACCOUNT_MAIL_WEBHOOK_TOKEN:mailToken,VEXA_ACCOUNT_TEST_MAIL:mailbox,VEXA_TRUST_PROXY:'0',VEXA_DATA_DIR:data,VEXA_BUILD_DIR:'.next-account-check',VEXA_PREVIEW:'1',NEXTAUTH_URL:base,NEXTAUTH_SECRET:randomBytes(32).toString('base64url'),GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:'',CONTACT_WEBHOOK_URL:'',CONTACT_WEBHOOK_TOKEN:'',/* reader-account probe; staff two-step sign-in is covered by scripts/check-admin.mjs */STAFF_TOTP_REQUIRED:'false',VEXA_ACCOUNT_TEST_BASE:base,VEXA_ACCOUNT_TEST_DATA:data};
const child=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'dev','--hostname','127.0.0.1','--port',port],{env,stdio:['ignore','ignore','inherit']});
let stopped=false;child.on('exit',()=>{stopped=true;});
try {let ready=false;for(let i=0;i<600;i++){if(stopped)throw Error('Isolated test server did not start (port3323 may be occupied).');try{if((await fetch(base+'/learn/team-or-tournament')).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,200));}if(!ready)throw Error('Isolated server did not become ready.');const check=spawn('python3',[path.join(root,'scripts/check-accounts.py')],{env,stdio:'inherit'});process.exitCode=await new Promise(resolve=>check.on('exit',code=>resolve(code??1)));if(process.exitCode===0){const preview=spawn('python3',[path.join(root,'scripts/check-preview.py')],{env:{...env,VEXA_TEST_URL:base},stdio:'inherit'});process.exitCode=await new Promise(resolve=>preview.on('exit',code=>resolve(code??1)));}}finally{mailServer.close();if(!stopped){const ended=new Promise(resolve=>child.once('exit',resolve));child.kill('SIGTERM');await ended;}/* next dev adds and reorders tsconfig include entries; put the file back exactly as it was. */const configPath=path.join(root,'tsconfig.json');if(readFileSync(configPath,'utf8')!==originalTsconfig)writeFileSync(configPath,originalTsconfig);}
