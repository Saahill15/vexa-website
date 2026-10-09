import os
import urllib.request,urllib.error,urllib.parse,http.cookiejar,json,re,sqlite3,html
from pathlib import Path
BASE=os.environ['VEXA_ACCOUNT_TEST_BASE']
DB=str(Path(os.environ['VEXA_ACCOUNT_TEST_DATA'])/'vexa.db')
assert Path(DB).parent.name.startswith('vexa-account-test-') and urllib.parse.urlparse(BASE).hostname in ['localhost','127.0.0.1'] and urllib.parse.urlparse(BASE).port not in [3310,80,443], 'Only isolated loopback test databases may be reset.'
results=[]
con=sqlite3.connect(DB)
for table in ['reader_tokens','reader_comments','reader_sessions','readers','account_limits']:
 if con.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?",(table,)).fetchone():con.execute('DELETE FROM '+table)
con.commit()

def client():
 jar=http.cookiejar.CookieJar();return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar)),jar
a,ja=client();b,jb=client();anon,j0=client()
def req(c,path,method='GET',data=None,origin=BASE,form=False):
 h={}
 if data is not None:
  payload=urllib.parse.urlencode(data).encode() if form else json.dumps(data).encode()
  h={'Content-Type':'application/x-www-form-urlencoded' if form else 'application/json'}
 else:payload=None
 if method!='GET' and origin is not None:h['Origin']=origin
 try:
  r=c.open(urllib.request.Request(BASE+path,payload,h,method=method));return r.status,r.read().decode(),r.headers
 except urllib.error.HTTPError as e:return e.code,e.read().decode(),e.headers

def check(label,ok):
 results.append((label,bool(ok)));print(('PASS ' if ok else 'FAIL ')+label,flush=True)
 if not ok:raise AssertionError(label)
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):return None
def redirect_response(jar,path):
 c=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar),NoRedirect());return req(c,path)
def register(c,email,name):
 return req(c,'/api/account/register','POST',{'email':email,'password':'Synthetic-test-password-3321','name':name,'role':'enthusiast','industry':'PRIVATE_INDUSTRY3321','job':'PRIVATE_JOB3321','organisation':'PRIVATE_ORG3321','publicDetails':False,'consent':True})
def login(c,email,password='Synthetic-test-password-3321'):
 code,body,_=req(c,'/api/auth/csrf');token=json.loads(body)['csrfToken'];return req(c,'/api/auth/callback/credentials','POST',{'csrfToken':token,'email':email,'password':password,'json':'true','callbackUrl':BASE+'/learn/team-or-tournament'},form=True)
slug='team-or-tournament'
check('anonymous article preview responds',req(anon,'/learn/'+slug)[0]==200)
check('registration missing Origin denied',req(anon,'/api/account/register','POST',{},origin=None)[0]==403)
check('registration foreign Origin denied',req(anon,'/api/account/register','POST',{},origin='https://evil.example')[0]==403)
check('anonymous profile denied',req(anon,'/api/account/profile')[0]==401)
check('anonymous comment denied',req(anon,'/api/comments','POST',{'slug':slug,'body':'not permitted'})[0]==401)
check('weak password denied',req(anon,'/api/account/register','POST',{'email':'short@example.invalid','password':'short','name':'Test Person','role':'enthusiast','consent':True})[0]==400)
check('register reader A',register(a,'reader-a@example.invalid','Reader A')[0]==201)
check('register reader B',register(b,'reader-b@example.invalid','Reader B')[0]==201)
code,body,_=login(a,'reader-a@example.invalid','wrong-password');check('wrong password cannot create identity',json.loads(req(a,'/api/auth/session')[1]).get('user') is None)
def mail_token(email):
 messages=json.loads(Path(os.environ['VEXA_ACCOUNT_TEST_MAIL']).read_text());return re.search(r'token=([a-f0-9]{64})',next(m['text'] for m in reversed(messages) if m['to']==email)).group(1)
