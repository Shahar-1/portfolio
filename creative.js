(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Accent colour picker ---------- */
  var presets = {
    violet: ['#5b4bdb', '#8b7bff'], cyan: ['#0a8fb8', '#5cc8ff'], pink: ['#d63b78', '#ff6ba6'],
    mint: ['#0a8f77', '#2fe3c2'], amber: ['#b86e00', '#ffd166']
  };
  var names = Object.keys(presets);
  var current = null;
  function isDark() { return true; }
  function applyAccent(name) {
    current = name;
    root.style.setProperty('--accent', presets[name][isDark() ? 1 : 0]);
    $$('.swatches button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.a === name)); });
    try { localStorage.setItem('accent', name); } catch (e) {}
  }
  $$('.swatches button').forEach(function (b) {
    b.addEventListener('click', function () { applyAccent(b.dataset.a); });
  });
  try { var saved = localStorage.getItem('accent'); if (saved && presets[saved]) applyAccent(saved); } catch (e) {}

  /* ---------- Hero code editor types itself ---------- */
  var code = $('#code');
  var SRC = [
    'const shahar = {',
    '  role: "Software Engineer",',
    '  stack: ["React", "Next.js", "TypeScript"],',
    '  builds: "friendly interfaces",',
    '  leads: "teams of 5",',
    '  languages: 6,',
    '  openTo: "opportunities anywhere",',
    '};',
    '',
    '// let\'s build something together'
  ].join('\n');
  function paint(n) {
    var t = SRC.slice(0, n).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    t = t.replace(/(\/\/.*)|(^const )|^(\s+)(\w+)(?=:)|("[^"\n]*"?)/gm, function (m, c, k, sp, key, s) {
      if (c) return '<span class="c">' + c + '</span>';
      if (k) return '<span class="k">' + k + '</span>';
      if (key) return sp + '<span class="p">' + key + '</span>';
      return '<span class="s">' + s + '</span>';
    });
    code.innerHTML = t + '<span class="caret" aria-hidden="true"></span>';
  }
  if (code) {
    if (reduce) paint(SRC.length);
    else {
      var n = 0;
      function tick() {
        paint(n);
        if (n++ < SRC.length) setTimeout(tick, SRC[n - 1] === '\n' ? 140 : 32);
      }
      var begin = function () { setTimeout(tick, 400); };
      if (root.classList.contains('loading')) addEventListener('portfolio:ready', begin, { once: true }); else begin();
    }
  }

  /* ---------- Command palette (Ctrl/Cmd + K) ---------- */
  var pal = $('#palette'), input = $('#pal-input'), list = $('#pal-list'), sel = 0, shown = [], before;
  function go2(id) { return function () { var el = $(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }; }
  var cmds = [
    ['Go to About', 'section', go2('#about')], ['Go to Work', 'section', go2('#work')],
    ['Go to Projects', 'section', go2('#projects')], ['Go to Skills', 'section', go2('#skills')], ['Go to Contact', 'section', go2('#contact')],
    ['Next accent colour', 'theme', function () { applyAccent(names[(names.indexOf(current || 'violet') + 1) % names.length]); }],
    ['Download résumé', 'file', function () { var a = document.createElement('a'); a.href = 'Shahar_Banu_Software_Engineer.pdf'; a.download = ''; a.click(); }],
    ['Send an email', 'contact', function () { location.href = 'mailto:shaharbanu.h1@gmail.com'; }],
    ['Open LinkedIn', 'contact', function () { window.open('https://www.linkedin.com/in/shahar-banu-788198219', '_blank', 'noopener'); }]
  ];
  function render() {
    var q = input.value.trim().toLowerCase();
    shown = cmds.filter(function (c) { return !q || c[0].toLowerCase().indexOf(q) > -1 || c[1].indexOf(q) > -1; });
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.innerHTML = shown.length ? shown.map(function (c, i) {
      return '<li role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '">' + c[0] + '<small>' + c[1] + '</small></li>';
    }).join('') : '<li aria-selected="false">No matches</li>';
  }
  function openPal() { before = document.activeElement; input.value = ''; sel = 0; render(); pal.hidden = false; document.body.classList.add('lock'); input.focus(); }
  function closePal() { pal.hidden = true; document.body.classList.remove('lock'); if (before && before.focus) before.focus(); }
  function run(i) { var c = shown[i]; if (!c) return; closePal(); setTimeout(c[2], 50); }
  input.addEventListener('input', function () { sel = 0; render(); });
  list.addEventListener('click', function (e) { var li = e.target.closest('li[data-i]'); if (li) run(+li.dataset.i); });
  list.addEventListener('pointermove', function (e) {
    var li = e.target.closest('li[data-i]');
    if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; $$('li', list).forEach(function (x, i) { x.setAttribute('aria-selected', String(i === sel)); }); }
  });
  pal.addEventListener('click', function (e) { if (e.target === pal) closePal(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
    else if (e.key === 'Escape') { closePal(); }
  });
  addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPal() : closePal(); }
  });
  $('#open-pal').addEventListener('click', openPal);
})();
