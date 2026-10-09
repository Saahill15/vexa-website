// Run only for an authorised, existing reader. No default or invented staff identity.
import Database from 'better-sqlite3';
import path from 'node:path';
const args=process.argv.slice(2);
if(args.length!==1||!/^[a-f0-9-]{36}$/i.test(args[0]))throw Error('Supply exactly one existing reader UUID.');
if(!process.env.VEXA_DATA_DIR)throw Error('Set VEXA_DATA_DIR to the intended website data directory first.');
const db=new Database(path.join(process.env.VEXA_DATA_DIR,'vexa.db'),{fileMustExist:true});
const reader=db.prepare('SELECT id FROM readers WHERE id=?').get(args[0]);
if(!reader)throw Error('That reader does not exist. No changes made.');
db.prepare('UPDATE readers SET moderator=1 WHERE id=?').run(args[0]);
console.log('Moderator access assigned to reader '+args[0]+'. No password or session was created.');db.close();
