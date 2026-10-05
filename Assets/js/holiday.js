(function () {
    if (new Date().getMonth() !== 9) return;

    var root = document.documentElement;
    root.classList.add('halloween-season');

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/css/halloween.css';
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

    var navLogo = document.getElementById('nav-logo');
    if (navLogo) {
        var badge = document.createElement('span');
        badge.className = 'hw-badge hw-badge-nav';
        badge.innerHTML = pumpkin;
        navLogo.appendChild(badge);
    }

    var loading = document.getElementById('loading-screen');
    if (loading) {
        var lb = document.createElement('span');
        lb.className = 'hw-badge hw-badge-loading';
        lb.innerHTML = pumpkin;
        loading.appendChild(lb);
    }
})();
