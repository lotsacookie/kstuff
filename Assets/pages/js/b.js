let cachedQuote = "";
let cachedCommitHash = "";

const cleanUrl = u => u ? u.replace(/\/+$/, '') : '';
const trimSlash = u => u ? u.replace(/^\/+/, '') : '';

function encode(str) {
    if (!str) return str;
    return encodeURIComponent(
        str
            .toString()
            .split('')
            .map((char, ind) =>
                ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char
            )
            .join('')
    );
}

const defaultShortcuts = [
    ['semaG', 'kstuff://ga' + 'mes', 'ph-game-controller'],
    ['sppA', 'kstuff://ap' + 'ps', 'ph-app-window'],
    ['cisuM', 'kstuff://mu' + 'sic', 'ph-music-notes'],
    ['VT', 'kstuff://t' + 'v', 'ph-monitor-play'],
    ['IA', 'kstuff://a' + 'i', 'ph-robot'],
    ['sMV', 'kstuff://vm' + 's', 'ph-desktop'],
    ['tahC', 'kstuff://ch' + 'at', 'ph-chats']
];

let flashcards = JSON.parse(localStorage.getItem('study_flashcards')) || [];

function addFlashcard(name, url) {
    if (!name || !url) return;
    flashcards.push({ name, url });
    localStorage.setItem('study_flashcards', JSON.stringify(flashcards));
    renderFlashcards();
}

