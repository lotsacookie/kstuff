(function () {
    if (window.__asteroidsStarted) return;
    window.__asteroidsStarted = true;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'asteroid-field';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    var host = document.body;
    host.insertBefore(canvas, host.firstChild);

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1;
    var rocks = [];
    var sparks = [];
    var lastSpawn = 0;
    var nextGap = 700;
    var last = 0;
    var running = true;
    var MAX_ROCKS = 9;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    var probe = document.createElement('span');
    probe.style.cssText = 'position:fixed;left:-9999px;top:0;width:0;height:0;pointer-events:none;color:var(--text);';
    host.appendChild(probe);
    var theme = [255, 255, 255];
    var lastThemeRead = 0;

    function readTheme(now) {
        lastThemeRead = now;
        var m;
        try {
            m = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(getComputedStyle(probe).color);
        } catch (e) {
            m = null;
        }
        if (m) theme = [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3])];
    }

    window.addEventListener('message', function (e) {
        if (e.data === 'theme-updated') setTimeout(function () { readTheme(performance.now()); }, 60);
    });

    function makeShape(radius) {
        var n = 8 + Math.floor(Math.random() * 5);
        var pts = [];
        for (var i = 0; i < n; i++) {
            var a = (i / n) * Math.PI * 2;
            var r = radius * (0.68 + Math.random() * 0.4);
            pts.push([Math.cos(a) * r, Math.sin(a) * r]);
        }
        return pts;
    }

    function spawn() {
        var radius = 5 + Math.random() * 15;
        var speed = 55 + Math.random() * 110;
        var angle = (Math.random() * 40 - 20) * Math.PI / 180;
        var burns = Math.random() < 0.55;
        rocks.push({
            x: Math.random() * (W + 160) - 80,
            y: -radius * 2 - 10,
            vx: Math.sin(angle) * speed * 0.6 + (Math.random() * 30 - 15),
            vy: Math.cos(angle) * speed,
            rot: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 1.4,
            radius: radius,
            shape: makeShape(radius),
            alpha: 0.22 + Math.random() * 0.3,
            burns: burns,
            burnY: H * (0.2 + Math.random() * 0.6),
            burning: false,
            burn: 0,
            burnRate: 0.7 + Math.random() * 0.9,
            tail: 14 + Math.random() * 26
        });
    }

    function emitSparks(r, count) {
        for (var i = 0; i < count; i++) {
            var a = Math.random() * Math.PI * 2;
            var s = 20 + Math.random() * 70;
            sparks.push({
                x: r.x + (Math.random() - 0.5) * r.radius,
                y: r.y + (Math.random() - 0.5) * r.radius,
                vx: Math.cos(a) * s * 0.6 + r.vx * 0.15,
                vy: Math.sin(a) * s * 0.6 - 10,
                life: 0,
                max: 0.5 + Math.random() * 0.7,
                size: 0.8 + Math.random() * 1.8
            });
        }
    }

    function drawRock(r) {
        var fade = r.burning ? Math.max(0, 1 - r.burn) : 1;
        var a = r.alpha * fade;
        if (a <= 0.01) return;

        var speed = Math.sqrt(r.vx * r.vx + r.vy * r.vy) || 1;
        var tx = -r.vx / speed;
        var ty = -r.vy / speed;
        var len = r.tail * (r.burning ? 1 + r.burn * 1.6 : 1);
        var c = theme;

        var g = ctx.createLinearGradient(r.x, r.y, r.x + tx * len, r.y + ty * len);
        g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 0.55).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = Math.max(1.2, r.radius * 0.7 * (r.burning ? 1 - r.burn * 0.5 : 1));
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + tx * len, r.y + ty * len);
        ctx.stroke();

        var scale = r.burning ? 1 - r.burn * 0.65 : 1;
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rot);
        ctx.scale(scale, scale);
        ctx.beginPath();
        for (var i = 0; i < r.shape.length; i++) {
            var p = r.shape[i];
            if (i === 0) ctx.moveTo(p[0], p[1]);
            else ctx.lineTo(p[0], p[1]);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 0.55).toFixed(3) + ')';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')';
        ctx.stroke();

        if (r.radius > 9) {
            ctx.fillStyle = 'rgba(0,0,0,' + (a * 0.22).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(r.radius * 0.22, -r.radius * 0.18, r.radius * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-r.radius * 0.3, r.radius * 0.25, r.radius * 0.13, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        if (r.burning) {
            var glow = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.radius * (1.6 + r.burn));
            glow.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 0.5).toFixed(3) + ')');
            glow.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius * (1.6 + r.burn), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function step(ts) {
        if (!running) return;
        if (!last) last = ts;
        var dt = Math.min((ts - last) / 1000, 0.05);
        last = ts;
        if (ts - lastThemeRead > 1000) readTheme(ts);

        if (ts - lastSpawn > nextGap && rocks.length < MAX_ROCKS) {
            spawn();
            lastSpawn = ts;
            nextGap = 450 + Math.random() * 1500;
        }

        ctx.clearRect(0, 0, W, H);

        for (var i = rocks.length - 1; i >= 0; i--) {
            var r = rocks[i];
            r.x += r.vx * dt;
            r.y += r.vy * dt;
            r.rot += r.spin * dt;

            if (r.burns && !r.burning && r.y > r.burnY) r.burning = true;

            if (r.burning) {
                r.burn += r.burnRate * dt;
                if (Math.random() < 0.7) emitSparks(r, 1 + (Math.random() < 0.3 ? 1 : 0));
                r.vx *= 1 - 0.25 * dt;
                r.vy *= 1 - 0.25 * dt;
                if (r.burn >= 1) {
                    emitSparks(r, 8);
                    rocks.splice(i, 1);
                    continue;
                }
            }

            if (r.y - r.radius > H + r.tail || r.x < -200 || r.x > W + 200) {
                rocks.splice(i, 1);
                continue;
            }
            drawRock(r);
        }

        for (var j = sparks.length - 1; j >= 0; j--) {
            var s = sparks[j];
            s.life += dt;
            if (s.life >= s.max) {
                sparks.splice(j, 1);
                continue;
            }
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.vy += 30 * dt;
            var k = 1 - s.life / s.max;
            ctx.fillStyle = 'rgba(' + theme[0] + ',' + theme[1] + ',' + theme[2] + ',' + (k * 0.5).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * (0.5 + k * 0.5), 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(step);
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            running = false;
        } else {
            running = true;
            last = 0;
            requestAnimationFrame(step);
        }
    });

    window.addEventListener('resize', resize);
    resize();
    readTheme(performance.now());
    requestAnimationFrame(step);
})();
