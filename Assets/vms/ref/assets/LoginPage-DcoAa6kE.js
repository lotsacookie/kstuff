import{j as e}from"./vendor-ui-tZMmN1M_.js";import{r as t,u as E}from"./vendor-react-BLSnyxkJ.js";import{r as W}from"./vendor-radix-C74W69qG.js";import{k as F,a as O,o as Z,q as _}from"./index-C45bD3V2.js";const u="#3b82f6",R="https://discord.gg/UPMxZF8pWf";function I({label:a,id:n,type:l="text",value:o,onChange:r,onBlur:b,placeholder:k,autoComplete:d,error:p,rightSlot:g}){return e.jsxs("div",{className:"au-field",children:[e.jsx("div",{className:"au-label-row",children:a}),e.jsxs("div",{className:`au-wrap${p?" has-error":""}`,children:[e.jsx("input",{id:n,type:l,value:o,autoComplete:d,onChange:m=>r(m.target.value),onBlur:b,placeholder:k,className:"au-input","aria-invalid":!!p}),g]}),e.jsx("div",{className:"au-err","aria-live":"polite",children:p||""})]})}function U({value:a}){const n=t.useMemo(()=>{let r=0;return a.length>=10&&r++,/[A-Z]/.test(a)&&r++,/[0-9]/.test(a)&&r++,/[^A-Za-z0-9]/.test(a)&&r++,r},[a]),l=["Too short","Weak","Okay","Strong","Excellent"],o=["#e0564f","#e08a3e","#d6b13a",u,u];return e.jsxs("div",{className:"au-strength",style:{opacity:a.length?1:0},children:[e.jsx("div",{className:"au-strength-bars",children:[0,1,2,3].map(r=>e.jsx("div",{className:"au-bar",style:{background:r<n?o[n]:"rgba(255,255,255,0.08)"}},r))}),e.jsx("span",{className:"au-strength-label",style:{color:o[n]},children:l[n]})]})}function Y({mode:a,setMode:n}){const l=E(),{login:o,register:r}=F(),[b,k]=t.useState(""),[d,p]=t.useState(""),[g,m]=t.useState(!1),[j,$]=t.useState(!0),[w,y]=t.useState({}),[S,f]=t.useState(!1),[v,C]=t.useState(!1),[z,x]=t.useState(""),[N,h]=t.useState(!1);t.useEffect(()=>{y({}),f(!1),C(!1),m(!1),x(""),h(!1)},[a]),t.useEffect(()=>{if(!N)return;const s=i=>{i.key==="Escape"&&h(!1)};return window.addEventListener("keydown",s),()=>window.removeEventListener("keydown",s)},[N]);const c=b.trim().toLowerCase(),M={username:w.username&&c.length<3?"At least 3 characters":w.username&&c.length>0&&!/^[a-zA-Z0-9_]+$/.test(c)?"Letters, numbers, and underscores only":w.username&&c.length>32?"Max 32 characters":"",password:w.password&&d.length<10?"At least 10 characters":""},P=c.length>=3&&c.length<=32&&/^[a-zA-Z0-9_]+$/.test(c)&&d.length>=10;async function B(s){if(s.preventDefault(),y({username:!0,password:!0}),x(""),!!P){f(!0);try{if(a==="signup"){const i=await r(c,d);if(!i.ok){x(i.message),f(!1);return}}else{const i=await o(c,d);if(!i.ok){let A=i.message;if(i.code==="RATE_LIMIT"&&typeof i.retryAfterMs=="number"){const L=Math.max(1,Math.ceil(i.retryAfterMs/6e4));A=`Too many attempts. Try again in ${L} minute${L===1?"":"s"}.`}x(A),f(!1);return}}a==="signup"?Z():_(),C(!0),l("/dashboard",{replace:!0})}catch{x("Something went wrong. Please try again.")}finally{f(!1)}}}const T=e.jsx("button",{type:"button",onClick:()=>m(s=>!s),className:"au-eye","aria-label":g?"Hide password":"Show password",children:g?e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M2 2l20 20"}),e.jsx("path",{d:"M6.71 6.71C3.92 8.46 2 12 2 12s3 7 10 7c2.04 0 3.79-.6 5.21-1.5"}),e.jsx("path",{d:"M11 5.05A11.6 11.6 0 0 1 12 5c7 0 10 7 10 7a17.36 17.36 0 0 1-2.06 3.05"}),e.jsx("path",{d:"M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88"})]}):e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"}),e.jsx("circle",{cx:"12",cy:"12",r:"3"})]})}),D=N&&W.createPortal(e.jsxs("div",{role:"dialog","aria-modal":"true","aria-labelledby":"au-forgot-title",className:"au-modal-root",children:[e.jsx("button",{type:"button","aria-label":"Close dialog",onClick:()=>h(!1),className:"au-modal-scrim"}),e.jsxs("div",{className:"au-modal",onClick:s=>s.stopPropagation(),children:[e.jsx("h3",{id:"au-forgot-title",className:"au-modal-title",children:"Forgot your password?"}),e.jsx("p",{className:"au-modal-text",children:"Password resets are handled by our team. Open a ticket in Discord and we'll get you back in."}),e.jsxs("div",{className:"au-modal-actions",children:[e.jsxs("a",{href:R,target:"_blank",rel:"noopener noreferrer",className:"au-btn-primary au-btn-sm",children:["Open a ticket",e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.074 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.086.246.198.372.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.001-3.03.077.077 0 0 0 .032-.054c.603-6.475-1.221-12.864-4.908-17.115a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418z"})})]}),e.jsx("button",{type:"button",onClick:()=>h(!1),className:"au-btn-ghost au-btn-sm",children:"Cancel"})]})]})]}),document.body);return e.jsxs(e.Fragment,{children:[D,e.jsxs("form",{className:"au-form",onSubmit:B,noValidate:!0,children:[e.jsx(I,{label:e.jsx("label",{htmlFor:"username",className:"au-label",children:"Username"}),id:"username",value:b,onChange:k,onBlur:()=>y(s=>({...s,username:!0})),placeholder:"yourname",autoComplete:"username",error:M.username}),e.jsx(I,{label:e.jsxs("span",{className:"au-label-flex",children:[e.jsx("label",{htmlFor:"password",className:"au-label",children:"Password"}),a==="login"&&e.jsx("button",{type:"button",className:"au-link-btn",onClick:()=>h(!0),children:"Forgot?"})]}),id:"password",type:g?"text":"password",value:d,onChange:p,onBlur:()=>y(s=>({...s,password:!0})),placeholder:a==="signup"?"At least 10 characters":"Your password",autoComplete:a==="signup"?"new-password":"current-password",error:M.password,rightSlot:T}),a==="signup"&&e.jsx(U,{value:d}),z?e.jsxs("div",{role:"alert",className:"au-alert",children:[e.jsxs("svg",{width:"15",height:"15",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":!0,children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M12 8v5"}),e.jsx("path",{d:"M12 16h.01"})]}),e.jsx("span",{children:z})]}):null,a==="login"&&e.jsxs("label",{className:"au-check",children:[e.jsx("input",{type:"checkbox",checked:j,onChange:s=>$(s.target.checked)}),e.jsx("span",{className:`au-check-box${j?" is-on":""}`,children:j&&e.jsx("svg",{width:"11",height:"11",viewBox:"0 0 24 24",fill:"none",stroke:"#fff",strokeWidth:"3.5",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"20 6 9 17 4 12"})})}),e.jsx("span",{children:"Keep me signed in"})]}),e.jsx("button",{type:"submit",className:`au-submit${v?" is-success":""}`,disabled:S||v,children:S?e.jsx("span",{className:"au-spinner"}):v?e.jsxs(e.Fragment,{children:[e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"#fff",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"20 6 9 17 4 12"})}),a==="signup"?"Account created":"Signed in"]}):a==="signup"?"Create account":"Sign in"}),e.jsxs("p",{className:"au-switch",children:[a==="signup"?"Already have an account? ":"New to Astra? ",e.jsx("button",{type:"button",className:"au-switch-btn",onClick:()=>n(a==="signup"?"login":"signup"),children:a==="signup"?"Sign in":"Create an account"})]})]})]})}function G(){const[a,n]=t.useState("login"),{user:l,loading:o}=F(),r=E();return t.useEffect(()=>{!o&&l&&r("/dashboard",{replace:!0})},[o,l,r]),!o&&l?null:e.jsxs("div",{className:"au-page",children:[e.jsx("style",{children:`
        .au-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 20px 56px;
          background: radial-gradient(ellipse at 50% -10%, rgba(30,64,175,0.28) 0%, rgba(5,7,13,0) 55%), var(--astra-bg);
        }
        .au-card {
          position: relative;
          width: 100%;
          max-width: 408px;
          padding: 36px 34px 30px;
          border-radius: 18px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          animation: au-rise 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        .au-brand {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 28px;
        }
        .au-brand img {
          width: 34px; height: 34px; object-fit: contain;
          border-radius: 8px;
        }
        .au-brand span {
          font-family: 'DM Sans', sans-serif;
          font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: #fff;
        }

        .au-head { margin-bottom: 24px; }
        .au-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 25px; font-weight: 600; letter-spacing: -0.025em;
          margin: 0 0 6px; color: #fafafa;
        }
        .au-sub {
          margin: 0; font-size: 14px; line-height: 1.55;
          color: rgba(255,255,255,0.46);
          font-family: 'Inter', sans-serif;
        }

        .au-form { display: flex; flex-direction: column; }

        .au-field { display: flex; flex-direction: column; margin-bottom: 4px; }
        .au-label-row { margin-bottom: 7px; }
        .au-label-flex { display: flex; justify-content: space-between; align-items: center; }
        .au-label {
          font-family: 'Inter', sans-serif;
          font-size: 12.5px; font-weight: 500; color: rgba(255,255,255,0.66);
          letter-spacing: 0.005em;
        }
        .au-link-btn {
          font-family: 'Inter', sans-serif;
          font-size: 12.5px; font-weight: 500; color: ${u};
          background: none; border: none; padding: 0; cursor: pointer;
        }
        .au-link-btn:hover { color: #7fabff; }

        .au-wrap {
          display: flex; align-items: center;
          height: 46px; border-radius: 10px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.10);
          padding: 0 6px 0 13px;
          transition: border-color 0.16s, box-shadow 0.16s, background 0.16s;
        }
        .au-wrap:focus-within {
          border-color: rgba(59,130,246,0.7);
          background: rgba(59,130,246,0.05);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.14);
        }
        .au-wrap.has-error { border-color: rgba(224,86,79,0.6); }
        .au-wrap.has-error:focus-within { box-shadow: 0 0 0 3px rgba(224,86,79,0.13); }
        .au-input {
          flex: 1; min-width: 0; height: 100%;
          background: transparent; border: 0; outline: 0;
          color: #fff; font-size: 14.5px;
          font-family: 'Inter', sans-serif;
        }
        .au-input::placeholder { color: rgba(255,255,255,0.26); }
        .au-eye {
          width: 34px; height: 34px;
          background: transparent; border: 0; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4); border-radius: 7px;
          transition: color 0.15s, background 0.15s;
        }
        .au-eye:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); }
        .au-err {
          font-family: 'Inter', sans-serif;
          font-size: 12px; min-height: 17px; padding-top: 5px;
          color: rgba(224,86,79,0.95); font-weight: 500;
        }

        .au-strength { display: flex; align-items: center; gap: 10px; margin: 2px 0 14px; transition: opacity 0.25s; }
        .au-strength-bars { display: flex; gap: 4px; flex: 1; }
        .au-bar { flex: 1; height: 3px; border-radius: 2px; transition: background 0.2s; }
        .au-strength-label {
          font-family: 'Inter', sans-serif;
          font-size: 11.5px; font-weight: 500; letter-spacing: 0.01em; white-space: nowrap;
        }

        .au-alert {
          display: flex; align-items: center; gap: 8px;
          margin: 6px 0 14px; padding: 10px 12px;
          border-radius: 9px; font-size: 13px; font-weight: 500;
          font-family: 'Inter', sans-serif;
          color: rgba(255,150,145,0.98);
          background: rgba(224,86,79,0.1);
          border: 1px solid rgba(224,86,79,0.28);
        }
        .au-alert svg { flex-shrink: 0; }

        .au-check {
          display: flex; align-items: center; gap: 9px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.58);
          margin: 2px 0 18px; cursor: pointer; user-select: none;
        }
        .au-check input { display: none; }
        .au-check-box {
          width: 17px; height: 17px; border-radius: 5px;
          border: 1.5px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.03);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.16s, border-color 0.16s; flex-shrink: 0;
        }
        .au-check-box.is-on { background: ${u}; border-color: ${u}; }

        .au-submit {
          height: 47px; border-radius: 10px; border: 1px solid rgba(59,130,246,0.5);
          background: ${u};
          color: #fff; font-size: 14.5px; font-weight: 600;
          font-family: 'Inter', sans-serif; letter-spacing: -0.005em;
          cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          transition: filter 0.15s, transform 0.1s, background 0.2s, border-color 0.2s;
        }
        .au-submit:hover:not(:disabled) { filter: brightness(1.08); }
        .au-submit:active:not(:disabled) { transform: translateY(1px); }
        .au-submit:disabled { cursor: default; }
        .au-submit.is-success { background: #1faf7e; border-color: rgba(31,175,126,0.5); }
        .au-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          animation: au-spin 0.7s linear infinite;
        }

        .au-switch {
          margin: 20px 0 0; text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 13.5px; color: rgba(255,255,255,0.48);
        }
        .au-switch-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          font: inherit; font-weight: 600; color: ${u};
        }
        .au-switch-btn:hover { color: #7fabff; }

        /* Forgot-password modal */
        .au-modal-root {
          position: fixed; inset: 0; z-index: 100000;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .au-modal-scrim {
          position: absolute; inset: 0; border: none; cursor: pointer;
          background: rgba(0,0,0,0.66); backdrop-filter: blur(4px);
        }
        .au-modal {
          position: relative; width: 100%; max-width: 400px;
          padding: 26px 24px 22px; border-radius: 16px;
          background: #0e0f15; border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 24px 70px rgba(0,0,0,0.7);
          animation: au-rise 0.3s cubic-bezier(0.16,1,0.3,1) both;
        }
        .au-modal-title {
          margin: 0 0 10px; font-size: 18px; font-weight: 600; color: #fff;
          font-family: 'DM Sans', sans-serif; letter-spacing: -0.02em;
        }
        .au-modal-text {
          margin: 0 0 20px; font-size: 13.5px; line-height: 1.6;
          color: rgba(255,255,255,0.5); font-family: 'Inter', sans-serif;
        }
        .au-modal-actions { display: flex; gap: 10px; }
        .au-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          flex: 1; min-height: 44px; padding: 0 16px; border-radius: 10px;
          font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 600;
          color: #fff; text-decoration: none; cursor: pointer;
          background: ${u}; border: 1px solid rgba(59,130,246,0.5);
          transition: filter 0.15s;
        }
        .au-btn-primary:hover { filter: brightness(1.08); }
        .au-btn-ghost {
          flex: 1; min-height: 44px; padding: 0 16px; border-radius: 10px;
          font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 600;
          color: rgba(255,255,255,0.72); cursor: pointer;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          transition: background 0.15s;
        }
        .au-btn-ghost:hover { background: rgba(255,255,255,0.09); }

        @keyframes au-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes au-spin { to { transform: rotate(360deg); } }
      `}),e.jsxs("div",{className:"au-card",children:[e.jsxs("div",{className:"au-brand",children:[e.jsx("img",{src:O,alt:"","aria-hidden":"true"}),e.jsx("span",{children:"Astra"})]}),e.jsxs("div",{className:"au-head",children:[e.jsx("h1",{className:"au-title",children:a==="signup"?"Create your account":"Welcome back"}),e.jsx("p",{className:"au-sub",children:a==="signup"?"Free forever. Your games and saves, synced everywhere.":"Sign in to pick up your saves and settings across devices."})]}),e.jsx(Y,{mode:a,setMode:n})]})]})}export{G as default};
