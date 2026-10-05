(function () {
    if (new Date().getMonth() !== 9) return;

    var BASE = 'https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@latest/Assets/';

    document.documentElement.classList.add('halloween-season');

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE + 'css/halloween.css';
    document.head.appendChild(link);

    var pumpkin = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<ellipse cx="21" cy="37" rx="12" ry="14" fill="#f06000"/>' +
        '<ellipse cx="43" cy="37" rx="12" ry="14" fill="#f06000"/>' +
        '<ellipse cx="32" cy="37" rx="13" ry="14" fill="#ff7a1a"/>' +
        '<rect x="29" y="11" width="6" height="9" rx="2" fill="#4caf50"/>' +
        '<path d="M28 13q4-3 8 0" stroke="#2e7d32" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path d="M19 32l5 7 5-7z" fill="#1a0a00"/>' +
        '<path d="M37 32l5 7 5-7z" fill="#1a0a00"/>' +
        '<path d="M20 46q12 9 24 0z" fill="#1a0a00"/>' +
        '</svg>';

    function addPumpkin(el, badgeClass) {
        if (!el || !el.parentNode) return;
        var wrap = document.createElement('span');
        wrap.className = 'hw-wrap';
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);

        var badge = document.createElement('span');
        badge.className = 'hw-badge ' + badgeClass;
        badge.innerHTML = pumpkin;
        wrap.appendChild(badge);
    }

    addPumpkin(document.getElementById('nav-logo'), 'hw-badge-nav');
    addPumpkin(document.querySelector('#loading-screen .ld-logo'), 'hw-badge-loading');
})();
