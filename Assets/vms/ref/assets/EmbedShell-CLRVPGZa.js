import{j as t}from"./vendor-ui-tZMmN1M_.js";import{r as n}from"./vendor-react-BLSnyxkJ.js";import{a as o}from"./index-C45bD3V2.js";function l({proxy:e}){const[s,a]=n.useState(!1);return s?t.jsx("span",{className:"eb-wordmark",children:e.name}):t.jsx("img",{src:e.logo,alt:e.name,className:e.logoIcon?"eb-proxy-icon":"eb-proxy-logo",onError:()=>a(!0)})}function p({proxy:e,title:s,status:a,error:r}){const i=e?.accent??"#3b82f6";return t.jsxs("div",{className:"eb-page",children:[t.jsx(d,{accent:i,bg:e?.bg,glow:e?.glow}),t.jsxs("div",{className:"eb-center",children:[e&&t.jsxs("div",{className:"eb-brand",children:[t.jsx("img",{src:o,alt:"Astra",className:"eb-astra-logo"}),t.jsx("span",{className:"eb-x",children:"×"}),t.jsx(l,{proxy:e})]}),r?t.jsx("p",{className:"eb-error",children:r}):t.jsxs(t.Fragment,{children:[t.jsx("p",{className:"eb-title",children:s??"Loading"}),t.jsx("div",{className:"eb-bar",children:t.jsx("div",{className:"eb-bar-fill"})}),t.jsx("p",{className:"eb-status",children:a})]})]})]})}function d({accent:e,bg:s,glow:a}){const r=s??"var(--astra-bg, #05070d)",i=a?`radial-gradient(ellipse 90% 60% at 50% 110%, ${a}55 0%, transparent 70%),`:"";return t.jsx("style",{children:`
      /* Absolute against the shell's own relative full-height wrapper.
         Not fixed: a transformed ancestor becomes the containing block for
         fixed children too, so this would collapse to its content height.
         Not static either — the app shell sizes its container to content, so
         a percentage height would have nothing to resolve against. Embed
         routes also skip the page transition (see App.tsx) so no transform
         ever lands on an ancestor. */
      .eb-page {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        padding: 24px; overflow: hidden;
        background:
          radial-gradient(ellipse at 50% 0%, ${e}22 0%, rgba(5,7,13,0) 60%),
          ${i}
          ${r};
      }
      .eb-center {
        display: flex; flex-direction: column; align-items: center;
        width: 100%; max-width: 380px; text-align: center;
      }
      .eb-brand {
        display: flex; align-items: center; justify-content: center; gap: 14px;
        margin-bottom: 30px;
        animation: eb-rise 0.6s cubic-bezier(0.16,1,0.3,1) both;
      }
      .eb-astra-logo {
        width: 40px; height: 40px; object-fit: contain; border-radius: 9px;
        filter: drop-shadow(0 0 14px ${e}66);
        animation: eb-pulse 2.6s ease-in-out infinite;
      }
      /* Height-driven with auto width: partner logos vary in aspect (Velara's
         is ~3.75:1), and a fixed square box would letterbox a wide one down to
         nothing. */
      .eb-proxy-logo {
        height: 30px; width: auto; max-width: 150px; object-fit: contain;
        filter: drop-shadow(0 0 12px ${e}55);
      }
      .eb-proxy-icon {
        width: 40px; height: 40px; object-fit: cover; border-radius: 50%;
      }
      .eb-wordmark {
        font-family: 'DM Sans', sans-serif; font-size: 19px; font-weight: 600;
        letter-spacing: -0.02em; color: #fff;
      }
      .eb-x {
        font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 400;
        color: rgba(255,255,255,0.32);
      }
      .eb-title {
        margin: 0 0 18px; font-family: 'DM Sans', sans-serif;
        font-size: 20px; font-weight: 600; letter-spacing: -0.02em; color: #fafafa;
        animation: eb-rise 0.6s 0.06s cubic-bezier(0.16,1,0.3,1) both;
      }
      .eb-bar {
        width: 100%; height: 3px; border-radius: 2px; overflow: hidden;
        background: rgba(255,255,255,0.08);
      }
      .eb-bar-fill {
        width: 40%; height: 100%; border-radius: 2px;
        background: linear-gradient(90deg, transparent, ${e}, transparent);
        animation: eb-sweep 1.5s ease-in-out infinite;
      }
      .eb-status {
        margin: 14px 0 0; font-family: 'Inter', sans-serif;
        font-size: 13.5px; color: rgba(255,255,255,0.5);
      }
      .eb-error {
        margin: 0; font-family: 'Inter', sans-serif; font-size: 14px;
        line-height: 1.6; color: rgba(255,150,145,0.98);
      }
      @keyframes eb-rise {
        from { opacity: 0; transform: translateY(9px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes eb-pulse {
        0%, 100% { transform: scale(1); filter: drop-shadow(0 0 14px ${e}66); }
        50% { transform: scale(1.06); filter: drop-shadow(0 0 22px ${e}aa); }
      }
      @keyframes eb-sweep {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(320%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .eb-astra-logo, .eb-bar-fill, .eb-brand, .eb-title { animation: none; }
        .eb-bar-fill { width: 100%; }
      }
    `})}export{p as E};
