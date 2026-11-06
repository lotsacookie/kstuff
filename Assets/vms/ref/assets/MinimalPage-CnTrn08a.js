import{j as e}from"./vendor-ui-tZMmN1M_.js";import{u as S,r as n}from"./vendor-react-BLSnyxkJ.js";import{u as z,p as C,f as L,S as E,n as M,L as A}from"./index-C45bD3V2.js";import{L as B}from"./LaunchSessionModal-DvCTnS7z.js";import"./vendor-radix-C74W69qG.js";const G={a:"а",c:"с",e:"е",i:"і",j:"ј",o:"о",p:"р",s:"ѕ",x:"х",y:"у",A:"А",B:"В",C:"С",E:"Е",H:"Н",I:"І",J:"Ј",K:"К",M:"М",O:"О",P:"Р",S:"Ѕ",T:"Т",X:"Х",Y:"Ү"};function o(c){let t=0,i="";for(const p of c){const l=G[p];l&&t%2===0?(i+=l,t++):(l&&t++,i+=p)}return i}function U(){const{loading:c,statusText:t,error:i,activeReady:p,beginLaunch:l,notifyLaunchModalOpen:m,playReady:u}=z(),f=S(),[d,y]=n.useState([]),[h,w]=n.useState(""),[v,j]=n.useState(!0),[x,k]=n.useState(""),[r,b]=n.useState(null),N=n.useRef(null);n.useEffect(()=>{let a=!1;return C(),(async()=>{try{const s=await L();a||y(s)}catch{a||w("Couldn't load the list. Try again shortly.")}finally{a||j(!1)}})(),()=>{a=!0}},[]),n.useEffect(()=>(m(!!r),()=>m(!1)),[r,m]),n.useEffect(()=>{p&&u()},[p,u]);const g=n.useMemo(()=>{const a=x.trim().toLowerCase();return a?d.filter(s=>s.gameName.toLowerCase().includes(a)):d},[d,x]);return e.jsxs("div",{className:"mp-page",children:[e.jsx(O,{}),e.jsxs("header",{className:"mp-bar",children:[e.jsx("span",{className:"mp-mark",children:o("Astra")}),e.jsx("input",{ref:N,value:x,onChange:a=>k(a.target.value),placeholder:o("Search"),className:"mp-search","aria-label":"Search games"}),e.jsxs("div",{className:"mp-bar-actions",children:[e.jsx(E,{}),e.jsx("button",{type:"button",className:"mp-link",onClick:()=>f("/browser"),children:o("Browser")}),e.jsx("button",{type:"button",className:"mp-link",onClick:()=>{M("full"),f("/games")},children:o("Full version")})]})]}),e.jsx("main",{className:"mp-main",children:v?e.jsx("p",{className:"mp-note",children:o("Loading…")}):h?e.jsx("p",{className:"mp-note mp-err",children:h}):g.length===0?e.jsx("p",{className:"mp-note",children:o("No matches.")}):e.jsxs(e.Fragment,{children:[e.jsxs("p",{className:"mp-count",children:[g.length," ",o("available")]}),e.jsx("ul",{className:"mp-list",children:g.map(a=>e.jsx("li",{children:e.jsxs("button",{type:"button",className:"mp-row",onClick:()=>b(a),"aria-label":a.gameName,children:[e.jsx("span",{className:"mp-name","aria-hidden":"true",children:o(a.gameName)}),e.jsx("span",{className:"mp-open","aria-hidden":"true",children:o("Open")})]})},a.gameId))})]})}),e.jsx(B,{open:!!r,game:r,launchImageUrl:r?A[r.gameId]:void 0,loading:c,statusText:t,error:i,onClose:()=>{c||b(null)},onPlay:a=>{if(!r)return;const s=r.servers?.find(I=>I.gameId===a);l(s?{...r,cardId:r.gameId,gameId:s.gameId,provider:s.provider}:r)}})]})}function O(){return e.jsx("style",{children:`
      .mp-page {
        width: 100%; min-width: 0; box-sizing: border-box; overflow-x: clip;
        min-height: 100vh; min-height: 100dvh;
        background: var(--astra-bg, #05070d);
        font-family: 'Inter', system-ui, sans-serif;
      }
      .mp-bar {
        position: sticky; top: 0; z-index: 30;
        display: flex; align-items: center; gap: 12px;
        padding: 12px 16px;
        background: rgba(5,7,13,0.92);
        border-bottom: 1px solid rgba(255,255,255,0.07);
        backdrop-filter: blur(8px);
      }
      .mp-mark {
        font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
        letter-spacing: -0.02em; color: #fff; flex: none;
      }
      .mp-search {
        flex: 1; min-width: 0; height: 34px;
        padding: 0 12px; border-radius: 9px;
        background: rgba(255,255,255,0.035);
        border: 1px solid rgba(255,255,255,0.09);
        color: #fff; font-size: 13.5px; outline: none;
        transition: border-color 0.15s, background 0.15s;
      }
      .mp-search::placeholder { color: rgba(255,255,255,0.28); }
      .mp-search:focus {
        border-color: rgba(59,130,246,0.65);
        background: rgba(59,130,246,0.05);
      }
      .mp-bar-actions { display: flex; align-items: center; gap: 10px; flex: none; }
      .mp-link {
        background: none; border: none; cursor: pointer; padding: 0;
        font-size: 12.5px; color: rgba(255,255,255,0.4);
        transition: color 0.15s;
      }
      .mp-link:hover { color: rgba(255,255,255,0.8); }

      .mp-main { max-width: 680px; margin: 0 auto; padding: 18px 16px 48px; }
      .mp-count {
        margin: 0 0 10px; font-size: 11.5px; letter-spacing: 0.02em;
        color: rgba(255,255,255,0.3);
      }
      .mp-note { margin: 28px 0; text-align: center; font-size: 13.5px; color: rgba(255,255,255,0.4); }
      .mp-err { color: rgba(255,150,145,0.95); }

      .mp-list { list-style: none; margin: 0; padding: 0; }
      .mp-row {
        width: 100%; display: flex; align-items: center; justify-content: space-between;
        gap: 12px; padding: 11px 12px; border-radius: 9px;
        background: none; border: 1px solid transparent; cursor: pointer; text-align: left;
        transition: background 0.14s, border-color 0.14s;
      }
      .mp-row:hover {
        background: rgba(255,255,255,0.035);
        border-color: rgba(255,255,255,0.08);
      }
      .mp-name {
        font-size: 14px; color: rgba(255,255,255,0.86);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .mp-open {
        flex: none; font-size: 12px; font-weight: 600; color: #3b82f6; opacity: 0;
        transition: opacity 0.14s;
      }
      .mp-row:hover .mp-open, .mp-row:focus-visible .mp-open { opacity: 1; }

      @media (hover: none) { .mp-open { opacity: 1; } }
      @media (max-width: 560px) {
        .mp-bar { flex-wrap: wrap; row-gap: 8px; padding: 14px 14px 12px; padding-top: calc(14px + env(safe-area-inset-top)); }
        .mp-mark { order: 1; line-height: 1.2; }
        .mp-bar-actions { order: 2; margin-left: auto; gap: 14px; }
        .mp-search { order: 3; flex: 1 1 100%; height: 40px; font-size: 16px; }
        .mp-link { font-size: 13px; padding: 8px 2px; }
        .mp-main { padding: 14px 12px calc(40px + env(safe-area-inset-bottom)); }
        .mp-row { min-height: 48px; padding: 12px; }
        .mp-name { font-size: 15px; }
      }
        `})}export{U as default};