login(a,'reader-a@example.invalid');check('unverified password reader denied before inbox confirmation',req(a,'/api/account/profile')[0]==401)
verify_a=mail_token('reader-a@example.invalid');verify_b=mail_token('reader-b@example.invalid')
check('verification email uses canonical site link',BASE+'/account/verify?token=' in json.loads(Path(os.environ['VEXA_ACCOUNT_TEST_MAIL']).read_text())[0]['text'])
check('mail scanner GET does not consume verification',req(anon,'/account/verify?token='+verify_a)[0]==200 and con.execute("SELECT email_verified FROM readers WHERE email='reader-a@example.invalid'").fetchone()[0]==0)
check('forged verification rejected',req(anon,'/api/account/email','POST',{'action':'verify','token':'0'*64})[0]==400)
for token in [verify_a,verify_b]:check('inbox verification token consumed',req(anon,'/api/account/email','POST',{'action':'verify','token':token})[0]==200)
check('verification replay denied',req(anon,'/api/account/email','POST',{'action':'verify','token':verify_a})[0]==400)
login(a,'reader-a@example.invalid');login(b,'reader-b@example.invalid')
initial=json.loads(req(a,'/api/account/profile')[1]);check('registration creates persistent incomplete account before profile',initial['complete']==False and initial['name']=='')
check('new account must finish onboarding before article continuation','How should we introduce you?' in req(a,'/learn/'+slug)[1] or 'Complete your profile' in req(a,'/learn/'+slug)[1])
check('incomplete account return route requires onboarding',redirect_response(ja,'/api/account/continue?returnTo=%2Flearn%2Fteam-or-tournament%23continue')[0]==303 and '/account?' in redirect_response(ja,'/api/account/continue?returnTo=%2Flearn%2Fteam-or-tournament%23continue')[2]['Location'])
check('new incomplete account cannot comment',req(a,'/api/comments','POST',{'slug':slug,'body':'not yet permitted'})[0]==401)
for c,n in [(a,'Reader A'),(b,'Reader B')]:
 check('save onboarding for '+n,req(c,'/api/account/profile','PATCH',{'name':n,'role':'enthusiast','industry':'PRIVATE_INDUSTRY3321','job':'PRIVATE_JOB3321','organisation':'PRIVATE_ORG3321','publicDetails':False,'consent':True})[0]==200)
