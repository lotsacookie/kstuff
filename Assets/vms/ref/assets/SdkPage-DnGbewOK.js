import{j as e,l as _,y as C,z as R,a as I,v as A}from"./vendor-ui-tZMmN1M_.js";import{r as c}from"./vendor-react-BLSnyxkJ.js";import{j as P}from"./index-C45bD3V2.js";import"./vendor-radix-C74W69qG.js";const g="https://discord.gg/UPMxZF8pWf",$="h-9 w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 text-sm text-[#ededed] outline-none transition-colors placeholder:text-[#5c5c5c] hover:border-[#3d3d3d] focus:border-[#8f8f8f]",O="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#ededed] px-4 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40",j="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-4 text-sm font-medium text-[#ededed] transition-colors hover:border-[#3d3d3d] hover:bg-[#161616] disabled:cursor-not-allowed disabled:opacity-40",t="rounded border border-[#262626] bg-[#161616] px-1 py-px font-mono text-[0.85em] text-[#ededed]",l="text-[15px] leading-7 text-[#a1a1a1]",y=[["how","How it works"],["quickstart","Quickstart"],["response","Session info"],["sdk","JS SDK"],["raw","Without the SDK"],["proxy","Partner setup"],["games","Games"]];function E({text:n}){const[o,a]=c.useState(!1);return e.jsx("button",{onClick:()=>{navigator.clipboard?.writeText(n).then(()=>{a(!0),setTimeout(()=>a(!1),1400)})},"aria-label":"Copy code",className:"inline-flex h-7 w-7 items-center justify-center rounded-md text-[#8f8f8f] transition-colors hover:bg-[#1f1f1f] hover:text-[#ededed]",children:o?e.jsx(I,{size:14}):e.jsx(A,{size:14})})}function m({tabs:n}){const[o,a]=c.useState(0),p=n[o]??n[0];return e.jsxs("div",{className:"overflow-hidden rounded-lg border border-[#262626] bg-[#0a0a0a]",children:[e.jsxs("div",{className:"flex h-10 items-center justify-between border-b border-[#262626] pl-1 pr-1.5",children:[e.jsx("div",{className:"flex h-full",children:n.map((x,u)=>e.jsx("button",{onClick:()=>a(u),className:`-mb-px border-b px-3 text-[13px] transition-colors ${u===o?"border-[#ededed] text-[#ededed]":"border-transparent text-[#8f8f8f] hover:text-[#ededed]"}`,children:x.title},x.title))}),e.jsx(E,{text:p.code})]}),e.jsx("pre",{className:"overflow-auto px-4 py-3.5 [scrollbar-color:#333_transparent] [scrollbar-width:thin] font-mono text-[13px] leading-6 text-[#d4d4d4]",children:p.code})]})}function h({id:n,title:o,children:a}){return e.jsxs("section",{id:n,className:"scroll-mt-24 border-t border-[#1f1f1f] pt-12",children:[e.jsx("h2",{className:"mb-3 text-[22px] font-semibold tracking-[-0.01em] text-[#ededed]",children:e.jsx("a",{href:`#${n}`,className:"hover:underline hover:decoration-[#3d3d3d] hover:underline-offset-4",children:o})}),a]})}function W(){const[n,o]=c.useState([]),[a,p]=c.useState(""),[x,u]=c.useState("how");c.useEffect(()=>{fetch(P("/api/cg/embed/games")).then(s=>s.json()).then(s=>{const r=s.games??[];o(r)}).catch(()=>{})},[]),c.useEffect(()=>{const s=y.map(([d])=>document.getElementById(d)).filter(Boolean),r=new IntersectionObserver(d=>{const f=d.filter(T=>T.isIntersecting);f[0]&&u(f[0].target.id)},{rootMargin:"-30% 0px -60% 0px"});return s.forEach(d=>r.observe(d)),()=>r.disconnect()},[]);const b=c.useMemo(()=>{const s=a.trim().toLowerCase();return s?n.filter(r=>r.gameName.toLowerCase().includes(s)||r.embedId.toLowerCase().includes(s)):n},[n,a]),i="https://YOUR_DOMAIN/astra",N=`curl -X POST ${i}/api/v1/assignments \\
  -H "Authorization: Bearer astra_sk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{ "lesson": "roblox", "studentRef": "student-123" }'`,v=`// Your backend — the secret key never leaves it.
app.post("/play", async (req, res) => {
  const r = await fetch("${i}/api/v1/assignments", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.ASTRA_SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lesson: req.body.lesson, studentRef: req.user.id }),
  });
  res.json(await r.json()); // session info → your frontend
});`,w=`# Your backend — the secret key never leaves it.
import os, requests

r = requests.post(
    "${i}/api/v1/assignments",
    headers={"Authorization": f"Bearer {os.environ['ASTRA_SECRET_KEY']}"},
    json={"lesson": "roblox", "studentRef": student_id},
)
session = r.json()  # session info → your frontend`,k=`{
  "ok": true,
  "enrollmentToken": "eyJhbGciOi…",       // short-lived, one session
  "expiresIn": 90,
  "expiresAt": "2026-10-25T19:30:00.000Z",
  "lesson": { "id": "as1366", "title": "Roblox", "track": "quaternary" },
  "session": {
    "protocol": "coursework/1",
    "origin": "${i}",
    "begin":    { "method": "POST", "url": "${i}/api/cg/launch",
                  "body": { "embedId": "as1366", "enrollmentToken": "…" } },
    "progress": { "method": "GET",
                  "url": "${i}/api/cg/status?sessionId={sessionId}" },
    "channel":  { "url": "wss://YOUR_DOMAIN/astra/live-lesson",
                  "join": { "t": "attach", "apiSessionId": "{sessionId}" } },
    "finish":   { "method": "POST", "url": "${i}/api/cg/stop",
                  "body": { "sessionId": "{sessionId}" } },
    "iceServers": [
      { "urls": "stun:stun.cloudflare.com:3478" },
      { "urls": ["stun:stun.l.google.com:19302",
                 "stun:stun1.l.google.com:19302"] }
    ],
    "iceTransportPolicy": "all"
  }
}`,S=`<div id="player" style="aspect-ratio:16/9"></div>
<script src="${i}/sdk/astra-sdk.js"><\/script>
<script>
  const astra = new Astra({ mount: "#player" });
  astra.on("ready", () => hideSpinner());
  astra.on("ended", () => showMenu());

  const session = await fetch("/play", { method: "POST" })
    .then((r) => r.json());
  astra.play(session); // session info in, stream out
<\/script>`;return e.jsx("div",{className:"min-h-screen w-full bg-[#0a0a0a] text-[#ededed] antialiased",children:e.jsxs("main",{className:"mx-auto max-w-[1100px] px-4 pb-32 pt-28 sm:px-6",children:[e.jsxs("header",{className:"mb-14 grid gap-10 lg:grid-cols-[1fr_440px] lg:items-end",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 font-mono text-[13px] text-[#8f8f8f]",children:"Astra / SDK"}),e.jsxs("h1",{className:"text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[48px]",children:["Stream cloud games",e.jsx("br",{}),"inside your own site."]}),e.jsx("p",{className:`${l} mt-4 max-w-[520px]`,children:"Your server asks Astra for a session and gets back stream info — a token, the signaling endpoint and ICE servers. The SDK turns that into a playable game in your page. No iframe."}),e.jsxs("div",{className:"mt-7 flex flex-wrap gap-2.5",children:[e.jsxs("a",{href:"#quickstart",className:O,children:["Get started ",e.jsx(_,{size:15})]}),e.jsx("a",{href:"#response",className:j,children:"API reference"})]})]}),e.jsx(m,{tabs:[{title:"index.html",code:`<script src="/astra/sdk/astra-sdk.js"><\/script>
<script>
  const astra = new Astra({ mount: "#player" });
  astra.play(session); // from your backend
<\/script>`}]})]}),e.jsxs("div",{className:"grid gap-14 lg:grid-cols-[170px_1fr]",children:[e.jsxs("nav",{className:"sticky top-24 hidden h-fit lg:block",children:[e.jsx("p",{className:"mb-2 text-[13px] font-medium text-[#ededed]",children:"On this page"}),e.jsx("ul",{children:y.map(([s,r])=>e.jsx("li",{children:e.jsx("a",{href:`#${s}`,className:`block py-1 text-[13px] transition-colors ${x===s?"text-[#ededed]":"text-[#8f8f8f] hover:text-[#ededed]"}`,children:r})},s))})]}),e.jsxs("div",{className:"min-w-0 space-y-14",children:[e.jsxs(h,{id:"how",title:"How it works",children:[e.jsx("ol",{className:"grid border-y border-[#1f1f1f] sm:grid-cols-2 lg:grid-cols-4",children:[["Your backend",e.jsxs(e.Fragment,{children:["Calls ",e.jsx("code",{className:t,children:"POST /api/v1/assignments"})," ","with your secret key."]})],["Session info","A short-lived token, the begin and channel endpoints, and STUN servers."],["The SDK","Begins the session, opens the channel and negotiates WebRTC."],["Your page","It renders into your element with keyboard, mouse, gamepad and touch."]].map(([s,r],d)=>e.jsxs("li",{className:"border-[#1f1f1f] py-5 pr-5 sm:[&:nth-child(n+2)]:border-l sm:[&:nth-child(n+2)]:pl-5 lg:[&:nth-child(3)]:border-l",children:[e.jsx("span",{className:"font-mono text-[12px] text-[#5c5c5c]",children:d+1}),e.jsx("p",{className:"mt-1 text-[14px] font-medium",children:s}),e.jsx("p",{className:"mt-1 text-[13px] leading-6 text-[#8f8f8f]",children:r})]},d))}),e.jsxs("ul",{className:`${l} mt-6 space-y-1.5 text-[14px]`,children:[e.jsxs("li",{children:[e.jsx("span",{className:"text-[#ededed]",children:"Your key stays on your server."})," ","The browser only sees a token that expires in seconds and works for one session."]}),e.jsxs("li",{children:[e.jsx("span",{className:"text-[#ededed]",children:"Real WebRTC."})," ","Peer-to-peer over STUN, with a per-session TURN relay when a network needs one."]}),e.jsxs("li",{children:[e.jsx("span",{className:"text-[#ededed]",children:"Always current."})," The script is a small loader that fetches the latest player on every ",e.jsx("code",{className:t,children:"play()"}),"."]})]})]}),e.jsxs(h,{id:"quickstart",title:"Quickstart",children:[e.jsxs("ol",{className:`${l} mb-6 list-decimal space-y-2 pl-5 marker:text-[#5c5c5c]`,children:[e.jsxs("li",{children:[e.jsx("a",{href:g,target:"_blank",rel:"noreferrer",className:"text-[#ededed] underline decoration-[#3d3d3d] underline-offset-4 hover:decoration-[#ededed]",children:"Ask on Discord"})," ","for an ",e.jsx("code",{className:t,children:"astra_sk_…"})," key. Store it as a server secret — never ship it to a browser."]}),e.jsxs("li",{children:["Open an assignment from your backend with a"," ",e.jsx("code",{className:t,children:"lesson"})," (an id like"," ",e.jsx("code",{className:t,children:"as1366"})," or a title like"," ",e.jsx("code",{className:t,children:'"roblox"'}),") and, optionally, your own ",e.jsx("code",{className:t,children:"studentRef"}),"."]}),e.jsxs("li",{children:["Pass the response to your page and call"," ",e.jsx("code",{className:t,children:"astra.play(session)"}),"."]})]}),e.jsx(m,{tabs:[{title:"Node",code:v},{title:"Python",code:w},{title:"cURL",code:N}]})]}),e.jsxs(h,{id:"response",title:"Session info",children:[e.jsxs("p",{className:`${l} mb-5`,children:[e.jsx("code",{className:t,children:"POST /api/v1/assignments"})," returns everything needed to connect — no player URL, just the pieces of the session."]}),e.jsxs("div",{className:"grid gap-5 xl:grid-cols-[1.25fr_1fr]",children:[e.jsx(m,{tabs:[{title:"Response",code:k}]}),e.jsx("dl",{className:"text-[14px]",children:[["enrollmentToken","Authorizes one session. Expires in about 90 seconds."],["session.begin","Starts the session for this lesson and returns a sessionId."],["session.progress","Poll with the sessionId until ready is true."],["session.channel","WebSocket. Send join; receive launchReady, then sig messages."],["session.iceServers","STUN to start ICE gathering. TURN arrives per session in launchReady."],["session.finish","Ends the session and releases the machine."]].map(([s,r])=>e.jsxs("div",{className:"border-b border-[#1f1f1f] py-3 first:pt-0",children:[e.jsx("dt",{className:"font-mono text-[13px] text-[#ededed]",children:s}),e.jsx("dd",{className:"mt-1 leading-6 text-[#8f8f8f]",children:r})]},s))})]})]}),e.jsxs(h,{id:"sdk",title:"JavaScript SDK",children:[e.jsxs("p",{className:`${l} mb-5`,children:["The SDK runs launch → status → signaling and the WebRTC peer connection, then renders the game straight into your element. Each ",e.jsx("code",{className:t,children:"play()"})," fetches"," ",e.jsx("code",{className:t,children:"/sdk/manifest.json"})," and loads the current player, so fixes reach your users without you changing anything."]}),e.jsx(m,{tabs:[{title:"index.html",code:S}]}),e.jsxs("table",{className:"mt-6 w-full text-left text-[14px]",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-[#262626] text-[13px] text-[#8f8f8f]",children:[e.jsx("th",{className:"py-2 pr-4 font-medium",children:"Method"}),e.jsx("th",{className:"py-2 font-medium",children:"Description"})]})}),e.jsx("tbody",{children:[["play(session)","Start streaming from a /sessions response."],["pause() / resume()","Freeze and mute locally, e.g. for a menu. The game keeps running."],["mute() / unmute()","Toggle audio."],["setVolume(0–1)","Set the stream volume."],["fullscreen()","Make the player fullscreen."],["end()","End the session on the server."],["stop()","Remove the player from the page."],["on(event, fn)","connecting, ready, ended, error."]].map(([s,r])=>e.jsxs("tr",{className:"border-b border-[#1f1f1f]",children:[e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-6 align-top font-mono text-[13px] text-[#ededed]",children:s}),e.jsx("td",{className:"py-2.5 text-[#a1a1a1]",children:r})]},s))})]})]}),e.jsxs(h,{id:"raw",title:"Without the SDK",children:[e.jsxs("p",{className:`${l} mb-5`,children:["Everything the SDK does is described by the stream info. Replace"," ",e.jsx("code",{className:t,children:"{sessionId}"})," with the id from launch and drive it yourself."]}),e.jsx(m,{tabs:[{title:"client.js",code:`const { session: s } = session;
const fill = (o, id) => JSON.parse(JSON.stringify(o).replaceAll("{sessionId}", id));

// 1. Begin the session
const { sessionId } = await fetch(s.begin.url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(s.begin.body),
}).then((r) => r.json());

// 2. Wait until it's ready
let st;
do {
  await new Promise((r) => setTimeout(r, 1000));
  st = await fetch(fill(s.progress, sessionId).url).then((r) => r.json());
} while (!st.ready && !st.error);

// 3. Channel + WebRTC
const ws = new WebSocket(s.channel.url);
ws.onopen = () => ws.send(JSON.stringify(fill(s.channel.join, sessionId)));
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.t === "launchReady") {
    // msg.session carries the offer / candidates and per-session TURN —
    // merge msg.session.iceServers with s.iceServers.
    const pc = new RTCPeerConnection({
      iceServers: [...s.iceServers, ...(msg.session.iceServers ?? [])],
      iceTransportPolicy: s.iceTransportPolicy,
    });
    // …negotiate, attach the remote track to a <video>
  }
};`}]})]}),e.jsxs(h,{id:"proxy",title:"Partner setup",children:[e.jsxs("p",{className:`${l} mb-5`,children:["Each partner serves Astra from their own domain under"," ",e.jsx("code",{className:t,children:"/astra"})," — one proxy rule per domain, as many domains as you like. The script, the API and signaling then all live there:"," ",e.jsx("code",{className:t,children:"/astra/sdk/astra-sdk.js"}),","," ",e.jsx("code",{className:t,children:"/astra/api/v1/assignments"}),","," ",e.jsx("code",{className:t,children:"/astra/live-lesson"}),". The SDK uses whichever domain its script came from, so nothing is configured per domain and players only ever talk to yours."]}),e.jsx(m,{tabs:[{title:"nginx",code:`location /astra/ {
  proxy_pass https://astra-education.top/;
  proxy_ssl_server_name on;
  proxy_set_header Host astra-education.top;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;     # signaling WebSocket
  proxy_set_header Connection "upgrade";
  proxy_set_header X-Forwarded-Host  $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Prefix /astra;
}`},{title:"Express",code:`// npm i http-proxy-middleware
const { mountAstra } = require("./astra-proxy");
mountAstra(app); // everything under /astra`}]})]}),e.jsxs(h,{id:"games",title:"Games",children:[e.jsxs("div",{className:"mb-5 flex flex-wrap items-center justify-between gap-3",children:[e.jsxs("p",{className:l,children:["Pass an id as ",e.jsx("code",{className:t,children:"lesson"}),"."]}),e.jsxs("div",{className:"relative w-full max-w-[260px]",children:[e.jsx(C,{size:14,className:"pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5c5c]"}),e.jsx("input",{className:`${$} pl-8`,placeholder:`Search ${n.length} games`,value:a,onChange:s=>p(s.target.value)})]})]}),e.jsx("div",{className:"grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6",children:b.map(s=>e.jsxs("div",{children:[e.jsx("div",{className:"aspect-square overflow-hidden rounded-md border border-[#262626] bg-[#161616]",children:s.logo?e.jsx("img",{src:s.logo,alt:"",loading:"lazy",className:"h-full w-full object-cover"}):null}),e.jsx("p",{className:"mt-2 truncate text-[13px] text-[#ededed]",children:s.gameName}),e.jsx("p",{className:"font-mono text-[12px] text-[#5c5c5c]",children:s.embedId})]},s.embedId))})]}),e.jsxs("section",{className:"flex flex-wrap items-center justify-between gap-4 border-t border-[#1f1f1f] pt-10",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[15px] font-medium",children:"Need a key?"}),e.jsx("p",{className:"mt-0.5 text-[14px] text-[#8f8f8f]",children:"Keys are issued by hand. Tell us what you're building."})]}),e.jsxs("a",{href:g,target:"_blank",rel:"noreferrer",className:j,children:[e.jsx(R,{size:15})," Contact on Discord"]})]})]})]})]})})}export{W as default};
