"""Production account/content protection checks against an existing isolated build.
Set VEXA_PRODUCTION_BUILD_DIR to the parent-verified build directory. No live data used.
"""
import html,json,os,re,secrets,socket,sqlite3,subprocess,tempfile,time,urllib.error,urllib.parse,urllib.request
from pathlib import Path
from http.server import HTTPServer,BaseHTTPRequestHandler
from threading import Thread
messages=[]
mail_bearer=secrets.token_hex(32)
class Mail(BaseHTTPRequestHandler):
 def do_POST(self):
  if self.headers.get("Authorization")!="Bearer "+mail_bearer:self.send_response(403);self.end_headers();return
  messages.append(json.loads(self.rfile.read(int(self.headers["Content-Length"]))));self.send_response(200);self.end_headers();self.wfile.write(b"{}")
 def log_message(self,*args):pass
mail_server=HTTPServer(("127.0.0.1",0),Mail);Thread(target=mail_server.serve_forever,daemon=True).start()
root=Path(__file__).resolve().parent.parent
build=os.environ.get('VEXA_PRODUCTION_BUILD_DIR','.next-account-production')
assert (root/build/'BUILD_ID').exists(),'Create the named production build before running this probe.'
source=(root/'content/learn/team-or-tournament.ts').read_text();full=source.split('"full":',1)[1];marker=re.search(r'"body":\s*\[\s*"([^"\n]+)',full).group(1)
for mode in ['missing-secrets','lead-secret-only','account-no-mail','account-secret']:
 with tempfile.TemporaryDirectory(prefix='vexa-account-production-check-') as directory:
  with socket.socket() as reserved:reserved.bind(('127.0.0.1',0));port=reserved.getsockname()[1]
  base=f'http://127.0.0.1:{port}'
  env=dict(os.environ,ACCOUNT_MAIL_WEBHOOK_URL=f'http://127.0.0.1:{mail_server.server_port}/mail' if mode=='account-secret' else '',ACCOUNT_MAIL_WEBHOOK_TOKEN=mail_bearer if mode=='account-secret' else '',VEXA_TRUST_PROXY='0',NODE_ENV='production',VEXA_PREVIEW='1',VEXA_BUILD_DIR=build,VEXA_DATA_DIR=directory,NEXTAUTH_URL=base,NEXTAUTH_SECRET=secrets.token_hex(32) if mode in ['account-secret','account-no-mail'] else '',LEAD_COOKIE_SECRET=secrets.token_hex(32) if mode=='lead-secret-only' else '',GOOGLE_CLIENT_ID='',GOOGLE_CLIENT_SECRET='',CONTACT_WEBHOOK_URL='',CONTACT_WEBHOOK_TOKEN='')
  cookies={}
  def request(path,payload=None,form=False,carry=False):
   headers={'Origin':base}
   if carry and cookies:headers['Cookie']='; '.join(k+'='+v for k,v in cookies.items())
   if payload is not None:headers['Content-Type']='application/x-www-form-urlencoded' if form else 'application/json'
   data=(urllib.parse.urlencode(payload) if form else json.dumps(payload)).encode() if payload is not None else None
   try:r=urllib.request.urlopen(urllib.request.Request(base+path,data=data,headers=headers),timeout=15)
   except urllib.error.HTTPError as error:r=error
   for value in r.headers.get_all('Set-Cookie',[]):
    pair=value.split(';',1)[0];key,value=pair.split('=',1);cookies[key]=value
   return r.status,r.headers,r.read().decode()
  with tempfile.TemporaryFile() as log:
   child=subprocess.Popen(['node','node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',str(port)],cwd=root,env=env,stdout=log,stderr=log)
   try:
    for _ in range(150):
     try:
      if request('/learn/team-or-tournament')[0]==200:break
     except OSError:pass
     if child.poll() is not None:raise AssertionError('Temporary production server exited')
     time.sleep(.1)
    else:raise AssertionError('Temporary production server did not become ready')
    status,_,preview=request('/learn/team-or-tournament');assert status==200 and marker not in preview and html.escape(marker,quote=False) not in preview
    payload={'email':'production-reader@example.invalid','password':'Synthetic-production-password-54','consent':True}
    status,_,_=request('/api/account/register',payload)
    if mode!='account-secret':
     assert status==503
     assert request('/api/account/profile')[0]==401
     assert request('/api/auth/session')[0]==(200 if mode=='account-no-mail' else 503)
     if mode=='lead-secret-only':
      status,headers,_=request('/api/lead',{'email':'unverified-lead@example.invalid','role':'brand','consent':True,'slug':'team-or-tournament'})
      assert status==200 and 'Secure' in headers.get('Set-Cookie','') and 'HttpOnly' in headers.get('Set-Cookie','')
      status,_,lead_page=request('/learn/team-or-tournament',carry=True)
      assert status==200 and marker not in lead_page and html.escape(marker,quote=False) not in lead_page and request('/api/account/profile',carry=True)[0]==401
     print('PASS production '+mode+': public preview renders, no full prose, account access fails closed',flush=True)
    else:
     assert status==201
     csrf=json.loads(request('/api/auth/csrf',carry=True)[2])['csrfToken']
     status,headers,body=request('/api/auth/callback/credentials',{'csrfToken':csrf,'email':payload['email'],'password':payload['password'],'json':'true'},form=True,carry=True)
     assert request('/api/account/profile',carry=True)[0]==401,'Unverified production account must not sign in'
     token=urllib.parse.parse_qs(urllib.parse.urlparse(messages[-1]['link']).query)['token'][0]
     assert request('/api/account/email',{'action':'verify','token':token})[0]==200
     csrf=json.loads(request('/api/auth/csrf',carry=True)[2])['csrfToken']
     status,headers,body=request('/api/auth/callback/credentials',{'csrfToken':csrf,'email':payload['email'],'password':payload['password'],'json':'true'},form=True,carry=True)
     assert any('__Host-vexa-public-session' in k for k in cookies), 'Production session cookie must be unique and Secure'
     assert 'Domain=' not in str(headers) and 'Secure' in str(headers)
     status,_,profile=request('/api/account/profile',carry=True);assert status==200 and not json.loads(profile)['complete']
     status,_,incomplete=request('/learn/team-or-tournament',carry=True);assert status==200 and marker not in incomplete
     assert request('/api/account/profile',{'name':'Production Test Reader','role':'enthusiast','industry':'','job':'','organisation':'','publicDetails':False,'consent':True},carry=True)[0]==405 # POST cannot substitute for PATCH.
     headers={'Origin':base,'Content-Type':'application/json','Cookie':'; '.join(k+'='+v for k,v in cookies.items())}
     data=json.dumps({'name':'Production Test Reader','role':'enthusiast','industry':'','job':'','organisation':'','publicDetails':False,'consent':True}).encode()
     with urllib.request.urlopen(urllib.request.Request(base+'/api/account/profile',data=data,headers=headers,method='PATCH')) as r:assert r.status==200
     status,_,complete=request('/learn/team-or-tournament',carry=True);assert status==200 and (marker in complete or html.escape(marker,quote=False) in complete)
     print('PASS production account-secret: Secure real sign-in, incomplete gate, profile save unlocks full article',flush=True)
   finally:
    child.terminate()
    try:child.wait(timeout=5)
    except subprocess.TimeoutExpired:child.kill();child.wait()

mail_server.shutdown()
