(function () {
    if (new Date().getMonth() !== 9) return;
    var key = 'kstuff_gh_Assets/js/holiday.js';
    var api = 'https://api.github.com/repos/lotsacookie/kstuff/contents/Assets/js/holiday.js?ref=main';
    function decode(b64) {
        var bin = atob(b64.replace(/\s/g, ''));
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    }
    function run(src) {
        var s = document.createElement('script');
        s.textContent = src;
        document.head.appendChild(s);
    }
    function useCache() {
        try {
            var cached = JSON.parse(localStorage.getItem(key));
            if (cached && cached.text) run(cached.text);
        } catch (e) {}
    }
    fetch(api, { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
            var text = decode(d.content);
            localStorage.setItem(key, JSON.stringify({ sha: d.sha, text: text }));
            run(text);
        })
        .catch(useCache);
})();
