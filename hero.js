(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Giant name: letters react to the cursor ---------- */
  var h1 = $('.hero-title h1');
  if (h1) {
    var letters = [];
    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    var wrapText = function (node, cls) {
      var frag = document.createDocumentFragment(), chars = node.textContent.split('');
      chars.forEach(function (c, i) {
        if (c === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
        var s = document.createElement('span');
        s.className = 'hl ' + cls; s.setAttribute('aria-hidden', 'true'); s.textContent = c;
        if (cls === 'b') s.style.setProperty('--t', (i / Math.max(chars.length - 1, 1)).toFixed(2));
        frag.appendChild(s); letters.push(s);
      });
      node.parentNode.replaceChild(frag, node);
    };
    var jobs = [];
    Array.prototype.forEach.call(h1.childNodes, function (n) {
      if (n.nodeType === 3 && n.textContent.trim()) jobs.push([n, 'a']);
      else if (n.nodeType === 1 && n.classList.contains('scribble') && n.firstChild && n.firstChild.nodeType === 3) jobs.push([n.firstChild, 'b']);
    });
    jobs.forEach(function (j) { wrapText(j[0], j[1]); });

    if (!reduce) {
      var mx = -9999, my = -9999, raf = 0;
      var update = function () {
        raf = 0;
        letters.forEach(function (l) {
          var r = l.getBoundingClientRect();
          var d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
          l.style.setProperty('--k', Math.max(0, 1 - d / Math.max(170, r.width * 1.7)).toFixed(3));
        });
      };
      addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
      document.addEventListener('pointerleave', function () { mx = my = -9999; update(); });
    }
  }

  /* ---------- Interactive terminal ---------- */
  var out = $('#term-out'), input = $('#term-in'), body = $('#term-body');
  if (!out || !input) return;

  function print(text, cls) {
    var d = document.createElement('div');
    d.className = 'tl' + (cls ? ' ' + cls : '');
    d.textContent = text;
    out.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function lines(arr, cls) { arr.forEach(function (l) { print(l, cls); }); }
  function go(sel) { var el = $(sel); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  var SECTIONS = { about: '#about', work: '#work', experience: '#work', projects: '#projects', skills: '#skills', contact: '#contact' };
  var ACCENTS = ['violet', 'cyan', 'pink', 'mint', 'amber'];

  var C = {
    help: function () {
      lines([
        'Try one of these:',
        '  whoami        who am I?',
        '  about         a little background',
        '  experience    where I have worked',
        '  projects      things I have built',
        '  skills        my toolbox',
        '  contact       how to reach me',
        '  open <name>   jump to a section on this page',
        '  theme <name>  violet | cyan | pink | mint | amber',
        '  clear         tidy up the screen'
      ]);
    },
    whoami: function () {
      print('Shahar Banu · Software Engineer', 'hi');
      lines(['I build friendly interfaces for web and mobile.', 'Open to opportunities anywhere.']);
    },
    about: function () {
      lines([
        'B.Tech in Electronics & Communication (CGPA 8.35).',
        'Front-end engineer at IBIL Solutions since March 2023.',
        'Started as a junior developer at AIMS Solutions.',
        'I use Claude Code, Cursor and v0 in my daily work.'
      ]);
    },
    experience: function () {
      lines([
        '2023 → now    Software Engineer, IBIL Solutions',
        '2022 → 2023   Junior Software Developer, AIMS',
        'Led a team of 5 through the final phase of a project.'
      ]);
    },
    projects: function () {
      lines([
        '01  WorkPlus       HR & workforce platform',
        '02  NIDD           care consultations for children',
        '03  GEMEX          medical cannabis marketplace (USA)',
        '04  LIIIGHTHOUSE   large-scale full-stack web app',
        '05  Haven          responsive website',
        '06  Billing        secure billing software (C#, .NET)',
        '07  Care           responsive website'
      ]);
      print('tip: type "open projects" to see the cards', 'dim');
    },
    skills: function () {
      lines([
        'languages   JavaScript, TypeScript, C#, Python',
        'web         React, Next.js, React Native, Tailwind, Node.js',
        'ai          Claude Code, Cursor, v0, LLM integration',
        'tools       Git, Jira, Figma, Cypress, MS SQL'
      ]);
    },
    contact: function () {
      lines([
        'email      shaharbanu.h1@gmail.com',
        'linkedin   linkedin.com/in/shahar-banu-788198219',
        'phone      88488 51630'
      ]);
      print('tip: type "email" to write to me', 'dim');
    },
    email: function () { print('Opening your mail app…', 'ok'); location.href = 'mailto:shaharbanu.h1@gmail.com'; },
    ls: function () { print('about  work  projects  skills  contact'); },
    open: function (arg) {
      var sel = SECTIONS[arg];
      if (!sel) { print('open: which section? about, work, projects, skills or contact', 'err'); return; }
      print('Scrolling to ' + arg + '…', 'ok'); go(sel);
    },
    theme: function (arg) {
      if (ACCENTS.indexOf(arg) < 0) { print('theme: pick one of ' + ACCENTS.join(', '), 'err'); return; }
      var b = $('.swatches button[data-a="' + arg + '"]');
      if (b) { b.click(); print('Accent colour is now ' + arg + '.', 'ok'); }
    },
    clear: function () { out.innerHTML = ''; },
    sudo: function (arg, all) {
      if (all.join(' ') === 'hire shahar') {
        print('[sudo] permission granted ✔', 'ok');
        print('Excellent decision. Sending confetti…', 'hi');
        var r = $('.terminal').getBoundingClientRect();
        [0, 250, 500].forEach(function (t) { setTimeout(function () { if (window.__burst) window.__burst(r.left + r.width * (.25 + Math.random() * .5), r.top + r.height * .4); }, t); });
      } else { print('sudo: nice try. (hint: sudo hire shahar)', 'err'); }
    }
  };
  var NAMES = Object.keys(C);
  var history = [], hi = 0;

  function run(raw, silent) {
    var text = raw.trim();
    if (!silent) print('$ ' + text, 'cmd');
    if (!text) return;
    var parts = text.split(/\s+/), cmd = parts[0].toLowerCase(), rest = parts.slice(1).map(function (p) { return p.toLowerCase(); });
    if (C.hasOwnProperty(cmd)) C[cmd](rest[0], rest);
    else print('command not found: ' + cmd + ' (type help)', 'err');
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var v = input.value; input.value = '';
      if (v.trim()) { history.push(v); hi = history.length; }
      run(v);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); if (hi > 0) input.value = history[--hi] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); input.value = hi < history.length - 1 ? history[++hi] : (hi = history.length, '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      var m = NAMES.filter(function (n) { return n.indexOf(input.value.toLowerCase()) === 0; });
      if (input.value && m.length === 1) input.value = m[0];
    }
  });
  body.addEventListener('click', function () { if (!getSelection().toString()) input.focus({ preventScroll: true }); });

  /* welcome + auto-typed first command */
  function intro() {
    print('Welcome! This is a tiny shell about me. Type "help" to explore.', 'dim');
    if (reduce) { run('whoami'); return; }
    var word = 'whoami', i = 0;
    input.readOnly = true;
    (function step() {
      input.value = word.slice(0, ++i);
      if (i < word.length) return setTimeout(step, 110);
      setTimeout(function () { input.value = ''; run(word); input.readOnly = false; }, 350);
    })();
  }
  if (root.classList.contains('loading')) addEventListener('portfolio:ready', function () { setTimeout(intro, 700); }, { once: true });
  else setTimeout(intro, 600);
})();
