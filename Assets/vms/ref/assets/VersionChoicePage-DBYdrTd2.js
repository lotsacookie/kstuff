import{j as e}from"./vendor-ui-tZMmN1M_.js";import{u as n}from"./vendor-react-BLSnyxkJ.js";import{a as s,n as o}from"./index-C45bD3V2.js";import"./vendor-radix-C74W69qG.js";const c=[{mode:"full",title:"Full",to:"/"},{mode:"minimal",title:"Minimal",to:"/lite"}];function m(){const t=n(),i=(a,r)=>{o(a),t(r,{replace:!0})};return e.jsxs("div",{className:"vc-page",children:[e.jsx(l,{}),e.jsxs("div",{className:"vc-inner",children:[e.jsxs("div",{className:"vc-brand",children:[e.jsx("img",{src:s,alt:"","aria-hidden":"true"}),e.jsx("span",{children:"Astra"})]}),e.jsx("h1",{className:"vc-title",children:"Choose your version"}),e.jsx("p",{className:"vc-sub",children:"You can change this later in settings."}),e.jsx("div",{className:"vc-grid",children:c.map(a=>e.jsxs("button",{type:"button",className:"vc-card",onClick:()=>i(a.mode,a.to),children:[e.jsx("span",{className:"vc-card-title",children:a.title}),e.jsx("span",{className:"vc-go",children:"Continue"})]},a.mode))})]})]})}function l(){return e.jsx("style",{children:`
      .vc-page {
        min-height: 100vh; min-height: 100dvh; width: 100%;
        display: flex; align-items: center; justify-content: center;
        padding: 40px 20px;
        background:
          radial-gradient(ellipse at 50% -10%, rgba(30,64,175,0.26) 0%, rgba(5,7,13,0) 55%),
          var(--astra-bg, #05070d);
      }
      .vc-inner { width: 100%; max-width: 720px; }
      .vc-brand {
        display: flex; align-items: center; justify-content: center; gap: 16px;
        margin-bottom: 34px;
      }
      .vc-brand img { width: 56px; height: 56px; object-fit: contain; border-radius: 12px; }
      .vc-brand span {
        font-family: 'DM Sans', sans-serif; font-size: 30px; font-weight: 600;
        letter-spacing: -0.02em; color: #fff;
      }
      .vc-title {
        margin: 0 0 6px; text-align: center;
        font-family: 'DM Sans', sans-serif; font-size: 26px; font-weight: 600;
        letter-spacing: -0.025em; color: #fafafa;
      }
      .vc-sub {
        margin: 0 0 30px; text-align: center;
        font-family: 'Inter', sans-serif; font-size: 14px;
        color: rgba(255,255,255,0.44);
      }
      .vc-grid { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
      @media (max-width: 640px) { .vc-grid { grid-template-columns: 1fr; } }

      .vc-card {
        display: flex; flex-direction: column; align-items: center; gap: 18px;
        padding: 32px 20px 24px; border-radius: 16px; cursor: pointer;
        background: rgba(255,255,255,0.025);
        border: 1px solid rgba(255,255,255,0.09);
        transition: border-color 0.16s, background 0.16s, transform 0.1s;
      }
      .vc-card:hover {
        border-color: rgba(59,130,246,0.55);
        background: rgba(59,130,246,0.05);
      }
      .vc-card:active { transform: translateY(1px); }
      .vc-card-title {
        font-family: 'DM Sans', sans-serif; font-size: 22px; font-weight: 600;
        letter-spacing: -0.02em; color: #fff;
      }
      .vc-go {
        width: 100%; text-align: center;
        padding: 9px 0; border-radius: 9px;
        font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 600;
        color: #fff; background: #3b82f6; border: 1px solid rgba(59,130,246,0.5);
      }
    `})}export{m as default};
