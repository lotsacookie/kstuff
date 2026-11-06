(()=>{
  const $=id=>document.getElementById(id);
  const fill=$('fill'),status=$('status'),logo=$('logo'),bar=document.querySelector('.bar');
  const root=document.documentElement;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  /* ---------- theme -> wallpaper gradient + accent ---------- */
  const hex=c=>{c=String(c||'').trim();let m=c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(!m)return null;let h=m[1];if(h.length==3)h=h.split('').map(x=>x+x).join('');return[0,2,4].map(i=>parseInt(h.substr(i,2),16))};
  const lum=([r,g,b])=>(.2126*r+.7152*g+.0722*b)/255;
  const sat=([r,g,b])=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mx?(mx-mn)/mx:0};
  let themeName='Pitch Black';
  const applyTheme=list=>{
    let id=null;
    try{const u=JSON.parse(localStorage.getItem('kstuff_user'));id=u&&u.settings&&u.settings.theme||u&&u.theme}catch(_){}
    id=id||localStorage.getItem('kstuff_theme')||'theme-pitch-black';
    const t=(list||[]).find(x=>x.id===id);if(!t)return false;
    const v=t.variables||{};themeName=t.name||id;
    const bg=v['--bg-color']||'#000',fg=v['--text-color']||'#fff',nav=v['--nav-bg']||bg,card=v['--card-bg']||nav;
    const s=root.style;s.setProperty('--t-bg',bg);s.setProperty('--t-fg',fg);s.setProperty('--t-nav',nav);s.setProperty('--t-card',card);
    const bgRgb=hex(bg)||[0,0,0],fgRgb=hex(fg)||[255,255,255];
    const light=lum(bgRgb)>.55;root.classList.toggle('light',light);
    const acc=sat(fgRgb)>.18?fg:(light?'#1a73e8':'#8ab4f8');
    s.setProperty('--acc',acc);s.setProperty('--acc-on',lum(hex(acc)||[138,180,248])>.5?'#10131a':'#ffffff');
    const set=$('wp-name');if(set)set.textContent=themeName;
    return true;
  };
  const loadTheme=async()=>{
    try{const c=JSON.parse(localStorage.getItem('kstuff_themes_cache'));if(c&&applyTheme(c))return}catch(_){}
    try{const r=await fetch('Assets/json/themes.json');applyTheme(await r.json())}catch(_){}
  };
  loadTheme();window.addEventListener('storage',loadTheme);
  /* ---------- boot ---------- */
  const assets=[['Styles','os.css'],['System script','os.js']];
  const steps=assets.length+2;let done=0;
  const tick=label=>{done++;fill.style.width=Math.min(100,done/steps*100)+'%';status.textContent=label};
  async function boot(){
    await sleep(300);logo.classList.add('in');
    await sleep(900);bar.classList.add('in');status.classList.add('in');
    for(const [name,url] of assets){
      status.textContent='Loading '+name.toLowerCase();
      try{await (window.__osGet?window.__osGet(url):fetch(url)).then(r=>r.blob())}catch(_){}
      tick('Loaded '+name.toLowerCase());await sleep(250);
    }
    status.textContent='Applying theme';await loadTheme();tick('Theme ready');await sleep(250);
    status.textContent='Starting shell';await sleep(400);tick('Welcome');
    await sleep(500);
    $('desktop').classList.add('on');$('boot').classList.add('out');
    setTimeout(()=>$('boot').remove(),900);
  }
  /* ---------- icons ---------- */
  const ico=(bg,glyph)=>`<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="${bg}"/>${glyph}</svg>`;
  const ICONS={
    files:ico('#1a73e8','<path fill="#fff" d="M13 15h8l3 3h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V17a2 2 0 0 1 2-2z"/>'),
    calc:ico('#188038','<rect x="13" y="11" width="22" height="26" rx="3" fill="#fff"/><rect x="16" y="14" width="16" height="6" rx="1.5" fill="#188038"/><g fill="#188038"><circle cx="18" cy="26" r="1.8"/><circle cx="24" cy="26" r="1.8"/><circle cx="30" cy="26" r="1.8"/><circle cx="18" cy="32" r="1.8"/><circle cx="24" cy="32" r="1.8"/><circle cx="30" cy="32" r="1.8"/></g>'),
    notes:ico('#f9ab00','<rect x="14" y="10" width="20" height="28" rx="3" fill="#fff"/><path stroke="#f9ab00" stroke-width="2.4" stroke-linecap="round" d="M18 18h12M18 24h12M18 30h7"/>'),
    clock:ico('#9334e6','<circle cx="24" cy="24" r="12" fill="#fff"/><path stroke="#9334e6" stroke-width="2.6" stroke-linecap="round" fill="none" d="M24 17v7l5 3"/>'),
    settings:ico('#5f6368','<circle cx="24" cy="24" r="9" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="4.7 3.5"/><circle cx="24" cy="24" r="8.5" fill="#fff"/><circle cx="24" cy="24" r="3.6" fill="#5f6368"/>'),
    sing:ico('#111','<g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M24 11l9 3 3 9-5 8-8 1"/><path d="M24 11l-9 3-3 9 5 8"/><path d="M31 31l-7 4-7-4"/></g><circle cx="24" cy="24" r="3" fill="#fff"/>')
  };
  /* ---------- apps ---------- */
  const calcBody=w=>{
    w.innerHTML='<div class="calc"><div class="out"><small id="ce"></small><b id="cv">0</b></div><div class="keys"></div></div>';
    const keys=['C','(',')','/','7','8','9','*','4','5','6','-','1','2','3','+','0','.','⌫','='];
    const kb=w.querySelector('.keys'),cv=w.querySelector('#cv'),ce=w.querySelector('#ce');let ex='';
    const show=()=>{cv.textContent=ex||'0'};
    keys.forEach(k=>{const b=document.createElement('button');b.textContent=k==='*'?'×':k==='/'?'÷':k;
      if('/*-+'.includes(k))b.className='op';if(k==='=')b.className='eq';
      b.onclick=()=>{
        if(k==='C'){ex='';ce.textContent=''}
        else if(k==='⌫')ex=ex.slice(0,-1);
        else if(k==='='){if(/^[0-9+\-*/.() ]+$/.test(ex)){try{const r=Function('"use strict";return ('+ex+')')();ce.textContent=ex+' =';ex=String(Math.round(r*1e10)/1e10)}catch(_){ce.textContent='Error';ex=''}}}
        else ex+=k;
        show()};kb.appendChild(b)});
  };
  const notesBody=w=>{
    const ta=document.createElement('textarea');ta.placeholder='Take a note…';w.className+=' notes';
    try{ta.value=localStorage.getItem('os_notes')||''}catch(_){}
    ta.oninput=()=>{try{localStorage.setItem('os_notes',ta.value)}catch(_){}};w.appendChild(ta);
  };
  const clockBody=w=>{
    w.innerHTML='<div class="clk"><svg id="an" viewBox="0 0 100 100" width="170" height="170"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="2"/><line id="hh" x1="50" y1="50" x2="50" y2="28" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><line id="mh" x1="50" y1="50" x2="50" y2="17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line id="sh" x1="50" y1="54" x2="50" y2="14" stroke="var(--acc)" stroke-width="1.5" stroke-linecap="round"/><circle cx="50" cy="50" r="3" fill="var(--acc)"/></svg><div class="dig" id="dg"></div><div class="dt" id="dd"></div></div>';
    const t=()=>{if(!w.isConnected){clearInterval(iv);return}const d=new Date();
      const s=d.getSeconds(),m=d.getMinutes()+s/60,h=d.getHours()%12+m/60;
      w.querySelector('#hh').setAttribute('transform',`rotate(${h*30} 50 50)`);w.querySelector('#mh').setAttribute('transform',`rotate(${m*6} 50 50)`);w.querySelector('#sh').setAttribute('transform',`rotate(${s*6} 50 50)`);
      w.querySelector('#dg').textContent=d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit',second:'2-digit'});
      w.querySelector('#dd').textContent=d.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'})};
    const iv=setInterval(t,1000);t();
  };
  const filesBody=w=>{
    w.innerHTML='<div class="files"><aside><div class="sel">My files</div><div>Recent</div><div>Images</div><div>Videos</div><div>Audio</div><div>Downloads</div><div>Trash</div></aside><main>No files here</main></div>';
  };
  const settingsBody=w=>{
    w.innerHTML=`<div class="set"><h3>Wallpaper &amp; style</h3><div class="wp" style="background:${getComputedStyle($('desktop')).backgroundImage}"></div><div class="row"><span>Theme</span><span id="wp-name">${themeName}</span></div><div class="row"><span>Wallpaper</span><span>Gradient (follows Singularity theme)</span></div><h3>About</h3><div class="row"><span>Version</span><span>Singularity OS</span></div><div class="row"><span>Account</span><span>${userName()}</span></div></div>`;
  };
  const APPS=[
    {id:'sing',name:'Singularity',icon:ICONS.sing,exit:true},
    {id:'files',name:'Files',icon:ICONS.files,body:filesBody,w:760,h:480},
    {id:'calc',name:'Calculator',icon:ICONS.calc,body:calcBody,w:320,h:500},
    {id:'notes',name:'Notes',icon:ICONS.notes,body:notesBody,w:420,h:480},
    {id:'clock',name:'Clock',icon:ICONS.clock,body:clockBody,w:360,h:400},
    {id:'settings',name:'Settings',icon:ICONS.settings,body:settingsBody,w:640,h:520}
  ];
  /* ---------- window manager ---------- */
  const wins={};let z=10,cascade=0;
  const closeAll=()=>{$('launcher-panel').classList.remove('open');$('launcher').classList.remove('open');$('qs').classList.remove('open');$('tray').classList.remove('open')};
  const refresh=()=>{document.querySelectorAll('.sapp').forEach(b=>{const w=wins[b.dataset.id];b.classList.toggle('run',!!w);b.classList.toggle('act',!!w&&!w.classList.contains('min')&&+w.style.zIndex===z)})};
  const focus=w=>{w.style.zIndex=++z;refresh()};
  const openApp=app=>{
    closeAll();
    if(app.exit){powerOff();return}
    let w=wins[app.id];
    if(w){if(w.classList.contains('min')){w.classList.remove('min');focus(w)}else if(+w.style.zIndex===z){w.classList.add('min');refresh()}else focus(w);return}
    const host=$('windows'),W=Math.min(app.w,innerWidth-24),H=Math.min(app.h,innerHeight-90);
    w=document.createElement('div');w.className='win';
    const off=(cascade++%6)*28;w.style.cssText=`width:${W}px;height:${H}px;left:${Math.max(8,(innerWidth-W)/2+off-60)}px;top:${Math.max(8,(innerHeight-56-H)/2+off-40)}px`;
    w.innerHTML=`<div class="cap"><span class="ic">${app.icon.replace('<svg','<svg class="ic"')}</span><span class="ttl">${app.name}</span><button class="mn" title="Minimize"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5 18h14v2H5z"/></svg></button><button class="mx" title="Maximize"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5 5h14v14H5V5zm2 2v10h10V7H7z"/></svg></button><button class="x" title="Close"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg></button></div><div class="wbody"></div>`;
    host.appendChild(w);wins[app.id]=w;app.body(w.querySelector('.wbody'));focus(w);
    w.addEventListener('pointerdown',()=>focus(w));
    w.querySelector('.mn').onclick=()=>{w.classList.add('min');refresh()};
    const mx=()=>w.classList.toggle('max');w.querySelector('.mx').onclick=mx;
    w.querySelector('.x').onclick=()=>{w.remove();delete wins[app.id];refresh()};
    const cap=w.querySelector('.cap');cap.addEventListener('dblclick',e=>{if(!e.target.closest('button'))mx()});
    cap.addEventListener('pointerdown',e=>{
      if(e.target.closest('button')||w.classList.contains('max'))return;
      const sx=e.clientX,sy=e.clientY,ox=w.offsetLeft,oy=w.offsetTop;cap.setPointerCapture(e.pointerId);
      const mv=ev=>{w.style.left=Math.min(innerWidth-60,Math.max(-W+120,ox+ev.clientX-sx))+'px';w.style.top=Math.min(innerHeight-100,Math.max(0,oy+ev.clientY-sy))+'px'};
      const up=()=>{cap.removeEventListener('pointermove',mv);cap.removeEventListener('pointerup',up)};
      cap.addEventListener('pointermove',mv);cap.addEventListener('pointerup',up);
    });
  };
  /* ---------- shelf + launcher ---------- */
  APPS.forEach(a=>{const b=document.createElement('button');b.className='sapp';b.dataset.id=a.id;b.title=a.name;b.innerHTML=a.icon;b.onclick=e=>{e.stopPropagation();openApp(a)};$('apps').appendChild(b)});
  const grid=$('lgrid');
  const renderGrid=q=>{
    grid.innerHTML='';const f=APPS.filter(a=>a.name.toLowerCase().includes((q||'').trim().toLowerCase()));
    if(!f.length){grid.innerHTML='<div class="lnone">No results</div>';return}
    f.forEach(a=>{const b=document.createElement('button');b.className='lapp';b.innerHTML=a.icon+'<span>'+a.name+'</span>';b.onclick=e=>{e.stopPropagation();openApp(a)};grid.appendChild(b)});
  };
  renderGrid('');
  const ls=$('lsearch');ls.addEventListener('input',()=>renderGrid(ls.value));ls.addEventListener('click',e=>e.stopPropagation());
  ls.addEventListener('keydown',e=>{if(e.key==='Enter'){const f=APPS.filter(a=>a.name.toLowerCase().includes(ls.value.trim().toLowerCase()));if(f[0])openApp(f[0])}});
  $('launcher').addEventListener('click',e=>{e.stopPropagation();const p=$('launcher-panel'),o=!p.classList.contains('open');closeAll();if(o){p.classList.add('open');$('launcher').classList.add('open');ls.value='';renderGrid('');setTimeout(()=>ls.focus(),50)}});
  $('launcher-panel').addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',closeAll);
  /* ---------- tray / quick settings ---------- */
  const clock=()=>{const d=new Date();$('clock').textContent=d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});$('lk-time').textContent=d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});$('date').textContent=d.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'})};
  clock();setInterval(clock,10000);
  const qs=$('qs'),tray=$('tray');
  tray.addEventListener('click',e=>{e.stopPropagation();const o=!qs.classList.contains('open');closeAll();if(o){qs.classList.add('open');tray.classList.add('open')}});
  qs.addEventListener('click',e=>{e.stopPropagation();const t=e.target.closest('.tile');if(!t)return;t.classList.toggle('on');const on=t.classList.contains('on'),k=t.dataset.k,sm=t.querySelector('small');
    sm.textContent=k==='net'?(on?'Connected':'Off'):on?'On':'Off';
    if(k==='net')$('net').style.opacity=on?1:.35;if(k==='night')$('night').classList.toggle('on',on)});
  $('bright').addEventListener('input',e=>{$('dim').style.opacity=(100-e.target.value)/100*.75});
  const batt=()=>{try{navigator.getBattery().then(b=>{const u=()=>{$('batt').textContent=Math.round(b.level*100)+'%'+(b.charging?' · charging':'')};u();b.onlevelchange=b.onchargingchange=u})}catch(_){$('batt').textContent='100%'}};
  batt();
  const userName=()=>{try{const u=JSON.parse(localStorage.getItem('kstuff_user'));return String(u&&u.username||'').trim()||'Singularity'}catch(_){return 'Singularity'}};
  const nm=userName();$('lk-name').textContent=nm;$('lk-av').textContent=nm[0].toUpperCase();
  /* ---------- lock + power ---------- */
  const ls2=$('lockscreen');
  const lock=()=>{closeAll();ls2.classList.add('on')},unlock=()=>ls2.classList.remove('on');
  $('lock').addEventListener('click',lock);$('unlock').addEventListener('click',unlock);
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&ls2.classList.contains('on'))unlock();if(e.key==='Escape')closeAll()});
  function powerOff(){
    const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;background:#000;opacity:0;transition:opacity .7s;z-index:99';document.body.appendChild(f);
    void f.offsetWidth;f.style.opacity=1;setTimeout(()=>{window.__sgReloading=true;location.reload()},750);
  }
  $('power').addEventListener('click',powerOff);$('signout').addEventListener('click',powerOff);
  boot();
})();
