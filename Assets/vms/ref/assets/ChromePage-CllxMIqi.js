import{j as e,A as S,m as g,d as L}from"./vendor-ui-tZMmN1M_.js";import{u as R,r as o}from"./vendor-react-BLSnyxkJ.js";import{a as B,t as _,b as W}from"./index-C45bD3V2.js";import"./vendor-radix-C74W69qG.js";const A=""+(window.__ASTRA_PREFIX__||"")+"/assets/chrome.svg-C1ce19G4.png",U=""+(window.__ASTRA_PREFIX__||"")+"/assets/edge-CYqc_39O.png",O=""+(window.__ASTRA_PREFIX__||"")+"/assets/firefox-CBhjG4N-.svg",m=[{id:"chrome",name:"Chrome",accentColor:"#4285f4",glowColor:"rgba(66,133,244,0.22)",icon:e.jsx("img",{src:A,width:20,height:20})},{id:"edge",name:"Edge",accentColor:"#0078d4",glowColor:"rgba(0,120,212,0.22)",icon:e.jsx("img",{src:U,width:20,height:20})},{id:"firefox",name:"Firefox",accentColor:"#ff6d00",glowColor:"rgba(255,109,0,0.2)",icon:e.jsx("img",{src:O,width:20,height:20})}];function F({selected:l,onSelect:n}){const[c,s]=o.useState(!1),d=o.useRef(null),x=m.find(t=>t.id===l);return o.useEffect(()=>{const t=f=>{d.current&&!d.current.contains(f.target)&&s(!1)};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[]),e.jsxs("div",{ref:d,style:{position:"relative"},children:[e.jsxs("button",{className:"cb-field-btn",onClick:()=>s(t=>!t),"aria-haspopup":"listbox","aria-expanded":c,children:[e.jsxs("span",{className:"cb-field-left",children:[e.jsx("span",{style:{display:"flex",alignItems:"center",flexShrink:0},children:x.icon}),e.jsx("span",{className:"cb-field-text",children:x.name})]}),e.jsx("svg",{width:"15",height:"15",viewBox:"0 0 15 15",fill:"none",style:{color:"rgba(255,255,255,0.28)",transition:"transform 0.2s",transform:c?"rotate(180deg)":"rotate(0deg)",flexShrink:0},children:e.jsx("path",{d:"M3.5 5.5l4 4 4-4",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),c&&e.jsx("div",{className:"cb-dropdown-menu",role:"listbox",children:m.map(t=>e.jsxs("button",{className:`cb-dropdown-item${t.id===l?" selected":""}`,role:"option","aria-selected":t.id===l,onClick:()=>{n(t.id),s(!1)},children:[e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:12},children:[t.icon,e.jsx("span",{children:e.jsx("span",{style:{display:"block",fontSize:14,fontWeight:500,color:"rgba(255,255,255,0.82)"},children:t.name})})]}),t.id===l&&e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M2.5 7l3 3 6-6",stroke:"rgba(59,130,246,0.9)",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})})]},t.id))})]})}const P=()=>e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 512 512",fill:"currentColor",children:e.jsx("path",{d:"M255.994,0.006C114.607,0.013,0.012,114.612,0,256c0.012,141.387,114.607,255.986,255.994,255.994 C397.393,511.986,511.992,397.387,512,256C511.992,114.612,397.393,0.013,255.994,0.006z M97.607,97.612 c23.34-23.328,51.761-41.475,83.455-52.725c-15.183,18.375-27.84,41.906-37.757,69.116H82.772 C87.452,108.308,92.396,102.824,97.607,97.612z M65.612,138.003h69.986c-9.008,31.929-14.41,67.834-15.363,105.997H32.327 C34.374,205.196,46.3,169.088,65.612,138.003z M65.612,373.997C46.3,342.912,34.374,306.804,32.327,268h87.991 c0.961,38.124,6.21,74.092,15.206,105.998H65.612z M97.607,414.386c-5.211-5.211-10.156-10.695-14.836-16.39h60.573 c4.28,11.774,9.019,22.944,14.312,33.21c6.954,13.438,14.758,25.468,23.348,35.89C149.332,455.846,120.931,437.699,97.607,414.386z M243.998,479.667c-3.746-0.196-7.469-0.477-11.164-0.86c-5.89-2.64-11.722-6.25-17.5-10.961 c-17.632-14.359-33.976-38.671-46.398-69.85h75.061V479.667z M243.998,373.997h-83.436c-9.477-31.171-15.316-67.311-16.328-105.998 h99.763V373.997z M243.998,244H144.31c1.008-38.71,6.875-74.819,16.359-105.997h83.33V244z M243.998,114.003h-74.951 c3.109-7.79,6.367-15.312,9.934-22.195c10.64-20.625,23.17-36.89,36.354-47.656c5.777-4.71,11.609-8.32,17.5-10.96 c3.695-0.382,7.417-0.664,11.164-0.859V114.003z M446.392,138.003c19.312,31.085,31.234,67.194,33.281,105.997h-87.991 c-0.961-38.124-6.21-74.092-15.21-105.997H446.392z M414.393,97.612c5.211,5.211,10.156,10.696,14.836,16.391h-60.577 c-4.281-11.773-9.023-22.945-14.312-33.21c-6.953-13.437-14.758-25.468-23.347-35.89C362.668,56.16,391.065,74.301,414.393,97.612z M267.998,32.333c3.746,0.195,7.469,0.484,11.16,0.859c5.89,2.649,11.723,6.25,17.504,10.96 c17.636,14.359,33.976,38.671,46.397,69.85h-75.061V32.333z M267.998,138.003h83.436c9.476,31.171,15.32,67.31,16.328,105.997 h-99.764V138.003z M267.998,268h99.685c-1.007,38.71-6.874,74.818-16.359,105.998h-83.326V268z M296.661,467.846 c-5.781,4.711-11.614,8.313-17.504,10.961c-3.691,0.375-7.414,0.664-11.16,0.86v-81.67h74.951 c-3.109,7.789-6.367,15.312-9.933,22.195C322.376,440.816,309.845,457.081,296.661,467.846z M414.393,414.386 c-23.336,23.328-51.764,41.476-83.459,52.725c15.187-18.375,27.835-41.905,37.757-69.115h60.538 C424.548,403.692,419.604,409.176,414.393,414.386z M446.392,373.997h-69.998c9.008-31.929,14.414-67.842,15.367-105.998h87.912 C477.626,306.804,465.704,342.912,446.392,373.997z"})}),D="astra_browser_session";function $(){const l=R(),[n,c]=o.useState(""),[s,d]=o.useState("chrome"),[x,t]=o.useState(!1),[f,w]=o.useState(!1),[y,j]=o.useState(null),[C,b]=o.useState(!1),[h,p]=o.useState(null);m.find(r=>r.id===s);const I=n.trim()?/^https?:\/\//i.test(n)?n:"https://"+n:"https://",k=o.useMemo(()=>{try{let r=n.trim();return r?(/^https?:\/\//i.test(r)||(r="https://"+r),new URL(r).hostname):null}catch{return null}},[n]),v=k?`https://www.google.com/s2/favicons?domain=${k}&sz=64`:null;o.useEffect(()=>{t(!1)},[n]);async function z(){let r=n.trim();if(r){/^https?:\/\//i.test(r)||(r="https://"+r),w(!0),j(null),b(!1),p(null),_(s);try{const a=await(await fetch("/api/school/launch",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({browser:s,url:r})})).json();if(!a.ok||!a.jobId){if(a.code==="BROWSER_BUSY"){b(!0);return}throw new Error(a.error||"Launch failed")}a.position&&a.position>0&&p(a.position);const N=a.jobId,M=Date.now()+960*1e3;for(;;){if(Date.now()>M)throw new Error("Timed out waiting to launch.");await new Promise(E=>setTimeout(E,1500));const i=await(await fetch(`/api/school/launch/status?jobId=${encodeURIComponent(N)}`)).json();if(i.status==="queued"){p(i.position&&i.position>0?i.position:null);continue}if(i.status==="running"){p(null);continue}if(i.status==="error"||i.ok===!1){if(i.code==="BROWSER_BUSY"){b(!0);return}throw new Error(i.error||"Launch failed")}if(i.status==="ready"&&i.vmId&&i.token){sessionStorage.setItem(D,JSON.stringify({vmId:i.vmId,token:i.token,ready:i.ready===!0})),l("/browser/stream");return}}}catch(u){const a=u instanceof Error?u.message:"Something went wrong.";W(s,a),j(a)}finally{w(!1),p(null)}}}return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        .cb-page {
          width: 100%; box-sizing: border-box;
          padding: 130px 48px 140px;
          font-family: 'Inter', sans-serif;
          position: relative; min-height: 100vh;
          background: radial-gradient(ellipse at 50% -10%, rgba(30,64,175,0.28) 0%, rgba(5,7,13,0) 55%), var(--astra-bg);
          display: flex; flex-direction: column; align-items: center;
          overflow: hidden;
        }

        .cb-bloom {
          position: absolute; pointer-events: none;
          border-radius: 50%; filter: blur(130px); z-index: 0;
        }
        .cb-orb {
          position: absolute; pointer-events: none;
          border-radius: 50%; filter: blur(80px); z-index: 0;
          animation: cb-orb-drift 18s ease-in-out infinite;
        }
        .cb-orb-2 { animation-delay: -9s; animation-duration: 22s; }
        @keyframes cb-orb-drift {
          0%   { transform: translate(0,0) scale(1); }
          33%  { transform: translate(40px,-30px) scale(1.08); }
          66%  { transform: translate(-25px,20px) scale(0.94); }
          100% { transform: translate(0,0) scale(1); }
        }

        .cb-center {
          position: relative; z-index: 1;
          width: 100%; max-width: 560px;
          display: flex; flex-direction: column; align-items: center;
        }

        .cb-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 5px 13px; border-radius: 9999px;
          border: 1px solid rgba(59,130,246,0.3);
          background: rgba(59,130,246,0.08);
          margin-bottom: 28px;
          opacity: 0;
          animation: cb-fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.05s forwards;
        }
        .cb-eyebrow span {
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.55); letter-spacing: 0.08em;
          text-transform: uppercase; font-family: 'Inter', sans-serif;
        }

        .cb-title {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(2.2rem, 3.8vw, 3.4rem);
          font-weight: 500; line-height: 1.07;
          color: #fff; margin: 0 0 20px;
          letter-spacing: -0.025em; text-align: center;
          opacity: 0;
          animation: cb-fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.13s forwards;
        }
        .cb-title-dim { color: rgba(255,255,255,0.26); font-weight: 300; }

        .cb-body {
          font-size: 15px; color: rgba(255,255,255,0.36);
          line-height: 1.78; text-align: center;
          margin: 0 0 28px;
          opacity: 0;
          animation: cb-fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.22s forwards;
        }

        .cb-stats {
          display: flex; gap: 28px; margin-bottom: 48px;
          opacity: 0;
          animation: cb-fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s forwards;
        }
        .cb-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .cb-stat-val {
          font-family: 'DM Sans', sans-serif;
          font-size: 24px; font-weight: 500; color: #fff; line-height: 1;
        }
        .cb-stat-label { font-size: 12px; color: rgba(255,255,255,0.25); }
        .cb-stat-div { width: 1px; background: rgba(255,255,255,0.07); align-self: stretch; }

        /* ── macOS unified window ── */
        .cb-window {
          width: 100%;
          filter: drop-shadow(0 28px 70px rgba(0,0,0,0.75));
          opacity: 0;
          animation: cb-fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.36s forwards;
        }

        .cb-titlebar {
          background: rgba(38,36,50,0.97);
          border: 1px solid rgba(255,255,255,0.1); border-bottom: none;
          border-radius: 14px 14px 0 0;
          padding: 0 16px; height: 44px;
          display: flex; align-items: center; gap: 14px;
        }
        .cb-mac-dots { display: flex; gap: 7px; align-items: center; flex-shrink: 0; }
        .cb-mac-dots span { width: 12px; height: 12px; border-radius: 50%; display: block; }
        .cb-mac-nav { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
        .cb-mac-nav-btn {
          background: none; border: none; cursor: pointer; padding: 0;
          display: flex; align-items: center; opacity: 0.3;
        }
        .cb-titlebar-urlbar {
          flex: 1; height: 28px;
          background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 7px;
          display: flex; align-items: center; gap: 7px; padding: 0 10px; overflow: hidden;
        }
        .cb-titlebar-url {
          font-size: 12px; color: rgba(255,255,255,0.28);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          font-family: 'Inter', sans-serif; transition: color 0.3s;
        }

        .cb-formpanel {
          background: rgba(22,20,34,0.97);
          border: 1px solid rgba(255,255,255,0.08); border-top: none;
          border-radius: 0 0 14px 14px;
          padding: 22px;
          display: flex; flex-direction: column; gap: 13px;
        }

        .cb-field { display: flex; flex-direction: column; gap: 7px; }
        .cb-field-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: rgba(255,255,255,0.35); padding-left: 2px;
        }

        .cb-url-wrap { position: relative; display: flex; align-items: center; }
        .cb-url-icon {
          position: absolute; left: 13px;
          display: flex; align-items: center;
          color: rgba(255,255,255,0.22); pointer-events: none;
          transition: color 0.2s;
        }
        .cb-url-wrap:focus-within .cb-url-icon { color: rgba(59,130,246,0.65); }
        .cb-url-input {
          width: 100%; height: 46px; box-sizing: border-box;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: #fff;
          font-size: 14px; font-family: 'Inter', sans-serif;
          padding: 0 14px 0 40px; outline: none;
          transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
        }
        .cb-url-input::placeholder { color: rgba(255,255,255,0.17); }
        .cb-url-input:focus {
          border-color: rgba(59,130,246,0.5);
          background: rgba(59,130,246,0.04);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .cb-field-btn {
          width: 100%; height: 46px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
          padding: 0 14px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; font-family: 'Inter', sans-serif;
          box-sizing: border-box; outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .cb-field-btn:hover {
          border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.05);
        }
        .cb-field-btn:focus-visible {
          border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .cb-field-left { display: flex; align-items: center; gap: 10px; }
        .cb-field-text { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.8); }
        .cb-field-subdesc { font-size: 12px; color: rgba(255,255,255,0.24); margin-left: 1px; }

        .cb-dropdown-menu {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #0c0c1d;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          overflow: hidden; z-index: 50;
          animation: cb-drop-in 0.14s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.75);
        }
        @keyframes cb-drop-in {
          from { opacity: 0; transform: translateY(-5px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cb-dropdown-item {
          width: 100%; height: 52px; background: transparent; border: none;
          padding: 0 16px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.12s; outline: none;
        }
        .cb-dropdown-item:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.05); }
        .cb-dropdown-item:hover { background: rgba(255,255,255,0.04); }
        .cb-dropdown-item.selected { background: rgba(59,130,246,0.06); }

        .cb-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          margin: 1px 0;
        }

        .cb-launch-btn {
          width: 100%; height: 50px; border-radius: 10px;
          background: rgba(59,130,246,1); border: none; color: #fff;
          font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: background 0.18s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 28px rgba(59,130,246,0.28);
          letter-spacing: -0.01em; outline: none;
        }
        .cb-launch-btn:hover {
          background: rgba(92,149,255,1); transform: translateY(-1px);
          box-shadow: 0 0 44px rgba(59,130,246,0.5), 0 8px 24px rgba(0,0,0,0.3);
        }
        .cb-launch-btn:active { transform: scale(0.98); transition-duration: 0.08s; }
        .cb-launch-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }

        .cb-screen {
          border: 1px solid rgba(255,255,255,0.07); border-top: none;
          border-radius: 0 0 14px 14px; overflow: hidden;
          height: 148px; background: rgba(255,255,255,0.012);
          position: relative;
        }
        .cb-screen-bar {
          position: absolute; top: 0; left: 0;
          height: 2px; width: 62%; opacity: 0.55;
          transition: background 0.5s;
        }
        .cb-screen-content { padding: 20px 18px; display: flex; flex-direction: column; gap: 8px; }
        .cb-screen-line { border-radius: 5px; }

        @keyframes cb-fadeUp {
          from { opacity: 0; transform: translateY(22px); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
      `}),e.jsxs("section",{className:"cb-page",children:[e.jsx("div",{className:"cb-bloom",style:{top:-180,left:"20%",width:700,height:700,background:"radial-gradient(ellipse at 40% 30%, rgba(30,64,175,0.3) 0%, rgba(30,64,175,0.08) 50%, transparent 70%)"}}),e.jsx("div",{className:"cb-bloom",style:{top:300,right:"-8%",width:500,height:500,background:"radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)"}}),e.jsx("div",{className:"cb-orb",style:{top:"15%",left:"8%",width:260,height:260,background:"radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 70%)"}}),e.jsx("div",{className:"cb-orb cb-orb-2",style:{bottom:"20%",right:"10%",width:200,height:200,background:"radial-gradient(circle, rgba(29,78,216,0.14) 0%, transparent 70%)"}}),e.jsxs("div",{className:"cb-center",children:[e.jsxs("h1",{className:"cb-title",children:["Browser",e.jsx("br",{})]}),e.jsx("p",{className:"cb-body",children:"Pick from 3 browsers (Chrome, Firefox, Edge), completly free, devtools enabled, fully private."}),e.jsxs("div",{className:"cb-window",children:[e.jsxs("div",{className:"cb-titlebar",children:[e.jsxs("div",{className:"cb-mac-dots",children:[e.jsx("span",{style:{background:"#ff5f57"}}),e.jsx("span",{style:{background:"#febc2e"}}),e.jsx("span",{style:{background:"#28c840"}})]}),e.jsxs("div",{className:"cb-mac-nav",children:[e.jsx("button",{className:"cb-mac-nav-btn",tabIndex:-1,children:e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M9 3L5 7l4 4",stroke:"rgba(255,255,255,0.5)",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{className:"cb-mac-nav-btn",tabIndex:-1,children:e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M5 3l4 4-4 4",stroke:"rgba(255,255,255,0.5)",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})})})]}),e.jsxs("div",{className:"cb-titlebar-urlbar",children:[e.jsxs("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",style:{flexShrink:0,opacity:.35},children:[e.jsx("rect",{x:"1.5",y:"4",width:"7",height:"5",rx:"1",fill:"rgba(255,255,255,0.6)"}),e.jsx("path",{d:"M3 4V3a2 2 0 014 0v1",stroke:"rgba(255,255,255,0.6)",strokeWidth:"1",strokeLinecap:"round"})]}),e.jsx("span",{className:"cb-titlebar-url",children:I})]}),e.jsx("span",{style:{display:"flex",alignItems:"center",opacity:.8,flexShrink:0},children:e.jsx("img",{src:B,width:20,height:20,alt:"Astra"})})]}),e.jsxs("div",{className:"cb-formpanel",children:[e.jsxs("div",{className:"cb-field",children:[e.jsx("span",{className:"cb-field-label",children:"URL"}),e.jsxs("div",{className:"cb-url-wrap",children:[e.jsx("span",{className:"cb-url-icon",children:v&&!x?e.jsx("img",{src:v,width:16,height:16,style:{borderRadius:2},onError:()=>t(!0)}):e.jsx(P,{})}),e.jsx("input",{className:"cb-url-input",type:"text",placeholder:"https://example.com",value:n,autoComplete:"off",spellCheck:!1,onChange:r=>c(r.target.value),onKeyDown:r=>{r.key==="Enter"&&z()}})]})]}),e.jsxs("div",{className:"cb-field",children:[e.jsx("span",{className:"cb-field-label",children:"Browser"}),e.jsx(F,{selected:s,onSelect:d})]}),e.jsx("div",{className:"cb-divider"}),e.jsxs("button",{className:"cb-launch-btn",onClick:()=>{z()},disabled:!n.trim()||f,children:[e.jsx("svg",{width:"15",height:"15",viewBox:"0 0 15 15",fill:"none",children:e.jsx("path",{d:"M2 7.5h11M8.5 3.5l4 4-4 4",stroke:"#fff",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})}),"Launch Cloud Browser"]})]})]}),y&&e.jsx("p",{style:{marginTop:20,fontSize:13,color:"rgba(255,120,120,0.95)",textAlign:"center",maxWidth:400},children:y})]})]}),e.jsx(S,{children:f&&e.jsxs(g.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.25},style:{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,background:"rgba(3,5,15,0.88)",backdropFilter:"blur(12px)"},children:[e.jsx(g.div,{style:{width:48,height:48,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.12)",borderTopColor:"rgba(59,130,246,0.95)"},animate:{rotate:360},transition:{duration:.85,repeat:1/0,ease:"linear"}}),e.jsx(g.p,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},style:{fontFamily:"'Inter', sans-serif",fontSize:15,color:"rgba(255,255,255,0.55)",textAlign:"center",maxWidth:280,lineHeight:1.5},children:h?`You're #${h} in line — hang tight, we'll launch automatically.`:"Creating your browser..."},h?`q-${h}`:"creating")]})}),e.jsx(S,{children:C&&e.jsx(g.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.2},onClick:()=>b(!1),style:{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"rgba(2,4,12,0.75)",backdropFilter:"blur(10px)"},role:"presentation",children:e.jsxs(g.div,{role:"dialog","aria-modal":"true","aria-labelledby":"busy-modal-title",initial:{opacity:0,scale:.96,y:10},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.98,y:6},transition:{type:"spring",stiffness:420,damping:32},onClick:r=>r.stopPropagation(),style:{width:"100%",maxWidth:400,borderRadius:20,border:"1px solid rgba(255,255,255,0.1)",background:"linear-gradient(165deg, rgba(22,18,38,0.98) 0%, rgba(10,12,28,0.98) 100%)",boxShadow:"0 0 0 1px rgba(59,130,246,0.12), 0 24px 80px rgba(0,0,0,0.55), 0 0 60px rgba(59,130,246,0.08)",padding:"28px 28px 24px",textAlign:"center"},children:[e.jsx("div",{style:{width:56,height:56,margin:"0 auto 18px",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.35)",color:"rgba(158,193,255,0.95)"},children:e.jsx(L,{size:28,strokeWidth:1.5})}),e.jsx("h2",{id:"busy-modal-title",style:{fontFamily:"'DM Sans', sans-serif",fontSize:"clamp(1.35rem, 4vw, 1.6rem)",fontWeight:600,color:"#fff",margin:"0 0 12px",letterSpacing:"-0.02em"},children:"Browsers are busy"}),e.jsx("p",{style:{fontFamily:"'Inter', sans-serif",fontSize:15,lineHeight:1.65,color:"rgba(255,255,255,0.5)",margin:"0 0 24px"},children:"A lot of people are using cloud browsers right now, so new sessions are temporarily limited. Please try again in a few minutes."}),e.jsx("button",{type:"button",onClick:()=>b(!1),style:{width:"100%",height:48,borderRadius:12,border:"none",cursor:"pointer",fontFamily:"'Inter', sans-serif",fontSize:15,fontWeight:600,color:"#fff",background:"rgba(59,130,246,1)",boxShadow:"0 0 28px rgba(59,130,246,0.35)",transition:"transform 0.12s, background 0.15s"},onMouseEnter:r=>{r.currentTarget.style.background="rgba(92,149,255,1)"},onMouseLeave:r=>{r.currentTarget.style.background="rgba(59,130,246,1)"},children:"Got it"})]})})})]})}export{$ as AstraCloudBrowsers,$ as default};