check('complete account continuation redirects through fresh article request',redirect_response(ja,'/api/account/continue?returnTo=%2Flearn%2Fteam-or-tournament%23continue')[2]['Location']==BASE+'/learn/team-or-tournament#continue')
check('continuation cannot redirect to external destination',redirect_response(ja,'/api/account/continue?returnTo=https%3A%2F%2Fevil.example')[2]['Location']==BASE+'/learn')
pa=json.loads(req(a,'/api/account/profile')[1]);pb=json.loads(req(b,'/api/account/profile')[1]);check('authenticated persistent profile',pa['name']=='Reader A' and pa['complete'])
check('profile never exposes hash', 'password_hash' not in pa)
member=req(anon,'/members/'+pa['id'])[1];check('public profile hides email and optional private fields','reader-a@example.invalid' not in member and 'PRIVATE_' not in member)
check('public profile labels self-reported role','Self-reported' in member)
code,body,_=req(a,'/api/comments','POST',{'slug':slug,'body':'<script>alert("synthetic")</script> Useful article question.'});comment=json.loads(body)['id'];check('comment saved pending',code==201 and json.loads(body)['status']=='pending')
check('own pending comment visible',comment in req(a,'/api/comments?slug='+slug)[1])
check('other reader cannot see pending comment',comment not in req(b,'/api/comments?slug='+slug)[1])
check('other reader cannot edit comment',req(b,'/api/comments/'+comment,'PATCH',{'body':'stolen comment'})[0]==404)
check('other reader cannot delete comment',req(b,'/api/comments/'+comment,'DELETE',{})[0]==404)
check('comment foreign Origin denied',req(a,'/api/comments/'+comment,'PATCH',{'body':'csrf comment'},origin='https://evil.example')[0]==403)
check('own comment edits',req(a,'/api/comments/'+comment,'PATCH',{'body':'Edited synthetic comment, awaiting moderation.'})[0]==200)
check('unassigned reader cannot moderate',req(a,'/api/comments/moderate')[0]==403)
check('profile does not accept moderator privilege',req(a,'/api/account/profile','PATCH',{'name':'Reader A','role':'enthusiast','industry':'PRIVATE_INDUSTRY3321','job':'','organisation':'','consent':True,'moderator':True})[0]==200 and not json.loads(req(a,'/api/account/profile')[1])['moderator'])
# Test-only moderator provision in isolated DB, no staff credentials or live assignment.
con=sqlite3.connect(DB);con.execute('UPDATE readers SET moderator=1 WHERE id=?',(pb['id'],));con.commit()
check('test-provisioned moderator sees queue',comment in req(b,'/api/comments/moderate')[1])
check('moderator approves',req(b,'/api/comments/moderate','PATCH',{'id':comment,'status':'approved'})[0]==200)
check('approved comment visible to another reader',comment in req(b,'/api/comments?slug='+slug)[1])
check('editing approved comment resets moderation',req(a,'/api/comments/'+comment,'PATCH',{'body':'Edited again, back to review.'})[0]==200 and comment not in req(b,'/api/comments?slug='+slug)[1])
check('own comment delete succeeds',req(a,'/api/comments/'+comment,'DELETE',{})[0]==200)
check('overlong comment denied',req(a,'/api/comments','POST',{'slug':slug,'body':'x'*2001})[0]==400)
# Obtain any distinctive full-section sentence from source rather than assert UI wording.
source=(Path(__file__).resolve().parents[1]/'content/learn'/ (slug+'.ts')).read_text();full=source.split('"full":',1)[1];marker=re.search(r'"body":\s*\[\s*"([^"\n]+)',full).group(1);needle=html.escape(marker,quote=False)
anon_html=req(anon,'/learn/'+slug)[1];auth_html=req(a,'/learn/'+slug)[1]
check('full sentence absent from anonymous HTML/RSC',marker not in anon_html and needle not in anon_html)
check('full sentence present after real sign-in',marker in auth_html or needle in auth_html)
# Incomplete onboarding cannot unlock full content or post comments.
con.execute("UPDATE readers SET role='' WHERE id=?",(pa['id'],));con.commit()
incomplete=req(a,'/learn/'+slug)[1]
check('incomplete onboarding cannot read full article',marker not in incomplete and needle not in incomplete)
check('incomplete onboarding cannot comment',req(a,'/api/comments','POST',{'slug':slug,'body':'blocked incomplete'})[0]==401)
con.execute("UPDATE readers SET role='enthusiast' WHERE id=?",(pa['id'],));con.commit()
# Old unverified lead cookie must not unlock article.
code,lead_body,h=req(anon,'/api/lead','POST',{'email':'cookie@example.invalid','role':'brand','consent':True,'slug':slug});check('legacy lead route still works',code==200)
legacy_html=req(anon,'/learn/'+slug)[1];check('lead cookie does not authenticate or unlock',marker not in legacy_html and needle not in legacy_html and req(anon,'/api/account/profile')[0]==401)
# Revocation observed immediately despite signed JWT cookie.
con.execute('DELETE FROM reader_sessions WHERE reader_id=?',(pa['id'],));con.commit();check('revoked saved session denied immediately',req(a,'/api/account/profile')[0]==401)
check('password stored as salted scrypt not plain text',con.execute('SELECT password_hash FROM readers WHERE id=?',(pa['id'],)).fetchone()[0].startswith('scrypt:32768:8:3:'))
check('no passwords stored in session or comments',not any('Synthetic-test-password' in str(row) for row in con.execute('SELECT * FROM reader_sessions')))
# Provider readiness, NextAuth CSRF, logout and explicit public-details consent.
providers=json.loads(req(anon,'/api/auth/providers')[1]);check('Google not advertised without actual provider configuration','google' not in providers and 'credentials' in providers)
req(anon,'/api/auth/callback/credentials','POST',{'csrfToken':'forged','email':'reader-b@example.invalid','password':'Synthetic-test-password-3321','json':'true'},form=True)
check('NextAuth forged CSRF cannot sign in',json.loads(req(anon,'/api/auth/session')[1]).get('user') is None)
req(b,'/api/account/profile','PATCH',{'name':'Reader B','role':'brand','industry':'PUBLIC_INDUSTRY3321','job':'PUBLIC_JOB3321','organisation':'PUBLIC_ORG3321','publicDetails':True,'consent':True})
public_b=req(anon,'/members/'+pb['id'])[1];check('optional public profile fields require explicit choice','PUBLIC_INDUSTRY3321' in public_b and 'PUBLIC_JOB3321' in public_b and 'reader-b@example.invalid' not in public_b)
csrf=json.loads(req(b,'/api/auth/csrf')[1])['csrfToken'];req(b,'/api/auth/signout','POST',{'csrfToken':csrf,'json':'true'},form=True)
check('logout ends persisted session and account access',req(b,'/api/account/profile')[0]==401 and con.execute('SELECT count(*) FROM reader_sessions WHERE reader_id=?',(pb['id'],)).fetchone()[0]==0)
rsc=urllib.request.Request(BASE+'/learn/'+slug,headers={'RSC':'1'});rsc_body=anon.open(rsc).read().decode();check('direct unauthenticated RSC request excludes full article',marker not in rsc_body)
check('noJS article has account-link fallback','<noscript>' in anon_html and '/account?returnTo=' in anon_html)
# Rate limit is persistent in isolated SQLite.
for i in range(6):last=req(anon,'/api/account/register','POST',{'email':'invalid','password':'short'},origin=BASE)[0]
check('registration rate limit enforced',last==429)
# Concurrent registration creates exactly one identity, with duplicate rejected safely.
con.execute('DELETE FROM account_limits');con.commit()
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=2) as pool:
 responses=list(pool.map(lambda _:register(client()[0],'concurrent@example.invalid','Concurrent Reader')[0],[1,2]))
