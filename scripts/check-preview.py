"""Behavior checks against an explicitly isolated, running loopback review server."""
import http.cookiejar
import json
import os
import urllib.error
import urllib.parse
import urllib.request
import uuid

base = os.environ.get("VEXA_TEST_URL", "http://localhost:3310")
assert urllib.parse.urlsplit(base).hostname in ("localhost", "127.0.0.1"), "Local preview only"
jar = http.cookiejar.CookieJar()
client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
checks = 0

def request(path, payload=None, *, post=False):
    req = urllib.request.Request(base + path, method="POST" if post else "GET",
        data=json.dumps(payload).encode() if post else None,
        headers={"Content-Type": "application/json", "Origin": base})
    try:
        response = client.open(req, timeout=45)
    except urllib.error.HTTPError as error:
        response = error
    return response.status, response.headers, response.read()

def check(condition, name):
    global checks
    assert condition, name
    checks += 1
    print("PASS", name)

status, _, home = request("/")
check(status == 200 and b"Website preview for review" in home, "explicit preview required before any writes")
for path in ("/services", "/brands", "/organisations", "/about", "/contact", "/learn", "/learn/team-or-tournament", "/learn/esports-business-model", "/team-programme", "/account", "/legal/privacy", "/legal/grievance-officer"):
    status, _, body = request(path)
    check(status == 200 and b"Website preview for review" in body, path)
    check(b'href="tel:' not in body and b'instagram.com/kausticsoda' not in body.lower(), path + " has no personal phone or Instagram link")
with urllib.request.urlopen(base + "/valuate", timeout=45) as product:
    check(urllib.parse.urlsplit(product.url).port == 3400 and b"What should you charge for your next brand deal?" in product.read(), "Valuate goes directly to the local product introduction")
status, headers, image = request("/opengraph-image")
check(status == 200 and headers.get_content_type() == "image/png" and image.startswith(b"\x89PNG"), "share image")

for endpoint in ("/api/contact", "/api/lead"):
    for bad in (None, [], "invalid"):
        status, _, _ = request(endpoint, bad, post=True)
        check(status == 400, endpoint + " rejects malformed shape " + type(bad).__name__)
email = "preview-" + uuid.uuid4().hex[:10] + "@example.invalid"
brief = {"email": email, "role": "organisation", "problem": "Synthetic review application with a sample public page.",
         "interest": "Six month team programme application", "source": "/team-programme", "consent": True}
status, _, body = request("/api/contact", brief, post=True)
check(status == 200 and json.loads(body).get("ok"), "application persists through brief route")
status, _, _ = request("/api/contact", {**brief, "consent": False}, post=True)
check(status == 400, "missing consent rejected")
status, _, _ = request("/api/contact", {**brief, "role": "made-up"}, post=True)
check(status == 400, "unknown contact role rejected")

status, _, signed_out = request("/learn/page-check")
check(status == 200 and b"Does your page support the offer?" in signed_out, "useful article preview open anonymously")
check(b"Which posts support this proposal?" not in signed_out and b"Continue reading for free" in signed_out, "full article withheld until reader signs in and completes profile")
check(b"Open the full sheet" not in signed_out and b"Your offer and its evidence" not in signed_out, "obsolete worksheet removed")
status, _, body = request("/api/lead", {"email": email, "role": "player", "consent": True, "slug": "page-check"}, post=True)
check(status == 200 and json.loads(body).get("ok") and any(c.name == "vexa-public-lead" for c in jar), "legacy lead signup remains compatible")
status, _, unlocked = request("/learn/page-check")
check(status == 200 and b"Which posts support this proposal?" not in unlocked, "legacy lead cookie cannot unlock the article")
for cookie in jar:
    if cookie.name == "vexa-public-lead": cookie.value += "tamper"
status, _, tampered = request("/learn/page-check")
check(status == 200 and b"Which posts support this proposal?" not in tampered, "tampered lead cookie cannot unlock the article")
status, _, session = request("/api/auth/session")
check(status == 200 and json.loads(session) in ({}, None), "lead cookie does not create authenticated account session")
print(f"{checks} local preview behavior checks passed. Synthetic records retained in the isolated review database.")
