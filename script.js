(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $('#year').textContent = new Date().getFullYear();

  /* Typing effect in the hero */
  var typed = $('#typed');
  var phrases = ['friendly interfaces.', 'React & Next.js apps.', 'mobile apps with React Native.', 'AI-powered features.', 'things people enjoy using.'];
  if (typed && !reduce) {
    var p = 0, c = 0, del = false;
    (function tick() {
      var word = phrases[p];
      typed.textContent = word.slice(0, c);
      var wait = del ? 35 : 75;
      if (!del && c === word.length) { del = true; wait = 1500; }
      else if (del && c === 0) { del = false; p = (p + 1) % phrases.length; wait = 350; }
      else c += del ? -1 : 1;
      setTimeout(tick, wait);
    })();
  }

  /* Scroll progress bar + active nav link */
  var bar = $('.progress');
  var links = $$('.nav nav a');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    var h = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    var cur = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Reveal on scroll + animated counters */
  function count(el) {
    var end = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suffix; return; }
    var t0 = performance.now();
    setTimeout(function () { el.textContent = end + suffix; }, 1300);
    (function step(t) {
      var k = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (k === 1 ? suffix : '');
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-count]', e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Project filters */
  var projects = $$('.project');
  $$('.filters .chip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.filters .chip').forEach(function (b) { b.classList.toggle('on', b === btn); });
      var f = btn.dataset.filter;
      projects.forEach(function (card) {
        var show = f === 'all' || card.dataset.tags.split(' ').indexOf(f) > -1;
        card.classList.toggle('hide', !show);
      });
    });
  });

  /* Project modal */
  var modal = $('#modal'), body = $('#modal-body'), last;
  function openModal(card) {
    last = card;
    body.innerHTML = card.innerHTML;
    var tags = card.dataset.tags.split(' ').map(function (t) {
      return '<span>' + ({ web: 'Web', mobile: 'Mobile', ai: 'AI', fullstack: 'Full-stack' }[t] || t) + '</span>';
    }).join('');
    body.insertAdjacentHTML('beforeend', '<p class="chips soft">' + tags + '</p>');
    modal.hidden = false;
    document.body.classList.add('lock');
    $('.modal-x').focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('lock');
    if (last) last.focus();
  }
  projects.forEach(function (card) {
    card.addEventListener('click', function (e) { if (!e.target.closest('a')) openModal(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
  });
  $('.modal-x').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
})();
