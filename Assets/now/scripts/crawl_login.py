#!/usr/bin/env python3
import base64, hashlib, http.cookiejar, json, os, re, secrets, sys, urllib.error, urllib.parse, urllib.request
from collections import deque
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "ref", "login")
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
CLIENT_ID = "ZU7sPN-miLujMD95LfOQ453IB0AtjM8sMyvgJ9wCXEQ"
SCOPE = "openid consent email tk_client age"
MAX_FILES = int(os.environ.get("MAX_FILES", "800"))
SKIP_EXT = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".woff", ".woff2", ".ttf")
HOSTS_SUFFIX = (".nvidia.com", ".nvgs.nvidia.com", ".nvidiagrid.net", ".geforcenow.com")

jar = http.cookiejar.CookieJar()

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None

opener = urllib.request.build_opener(NoRedirect, urllib.request.HTTPCookieProcessor(jar))

def fetch(url, data=None, headers=None):
    h = {"User-Agent": UA, "Accept": "*/*"}
    h.update(headers or {})
    req = urllib.request.Request(url, data=data, headers=h)
    try:
        r = opener.open(req, timeout=60)
    except urllib.error.HTTPError as e:
        r = e
    return r.status if hasattr(r, "status") else r.code, dict(r.headers), r.read()

def save(url, body, ctype):
    p = urllib.parse.urlparse(url)
    path = p.path
    if path.endswith("/") or not path:
        path += "index.html"
    elif "html" in ctype.lower() and not os.path.splitext(path)[1]:
        path += ".html"
    if p.query:
        stem, ext = os.path.splitext(path)
        path = stem + "__" + hashlib.md5(p.query.encode()).hexdigest()[:8] + (ext or ".html")
    dest = os.path.normpath(os.path.join(OUT, p.netloc, path.lstrip("/")))
    if not dest.startswith(OUT):
        return None
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest, "wb").write(body)
    return dest

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for k in ("src", "href", "data-src", "action"):
            if a.get(k):
                self.urls.append(a[k])

EXT = r"(?:js|mjs|css|json|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|html)"
STR_RE = re.compile(r"""["'`]((?:\.{0,2}/)?[\w\-./@%~+]+\.""" + EXT + r""")(?:\?[^"'`\s]*)?["'`]""")
API_RE = re.compile(r"""["'`](/(?:v\d+|api|service|json|rest|oauth|auth|login|signin|signup|otp|verify|password|email|identity|session|token)[\w\-./{}$:?=&%]*)["'`]""")

def main():
    verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).rstrip(b"=").decode()
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    q = {
        "response_type": "code", "device_id": "gfnclient", "scope": SCOPE, "client_id": CLIENT_ID,
        "redirect_uri": "http://localhost:2259", "ui_locales": "en-US", "nonce": secrets.token_hex(16),
        "prompt": "select_account", "code_challenge": challenge, "code_challenge_method": "S256",
    }
    url = "https://login.nvidia.com/authorize?" + urllib.parse.urlencode(q)
    chain, pages, api_hits = [], [], set()

    def redact(u):
        return re.sub(r"(nonce|code_challenge|state|code)=[^&]+", r"\1=X", u)

    def follow(url, data=None, headers=None):
        for _ in range(20):
            status, hdrs, body = fetch(url, data=data, headers=headers)
            low = {k.lower(): v for k, v in hdrs.items()}
            loc = low.get("location")
            chain.append({"url": redact(url), "method": "POST" if data else "GET", "status": status, "location": redact(loc) if loc else None, "content-type": low.get("content-type"), "cookie-names": sorted({c.name for c in jar})})
            print(status, "POST" if data else "GET", url[:110], "->", (loc or "")[:110])
            if not (status in (301, 302, 303, 307, 308) and loc):
                dest = save(url, body, low.get("content-type", ""))
                if dest:
                    pages.append((url, low.get("content-type", ""), body))
                return url, status, body
            if status in (302, 303, 301):
                data = None
                headers = {"Referer": url}
            url = urllib.parse.urljoin(url, loc)
        return url, 0, b""

    url, status, body = follow(url)
    sel = url
    qs = urllib.parse.parse_qs(urllib.parse.urlparse(sel).query)
    state = (qs.get("state") or [""])[0]
    idps = (qs.get("idp_ids") or [""])[0].split()
    idp = os.environ.get("IDP_ID") or (idps[0] if idps else "")
    print("idp candidates:", len(idps), "using:", idp[:12])
    if state and idp:
        url, status, body = follow(
            "https://login.nvidia.com/callback/provider",
            data=urllib.parse.urlencode({"state": state, "idp_id": idp}).encode(),
            headers={"Content-Type": "application/x-www-form-urlencoded", "Origin": "https://static-login.nvidia.com", "Referer": sel},
        )
    start = url
    seen, q2, saved = set(), deque(), []
    for u, ct, b in pages:
        q2.append((u, ct, b))
    manifest = []
    while q2 and len(manifest) < MAX_FILES:
        u, ct, b = q2.popleft()
        key = u.split("#")[0]
        if key in seen:
            continue
        seen.add(key)
        if b is None:
            try:
                status, headers, b = fetch(u, headers={"Referer": start})
            except Exception as e:
                print("skip", u, e)
                continue
            if status != 200:
                print("skip", u, status)
                continue
            ct = {k.lower(): v for k, v in headers.items()}.get("content-type", "")
            save(u, b, ct)
        manifest.append({"url": key, "type": ct, "bytes": len(b)})
        text = b.decode("utf-8", "ignore") if any(t in ct.lower() for t in ("html", "javascript", "css", "json", "text")) or u.split("?")[0].endswith((".js", ".css", ".html", ".json")) else ""
        if not text:
            continue
        found = []
        if "html" in ct.lower():
            lp = Links()
            lp.feed(text)
            found += lp.urls
        found += STR_RE.findall(text)
        for m in API_RE.findall(text):
            api_hits.add(m)
        for f in found:
            if f.startswith(("data:", "blob:", "javascript:", "mailto:", "#")):
                continue
            nu = urllib.parse.urljoin(u, f)
            if urllib.parse.urlparse(nu).path.lower().endswith(SKIP_EXT):
                continue
            if urllib.parse.urlparse(nu).netloc.endswith(HOSTS_SUFFIX) and nu.split("#")[0] not in seen:
                q2.append((nu, "", None))
    os.makedirs(OUT, exist_ok=True)
    json.dump({"start": start, "chain": chain, "files": manifest, "api_candidates": sorted(api_hits)}, open(os.path.join(OUT, "_manifest.json"), "w"), indent=2)
    print("done:", len(manifest), "files")
    if not manifest:
        sys.exit("nothing saved")

main()