check('concurrent duplicate registration creates exactly one account',sorted(responses)==[201,409] and con.execute("SELECT count(*) FROM readers WHERE email='concurrent@example.invalid'").fetchone()[0]==1)
con.execute("UPDATE readers SET password_hash='malformed-hash' WHERE id=?",(pb['id'],));con.commit()
malformed,jm=client();login(malformed,'reader-b@example.invalid')
check('malformed password hash fails closed',req(malformed,'/api/account/profile')[0]==401)
check('verified email recorded after inbox confirmation',con.execute('SELECT email_verified FROM readers WHERE id=?',(pa['id'],)).fetchone()[0]==1)
# Recovery mail is synthetic and isolated. Real provider delivery remains separate acceptance.
con.execute('DELETE FROM account_limits');con.commit();login(a,'reader-a@example.invalid')
check('forgot password generic response',req(anon,'/api/account/email','POST',{'action':'forgot','email':'reader-a@example.invalid'})[0]==200)
reset=mail_token('reader-a@example.invalid')
check('reset tokens stored only as hashes',not con.execute('SELECT hash FROM reader_tokens WHERE hash=?',(reset,)).fetchone())
check('reset link GET does not revoke session',req(anon,'/account/reset?token='+reset)[0]==200 and req(a,'/api/account/profile')[0]==200)
check('reset weak password rejected',req(anon,'/api/account/email','POST',{'action':'reset','token':reset,'password':'short'})[0]==400)
check('valid reset succeeds',req(anon,'/api/account/email','POST',{'action':'reset','token':reset,'password':'Synthetic-new-password-3321'})[0]==200)
check('reset revokes existing session',req(a,'/api/account/profile')[0]==401)
check('reset replay denied',req(anon,'/api/account/email','POST',{'action':'reset','token':reset,'password':'Synthetic-new-password-3321'})[0]==400)
login(a,'reader-a@example.invalid');check('old password denied after reset',req(a,'/api/account/profile')[0]==401)
login(a,'reader-a@example.invalid','Synthetic-new-password-3321');check('new password signs in',req(a,'/api/account/profile')[0]==200)
con.execute('DELETE FROM account_limits');con.commit()
req(anon,'/api/account/email','POST',{'action':'forgot','email':'reader-a@example.invalid'});expired=mail_token('reader-a@example.invalid');con.execute('UPDATE reader_tokens SET expires_at=0');con.commit()
check('expired reset denied',req(anon,'/api/account/email','POST',{'action':'reset','token':expired,'password':'Synthetic-expired-password'})[0]==400)
con.execute('DELETE FROM account_limits');con.commit()
check('unknown email gets generic recovery response',req(anon,'/api/account/email','POST',{'action':'forgot','email':'unknown@example.invalid'})[1]==req(anon,'/api/account/email','POST',{'action':'forgot','email':'reader-a@example.invalid'})[1])
check('foreign origin recovery denied',req(anon,'/api/account/email','POST',{'action':'forgot','email':'reader-a@example.invalid'},origin='https://evil.example')[0]==403)
check('bounded contact rejects oversized body',req(anon,'/api/contact','POST',{'problem':'x'*17000})[0]==400)
check('contact cross-origin rejected',req(anon,'/api/contact','POST',{},origin='https://evil.example')[0]==403)
check('security headers prevent embedding',req(anon,'/')[2].get('X-Frame-Options')=='DENY')
check('account response prevents shared caching','no-store' in req(a,'/api/account/profile')[2].get('Cache-Control',''))
check('public app has unique host-only cookies',all(cookie.name.startswith('vexa-public-') and not cookie.domain_specified for cookie in ja))
check('sitemap excludes accounts and profiles','/account' not in req(anon,'/sitemap.xml')[1] and '/members/' not in req(anon,'/sitemap.xml')[1])
check('article structured data declares registration gate','reader-full-article' in anon_html and 'isAccessibleForFree' in anon_html)

# Both loopback entry aliases converge on canonical cookie origin.
alias=BASE.replace('localhost','127.0.0.1')
for route in ['/account?returnTo=%2Flearn%2Fteam-or-tournament%23continue','/learn/'+slug]:
 response=anon.open(alias+route);check('loopback alias redirects to canonical '+route.split('?')[0],response.geturl().startswith(BASE) and response.status==200)

Path(os.environ.get('VEXA_ACCOUNT_TEST_RESULTS', str(Path(DB) / 'account-http-results.json'))).write_text(json.dumps({'base':BASE,'isolated_db':DB,'checks':results},indent=2))
print(str(len(results))+' checks passed')
