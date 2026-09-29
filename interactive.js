(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Loader ---------- */
  var loader = $('#loader');
  function ready() {
    if (!root.classList.contains('loading')) return;
    loader.classList.add('done');
    root.classList.remove('loading');
    window.dispatchEvent(new Event('portfolio:ready'));
    setTimeout(function () { loader.remove(); }, 1200);
  }
  if (loader && root.classList.contains('loading')) {
    var t0 = Date.now(), dur = 1700, pctEl = $('#ld-pct');
    var iv = setInterval(function () {
      var k = Math.min((Date.now() - t0) / dur, 1), e = 1 - Math.pow(1 - k, 2), p = Math.round(e * 100);
      loader.style.setProperty('--p', p);
      pctEl.textContent = p + '%';
      if (k >= 1) { clearInterval(iv); setTimeout(ready, 250); }
    }, 30);
    loader.addEventListener('click', function () { clearInterval(iv); ready(); });
  } else if (loader) { loader.remove(); }

  /* ---------- Particle constellation ---------- */
  var cv = $('#bg'), ctx = cv.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0, pts = [], sparks = [];
  var mouse = { x: -9999, y: -9999 }, rgb = '139,123,255', frames = 0;
  function readColor() {
    var c = getComputedStyle(root).getPropertyValue('--accent').trim();
    var m = /^#?([0-9a-f]{6})$/i.exec(c);
    if (m) { var n = parseInt(m[1], 16); rgb = (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
  }
  function resize() {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.min(90, Math.floor(W * H / 17000) * (W < 700 ? 0.6 : 1));
    pts = [];
    for (var i = 0; i < count; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, r: Math.random() * 1.4 + .8 });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var i, j, a, b, dx, dy, d;
    for (i = 0; i < pts.length; i++) {
      a = pts[i];
      dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
      if (d < 170 && d > 1) { a.vx += dx / d * .012; a.vy += dy / d * .012; }
      var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
      if (sp > .9) { a.vx *= .96; a.vy *= .96; }
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0) a.x = W; else if (a.x > W) a.x = 0;
      if (a.y < 0) a.y = H; else if (a.y > H) a.y = 0;
      ctx.fillStyle = 'rgba(' + rgb + ',.65)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      for (j = i + 1; j < pts.length; j++) {
        b = pts[j]; dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
        if (d < 14400) { ctx.strokeStyle = 'rgba(' + rgb + ',' + (.28 * (1 - d / 14400)) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
      if (d < 170) { ctx.strokeStyle = 'rgba(' + rgb + ',' + (.5 * (1 - d / 170)) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    for (i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += .06; s.vx *= .985; s.life -= 1;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.fillStyle = 'rgba(' + s.c + ',' + (s.life / s.max) + ')';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
  }
  var COLORS = ['139,123,255', '92,200,255', '255,107,166', '47,227,194', '255,209,102'];
  window.__burst = function (x, y) {
    for (var i = 0; i < 26; i++) {
      var ang = Math.random() * 6.283, sp = 1.5 + Math.random() * 4, life = 40 + Math.random() * 30;
      sparks.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, r: 1.5 + Math.random() * 2, life: life, max: life, c: COLORS[i % COLORS.length] });
    }
    if (reduce) draw();
  };
  readColor(); resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
  if (reduce) draw();
  else (function loop() {
    if (++frames % 60 === 0) readColor();
    draw();
    requestAnimationFrame(loop);
  })();

  /* ---------- Letter-by-letter section headings ---------- */
  var n = 0;
  $$('.reveal h2').forEach(function (h2) {
    Array.prototype.slice.call(h2.childNodes).forEach(function (node) {
      if (node.nodeType !== 3 || !node.textContent.trim()) return;
      var text = node.textContent.trim();
      var wrap = document.createElement('span');
      var sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = text;
      var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
      text.split(' ').forEach(function (word, wi) {
        if (wi) vis.appendChild(document.createTextNode(' '));
        var w = document.createElement('span'); w.className = 'w';
        word.split('').forEach(function (ch) {
          var c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; c.style.setProperty('--i', n++); w.appendChild(c);
        });
        vis.appendChild(w);
      });
      n = 0;
      wrap.appendChild(sr); wrap.appendChild(vis);
      h2.replaceChild(wrap, node);
    });
  });

  /* ---------- Interactive hero: 3D tilt, depth parallax, click sparks ---------- */
  var art = $('.hero-art');
  if (art) {
    function tilt(e) {
      var r = art.getBoundingClientRect();
      var nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      var ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      art.style.setProperty('--nx', nx.toFixed(3)); art.style.setProperty('--ny', ny.toFixed(3));
    }
    function rest() { art.style.setProperty('--nx', 0); art.style.setProperty('--ny', 0); }
    if (!reduce) {
      art.addEventListener('pointermove', tilt);
      art.addEventListener('pointerleave', rest);
    }
    art.addEventListener('pointerdown', function (e) {
      window.__burst(e.clientX, e.clientY);
      art.classList.remove('spark'); void art.offsetWidth; art.classList.add('spark');
    });
  }
})();
