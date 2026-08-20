/* Theme toggling. */
(function () {
    var root = document.documentElement;
    var button = document.querySelector('[data-theme-toggle]');
    if (!button)
        return;

    function sync() {
        var dark = root.getAttribute('data-theme') === 'dark';
        button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        button.setAttribute('title', dark ? 'Light theme' : 'Dark theme');
    }

    button.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        sync();
    });

    sync();
})();

/* External links and PDFs open in a new tab. */
(function () {
    var here = location.hostname.replace(/^www\./, '');
    var links = document.querySelectorAll('a[href]');
    for (var i=0; i<links.length; ++i) {
        var a = links[i];
        // Skip mailto:, tel:, javascript:, etc.
        if (a.protocol !== 'http:' && a.protocol !== 'https:')
            continue;
        var external = a.hostname.replace(/^www\./, '') !== here;
        var isPdf = /\.pdf($|\?)/i.test(a.pathname || '');
        if (external || isPdf) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
    }
})();

/* Highlight Contact in the nav while that section is on screen. */
(function () {
    var section     = document.getElementById('contact');
    var homeLink    = document.querySelector('[data-nav="home"]');
    var contactLink = document.querySelector('[data-nav="contact"]');
    if (!section || !homeLink || !contactLink)
        return;   // not the home page

    function mark(el, on) {
        if (on) el.setAttribute('aria-current', 'page');
        else    el.removeAttribute('aria-current');
    }

    var ticking = false;
    function update() {
        ticking = false;
        var rect = section.getBoundingClientRect();
        var vh   = window.innerHeight;

        // Bottom of the document, within 4px - the section may be too short
        // to ever reach the middle of the screen.
        var atBottom = (window.innerHeight + Math.ceil(window.scrollY)) >=
                    (document.documentElement.scrollHeight - 4);

        var active = atBottom || (rect.top < vh * 0.4 && rect.bottom > 0);

        mark(contactLink, active);
        mark(homeLink, !active);
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
})();

/* Figure rows crop to the shortest image's aspect ratio. */
(function () {
  document.querySelectorAll('.figrow').forEach(function (row) {
    var imgs = Array.prototype.slice.call(row.querySelectorAll('img'));
    if (!imgs.length) return;

    function apply() {
      var ratios = imgs
        .filter(function (i) { return i.naturalWidth; })
        .map(function (i) { return i.naturalWidth / i.naturalHeight; });
      if (ratios.length !== imgs.length) return;   // wait for all
      row.style.setProperty('--ar', Math.max.apply(null, ratios));
    }

    imgs.forEach(function (i) {
      i.complete ? apply() : i.addEventListener('load', apply);
    });
  });
})();

/* Build the project TOC from h2s, and track the active one. */
(function () {
  var toc = document.querySelector('.toc');
  var prose = document.querySelector('.prose');
  if (!toc || !prose)
    return;

  var heads = Array.prototype.slice.call(prose.querySelectorAll('h2, h3'));
  if (heads.length < 2)
    return;

  var links = heads.map(function (h, i) {
    if (!h.id)
      h.id = 'section-' + i;
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.className = h.tagName === 'H3' ? 'toc__sub' : 'toc__top';
    toc.appendChild(a);
    return a;
  });

  var ticking = false;
  function update() {
    ticking = false;
    var active = 0;
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].getBoundingClientRect().top < window.innerHeight * 0.3)
        active = i;
    }
    links.forEach(function (a, i) {
      if (i === active) a.setAttribute('aria-current', 'true');
      else              a.removeAttribute('aria-current');
    });
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();

/* Keep scroll offsets in sync with the nav's actual height. */
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  function sync() {
    var h = nav.offsetHeight;
    document.documentElement.style.scrollPaddingTop = (h + 24) + 'px';
    document.documentElement.style.setProperty('--nav-h', h + 'px');
  }

  window.addEventListener('resize', sync);
  window.addEventListener('load', sync);
  sync();
})();
