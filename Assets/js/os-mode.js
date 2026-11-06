(()=>{
  const go=()=>{
    const b=document.getElementById('os-mode-btn');
    if(!b||b.dataset.bound)return;b.dataset.bound='1';
    b.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      if(window.__osLaunching)return;window.__osLaunching=true;
      const f=document.createElement('div');f.id='os-fade';document.documentElement.appendChild(f);
      void f.offsetWidth;f.classList.add('on');
      setTimeout(()=>{
        window.__sgReloading=true; // lets us leave past the beforeunload guard
        try{document.body.innerHTML='';}catch(_){}
        location.assign('Assets/os/index.html');
      },800);
    },true);
  };
  if(document.readyState!=='loading')go();else document.addEventListener('DOMContentLoaded',go);
  window.addEventListener('load',go);
})();
