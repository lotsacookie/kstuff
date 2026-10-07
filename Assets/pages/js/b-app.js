(function () {
    var logoWrap = document.getElementById('logo-wrap');
    if (logoWrap) {
        logoWrap.addEventListener('click', function () {
            logoWrap.classList.remove('burst');
            void logoWrap.offsetWidth;
            logoWrap.classList.add('burst');
        });
        logoWrap.addEventListener('animationend', function (e) {
            if (e.target === logoWrap && e.animationName === 'logo-click') {
                logoWrap.classList.remove('burst');
            }
        });
    }

    var box = document.getElementById('changelog');
    var body = document.getElementById('changelog-body');
    var sources = [
        'https://raw.githubusercontent.com/lotsacookie/kstuff/main/Assets/json/change-log.json',
        'https://cdn.jsdelivr.net/gh/lotsacookie/kstuff@main/Assets/json/change-log.json'
    ];

    function toText(item) {
        if (item == null) return '';
        if (typeof item === 'string') return item;
        if (typeof item === 'number') return String(item);
        return item.text || item.message || item.description || item.title || item.name || '';
    }

    function toList(value) {
        if (value == null) return [];
        if (Array.isArray(value)) return value.map(toText).filter(Boolean);
        if (typeof value === 'string') return [value];
        return [toText(value)].filter(Boolean);
    }

    function normalize(data) {
        var list = null;
        if (Array.isArray(data)) {
            list = data;
        } else if (data && typeof data === 'object') {
            var keys = ['changelog', 'changeLog', 'changes', 'entries', 'log', 'versions', 'updates', 'releases'];
            for (var i = 0; i < keys.length; i++) {
                if (Array.isArray(data[keys[i]])) {
                    list = data[keys[i]];
                    break;
                }
            }
            if (!list) {
                if (data.version || data.date) {
                    list = [data];
                } else {
                    list = Object.keys(data).map(function (k) {
                        return { version: k, changes: data[k] };
                    });
                }
            }
        }
        if (!list) return [];
        var entries = list.map(function (e) {
            if (typeof e === 'string') return { changes: [e] };
            var version = e.version || e.v || e.tag || '';
            var title = e.title || e.name || '';
            if (!version && title) {
                version = title;
                title = '';
            }
            var items = e.changes || e.items || e.notes || e.changelog || e.log || e.list || e.description || e.text || [];
            return {
                version: String(version || ''),
                title: String(title || ''),
                date: String(e.date || e.time || e.released || ''),
                changes: toList(items)
            };
        }).filter(function (e) {
            return e.version || e.title || e.changes.length;
        });
        var allDated = entries.length > 1 && entries.every(function (e) {
            return e.date && !isNaN(Date.parse(e.date));
        });
        if (allDated) {
            entries.sort(function (a, b) {
                return Date.parse(b.date) - Date.parse(a.date);
            });
        }
        return entries.slice(0, 4);
    }

    function render(entries) {
        body.textContent = '';
        entries.forEach(function (e) {
            var wrap = document.createElement('div');
            var head = document.createElement('div');
            head.className = 'changelog-entry-head';
            if (e.version) {
                var v = document.createElement('span');
                v.className = 'changelog-version';
                v.textContent = e.version;
                head.appendChild(v);
            }
            if (e.title) {
                var t = document.createElement('span');
                t.className = 'changelog-title';
                t.textContent = e.title;
                head.appendChild(t);
            }
            if (e.date) {
                var d = document.createElement('span');
                d.className = 'changelog-date';
                d.textContent = e.date;
                head.appendChild(d);
            }
            wrap.appendChild(head);
            if (e.changes.length) {
                var ul = document.createElement('ul');
                ul.className = 'changelog-list';
                e.changes.forEach(function (c) {
                    var li = document.createElement('li');
                    li.textContent = c;
                    ul.appendChild(li);
                });
                wrap.appendChild(ul);
            }
            body.appendChild(wrap);
        });
    }

    function showStatus(text) {
        body.textContent = '';
        var s = document.createElement('div');
        s.className = 'changelog-status';
        s.textContent = text;
        body.appendChild(s);
    }

    function load(index) {
        if (index >= sources.length) {
            showStatus('Change log unavailable');
            return;
        }
        fetch(sources[index], { cache: 'no-cache' })
            .then(function (res) {
                if (!res.ok) throw new Error('bad status');
                return res.json();
            })
            .then(function (data) {
                var entries = normalize(data);
                if (!entries.length) throw new Error('empty');
                render(entries);
            })
            .catch(function (err) {
                console.warn('Change log source failed:', sources[index], err);
                load(index + 1);
            });
    }

    box.hidden = false;
    showStatus('Loading...');
    load(0);
})();