const ENGINES = {
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
    google: { name: 'Google', url: 'https://www.google.com/search?q=%s' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
    brave: { name: 'Brave', url: 'https://search.brave.com/search?q=%s' },
    startpage: { name: 'Startpage', url: 'https://www.startpage.com/sp/search?query=%s' },
    ecosia: { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=%s' },
    yahoo: { name: 'Yahoo', url: 'https://search.yahoo.com/search?p=%s' }
};
function engineKey() { try { const k = localStorage.getItem('kstuff_search_engine'); if (ENGINES[k]) return k; } catch (e) {} return 'duckduckgo'; }
function getEngine() { return ENGINES[engineKey()]; }

function formatUrl(rawUrl, allowSearch = false) {
    let validUrl = rawUrl.trim();
    if (!validUrl) return '';
    if (validUrl === 'kstuff://home') return 'kstuff://home';
    if (validUrl.startsWith('http://') || validUrl.startsWith('https://')) return validUrl;
    
    if (allowSearch && (!validUrl.includes('.') || validUrl.includes(' '))) {
        return getEngine().url.replace('%s', encodeURIComponent(validUrl));
    }
    return 'https://' + validUrl;
}

const libraryHome = document.getElementById('library-home');
const addFlashcardMainBtn = document.getElementById('add-flashcard-main-btn');
const flashcardsContainer = document.getElementById('flashcards-container');

const librarySearchInput = document.getElementById('library-search-input');
const librarySearchBtn = document.getElementById('library-search-btn');

const examModal = document.getElementById('exam-modal');
const examNameInput = document.getElementById('exam-name-input');
const examUrlInput = document.getElementById('exam-url-input');
const examSaveBtn = document.getElementById('exam-save-btn');
const examCancelBtn = document.getElementById('exam-cancel-btn');

let currentModalCallback = null;

async function fetchLatestQuote() {
    const KEY = 'kstuff_messages_cache_v1';
    const show = list => {
        if (!Array.isArray(list) || !list.length) return false;
        cachedQuote = `"${list[Math.floor(Math.random() * list.length)]}"`;
        document.querySelectorAll('.library-home-quote').forEach(el => { el.textContent = cachedQuote; });
        return true;
    };
    try {
        const sg = window.parent && window.parent !== window && window.parent.singularity;
        if (sg && sg.has('Assets/json/messages.json') && show(sg.json('Assets/json/messages.json'))) return;
    } catch (e) {}
    let shown = false;
    try { shown = show(JSON.parse(localStorage.getItem(KEY))); } catch (e) {}
    try {
        const r = await fetch('https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/json/messages.json');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const list = await r.json();
        try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
        if (!shown) show(list);
    } catch (err) {
        console.warn('Could not load random quote:', err);
    }
}
fetchLatestQuote();

function openExamModal(defaultName, defaultUrl, callback) {
    examNameInput.value = defaultName || '';
    examUrlInput.value = defaultUrl || '';
    currentModalCallback = callback;
    examModal.classList.add('active');
    examNameInput.focus();
}

function closeExamModal() {
    examModal.classList.remove('active');
    currentModalCallback = null;
}

examSaveBtn.addEventListener('click', () => {
    if (currentModalCallback) currentModalCallback(examNameInput.value.trim(), examUrlInput.value.trim());
    closeExamModal();
});
examCancelBtn.addEventListener('click', closeExamModal);

function renderFlashcards() {
    flashcardsContainer.innerHTML = '';
    
    defaultShortcuts.forEach(([name, url, icon]) => {
        const card = document.createElement('div');
        card.className = 'flashcard-card';
        
        const normalName = name.split('').reverse().join('');
        const letterDivs = normalName.split('').map(letter => `<div>${letter}</div>`).join('');

        card.innerHTML = `
            <div class="flashcard-icon-wrapper">
                <div class="flashcard-icon">
                    <i class="ph ${icon}"></i>
                </div>
            </div>
            <span class="flashcard-name" title="${normalName}">${letterDivs}</span>
        `;
        card.addEventListener('click', () => {
            window.parent.postMessage(`nav: ${normalName}`, '*');
        });
        flashcardsContainer.appendChild(card);
    });

    flashcards.forEach((fc, index) => {
        const card = document.createElement('div');
        card.className = 'flashcard-card';
        
        let faviconUrl = '';
        try { faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(formatUrl(fc.url)).hostname}&sz=64`; } catch(e) {}

        card.innerHTML = `
            <div class="flashcard-icon-wrapper">
                <button class="remove-flashcard-btn" title="Remove Shortcut">&times;</button>
                <div class="flashcard-icon">
                    ${faviconUrl ? `<img src="${faviconUrl}" alt="${fc.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" /><span style="display:none;">${fc.name.charAt(0).toUpperCase()}</span>` : `<span>${fc.name.charAt(0).toUpperCase()}</span>`}
                </div>
            </div>
            <span class="flashcard-name" title="${fc.name}">${fc.name}</span>
        `;

        card.querySelector('.remove-flashcard-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            flashcards.splice(index, 1);
            localStorage.setItem('study_flashcards', JSON.stringify(flashcards));
            renderFlashcards();
        });

        card.addEventListener('click', () => {
            const targetUrl = formatUrl(fc.url, true);
            window.parent.postMessage(targetUrl, '*');
        });
        flashcardsContainer.appendChild(card);
    });
}
renderFlashcards();

function handleSearch() {
    const query = librarySearchInput.value.trim();
    if (!query) return;
    const targetUrl = formatUrl(query, true);
    window.parent.postMessage(targetUrl, '*');
}

librarySearchBtn.addEventListener('click', handleSearch);
librarySearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

addFlashcardMainBtn.addEventListener('click', () => openExamModal('', '', addFlashcard));


(function initEngineMenu() {
    const box = document.querySelector('.library-search-container');
    if (!box) return;
    const wrap = document.createElement('div');
    wrap.className = 'se-menu';
    wrap.innerHTML = '<button type="button" class="se-trigger" aria-haspopup="listbox" aria-expanded="false"><span class="se-label"></span><svg viewBox="0 0 10 6" width="9" height="6"><path d="M0 0l5 6 5-6z" fill="currentColor"/></svg></button><div class="se-list" role="listbox"></div>';
    box.insertBefore(wrap, box.firstChild);
    const trig = wrap.querySelector('.se-trigger'), label = wrap.querySelector('.se-label'), list = wrap.querySelector('.se-list');
    const render = () => {
        label.textContent = getEngine().name;
        list.innerHTML = '';
        Object.keys(ENGINES).forEach(k => {
            const o = document.createElement('div');
            o.className = 'se-opt' + (k === engineKey() ? ' sel' : '');
            o.setAttribute('role', 'option');
            o.textContent = ENGINES[k].name;
            o.addEventListener('click', () => {
                try { localStorage.setItem('kstuff_search_engine', k); } catch (e) {}
                try { window.parent.localStorage.setItem('kstuff_search_engine', k); } catch (e) {}
                wrap.classList.remove('open'); trig.setAttribute('aria-expanded', 'false'); render();
            });
            list.appendChild(o);
        });
    };
    trig.addEventListener('click', e => { e.stopPropagation(); const o = wrap.classList.toggle('open'); trig.setAttribute('aria-expanded', o); });
    document.addEventListener('click', () => { wrap.classList.remove('open'); trig.setAttribute('aria-expanded', 'false'); });
    render();
})();



(function initCursorTip() {
    const tip = document.createElement('div');
    tip.className = 'cursor-tip';
    document.body.appendChild(tip);
    let cur=null, timer=0;
    const strip=el=>{
      const t=el.getAttribute('title'); if(t===null) return;
      el.removeAttribute('title');
      if(!t.trim()) return;
      el.setAttribute('data-tip',t);
      if(!el.hasAttribute('aria-label')&&!el.textContent.trim()) el.setAttribute('aria-label',t);
    };
    const scan=n=>{ if(n.nodeType!==1) return; if(n.hasAttribute('title')) strip(n); n.querySelectorAll('[title]').forEach(strip); };
    scan(document.documentElement);
    new MutationObserver(ms=>{ for(const m of ms){ if(m.type==='attributes') strip(m.target); else m.addedNodes.forEach(scan); } })
      .observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['title']});
    const place=(x,y)=>{
      const t=tip.getBoundingClientRect();
      const px=Math.max(6,Math.min(innerWidth-t.width-6,x+14));
      let py=y+18; if(py+t.height>innerHeight-6) py=y-t.height-12;
      tip.style.left=px+'px'; tip.style.top=Math.max(6,py)+'px';
    };
    const hide=()=>{ clearTimeout(timer); cur=null; tip.classList.remove('show'); };
    const textFor = el => {
        if (el.dataset.tip) return el.dataset.tip;
        const n = el.querySelector('.flashcard-name');
        return n ? n.textContent.trim() : '';
    };
    const show = (el, e) => {
        const text = textFor(el);
        if (!text) return hide();
        cur = el; tip.textContent = text; tip.classList.add('show');
        place(e.clientX, e.clientY);
    };
    const targetOf = e => e.target.closest && e.target.closest('[data-tip], .flashcard-card');
    document.addEventListener('mouseover', e => { const el = targetOf(e); if (el) show(el, e); else hide(); });
    document.addEventListener('mousemove', e => { if (cur) place(e.clientX, e.clientY); });
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mousedown', hide);
    document.addEventListener('scroll', hide, true);
    document.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse') return;
        const el = targetOf(e);
        if (el) { show(el, e); clearTimeout(timer); timer = setTimeout(hide, 1800); }
    });
})();
