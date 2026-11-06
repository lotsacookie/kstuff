(()=>{
  const $=id=>document.getElementById(id);
  const fill=$('fill'),status=$('status'),logo=$('logo'),bar=document.querySelector('.bar');
  const assets=[['Styles','os.css'],['Wallpaper','wallpaper.svg'],['System script','os.js']];
  const steps=assets.length+2;let done=0;
  const tick=label=>{done++;fill.style.width=Math.min(100,done/steps*100)+'%';status.textContent=label};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function boot(){
    await sleep(300);logo.classList.add('in');
    await sleep(900);bar.classList.add('in');status.classList.add('in');
    for(const [name,url] of assets){
      status.textContent='Loading '+name.toLowerCase();
      try{await (window.__osGet?window.__osGet(url):fetch(url)).then(r=>r.blob())}catch(_){}
      tick('Loaded '+name.toLowerCase());await sleep(250);
    }
    status.textContent='Preparing fonts';
    try{await document.fonts.ready}catch(_){}
    tick('Fonts ready');await sleep(250);
    status.textContent='Starting shell';await sleep(400);tick('Welcome');
    await sleep(500);
    $('desktop').classList.add('on');$('boot').classList.add('out');
    setTimeout(()=>$('boot').remove(),900);
  }
  const clock=()=>{const d=new Date();$('clock').textContent=d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})};
  clock();setInterval(clock,10000);
  $('launcher').addEventListener('click',e=>{e.stopPropagation();$('launcher-panel').classList.toggle('open')});
  document.addEventListener('click',e=>{if(!e.target.closest('#launcher-panel'))$('launcher-panel').classList.remove('open')});
  const qs=$('qs'),tray=$('tray');
  const upd=()=>{$('date').textContent=new Date().toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'})};upd();
  tray.addEventListener('click',e=>{e.stopPropagation();$('launcher-panel').classList.remove('open');qs.classList.toggle('open');tray.classList.toggle('open',qs.classList.contains('open'))});
  qs.addEventListener('click',e=>{e.stopPropagation();const t=e.target.closest('.tile');if(t)t.classList.toggle('on')});
  document.addEventListener('click',()=>{qs.classList.remove('open');tray.classList.remove('open')});
  $('power').addEventListener('click',()=>{
    const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;background:#000;opacity:0;transition:opacity .7s;z-index:99';document.body.appendChild(f);
    void f.offsetWidth;f.style.opacity=1;setTimeout(()=>{window.__sgReloading=true;location.reload()},750);
  });
  boot();
})();
