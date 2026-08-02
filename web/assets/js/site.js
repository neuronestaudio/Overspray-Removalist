/* The Overspray Removalist - interaction layer.
   Every effect here is motivated: reveal sequences content on entry, the compare
   slider IS the proof of the service, count-up draws the eye to the credibility
   numbers, and the magnetic/spotlight pull gives CTAs and cards physical feedback.
   All of it collapses to static under prefers-reduced-motion. */
(function () {
  'use strict';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile drawer ---------- */
  (function () {
    var burger = document.querySelector('.burger');
    var drawer = document.getElementById('drawer');
    if (!burger || !drawer) return;
    var closeBtn = drawer.querySelector('.drawer-close');

    function open() {
      drawer.classList.add('open');
      drawer.removeAttribute('aria-hidden');
      burger.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
      var first = drawer.querySelector('a, button');
      if (first) first.focus();
    }
    function close() {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      burger.focus();
    }
    burger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    drawer.addEventListener('click', function (e) { if (e.target.tagName === 'A') close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) close();
    });
  })();

  /* ---------- cursor spotlight on cards (feedback: shows what is hoverable) ---------- */
  if (!RM) {
    document.addEventListener('pointermove', function (e) {
      if (!e.target.closest) return;
      var el = e.target.closest('.cell');
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });

    /* magnetic pull on primary CTAs */
    document.addEventListener('pointermove', function (e) {
      if (!e.target.closest) return;
      var b = e.target.closest('.btn-primary');
      if (!b) return;
      var r = b.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      b.style.setProperty('--tx', (dx * 4).toFixed(1) + 'px');
      b.style.setProperty('--ty', (dy * 4).toFixed(1) + 'px');
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var b = e.target.closest && e.target.closest('.btn-primary');
      if (b) { b.style.removeProperty('--tx'); b.style.removeProperty('--ty'); }
    }, { passive: true });
  }

  /* ---------- scroll reveal + stat count-up ---------- */
  if (!RM && 'IntersectionObserver' in window) {
    var targets = [];
    document.querySelectorAll('.head, .cell, .step, .who li, .gal figure, .split-media, .compare-wrap, .cta-panel')
      .forEach(function (el) { targets.push(el); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove('rz');
        en.target.classList.add('rz-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    var vh = innerHeight;
    targets.forEach(function (t, i) {
      if (t.getBoundingClientRect().top < vh * 0.92) return;  // already in view: never hide
      t.classList.add('rz');
      t.style.transitionDelay = ((i % 5) * 70) + 'ms';
      io.observe(t);
    });

    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); io2.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (n) { io2.observe(n); });
  }

  function countUp(el) {
    var raw = el.getAttribute('data-count');
    var suffix = el.getAttribute('data-suffix') || '';
    var target = parseFloat(raw);
    if (isNaN(target)) return;
    var dur = 1200, start = null;
    requestAnimationFrame(function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString('en-AU') + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('en-AU') + suffix;
    });
  }

  /* ---------- before / after comparison slider ----------
     This is the proof of the service, so it is interactive rather than two
     static photos: the user performs the removal themselves. */
  document.querySelectorAll('[data-compare]').forEach(function (root) {
    var pane = root.querySelector('.compare');
    if (!pane) return;
    var beforeImg = pane.querySelector('.before-layer');
    var afterImg = pane.querySelector('.after-layer');
    var cap = root.querySelector('.compare-cap');
    var dragging = false;

    function setSplit(pct) {
      pct = Math.max(0, Math.min(100, pct));
      pane.style.setProperty('--split', pct + '%');
      pane.setAttribute('aria-valuenow', Math.round(pct));
    }
    function touched() {
      pane.setAttribute('data-touched', 'true');
      pane.classList.remove('nudging');
    }
    function fromEvent(e) {
      var r = pane.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      setSplit(x / r.width * 100);
    }

    /* One-time demonstration: when the slider first scrolls into view it sweeps
       itself open and back. It teaches the interaction without a caption, and
       it is the one animation on the page that IS the product. */
    if (!RM && 'IntersectionObserver' in window) {
      var shown = false;
      var demo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || shown) return;
          shown = true;
          demo.unobserve(pane);
          setTimeout(function () {
            if (pane.getAttribute('data-touched') === 'true') return;
            pane.classList.add('nudging');
            [[74, 0], [30, 620], [50, 1240]].forEach(function (s) {
              setTimeout(function () {
                if (pane.getAttribute('data-touched') !== 'true') setSplit(s[0]);
              }, s[1]);
            });
            setTimeout(function () { pane.classList.remove('nudging'); }, 1900);
          }, 420);
        });
      }, { threshold: 0.45 });
      demo.observe(pane);
    }
    pane.addEventListener('pointerdown', function (e) {
      e.preventDefault();          // stop text/image selection hijacking the drag
      dragging = true;
      touched();
      try { pane.setPointerCapture(e.pointerId); } catch (err) {}
      fromEvent(e);
    });
    pane.addEventListener('pointerenter', touched);
    pane.addEventListener('dragstart', function (e) { e.preventDefault(); });
    pane.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    pane.addEventListener('pointerup', function () { dragging = false; });
    pane.addEventListener('pointercancel', function () { dragging = false; });

    /* keyboard: the slider is a real focusable control */
    pane.addEventListener('keydown', function (e) {
      var cur = parseFloat(pane.getAttribute('aria-valuenow') || '50');
      var handled = true;
      if (e.key === 'ArrowLeft') setSplit(cur - 4);
      else if (e.key === 'ArrowRight') setSplit(cur + 4);
      else if (e.key === 'Home') setSplit(0);
      else if (e.key === 'End') setSplit(100);
      else handled = false;
      if (handled) { touched(); e.preventDefault(); }
    });
    pane.addEventListener('focus', touched);

    /* job switcher */
    root.querySelectorAll('.compare-thumbs button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('.compare-thumbs button').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        beforeImg.src = btn.getAttribute('data-before');
        afterImg.src = btn.getAttribute('data-after');
        beforeImg.alt = btn.getAttribute('data-alt-before') || '';
        afterImg.alt = btn.getAttribute('data-alt-after') || '';
        if (cap) cap.textContent = btn.getAttribute('data-caption') || '';
        touched();
        setSplit(50);
      });
    });
  });

  /* ---------- quote form: photo upload, validation, states ---------- */
  (function () {
    var form = document.getElementById('quote-form');
    if (!form) return;

    var drop = form.querySelector('.drop');
    var fileInput = form.querySelector('#photos');
    var thumbs = form.querySelector('.thumbs');
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');
    var files = [];
    var MAX = 8;
    var MAX_BYTES = 10 * 1024 * 1024;

    function render() {
      thumbs.innerHTML = '';
      files.forEach(function (f, i) {
        var d = document.createElement('div');
        d.className = 'thumb';
        var img = document.createElement('img');
        img.alt = 'Selected photo ' + (i + 1) + ': ' + f.name;
        img.src = URL.createObjectURL(f);
        img.onload = function () { URL.revokeObjectURL(img.src); };
        var rm = document.createElement('button');
        rm.type = 'button';
        rm.setAttribute('aria-label', 'Remove ' + f.name);
        rm.textContent = '×';
        rm.addEventListener('click', function () { files.splice(i, 1); render(); });
        d.appendChild(img); d.appendChild(rm);
        thumbs.appendChild(d);
      });
    }

    function accept(list) {
      var rejected = [];
      [].slice.call(list).forEach(function (f) {
        if (files.length >= MAX) { rejected.push(f.name + ' (limit ' + MAX + ')'); return; }
        if (!/^image\//.test(f.type)) { rejected.push(f.name + ' (not an image)'); return; }
        if (f.size > MAX_BYTES) { rejected.push(f.name + ' (over 10MB)'); return; }
        files.push(f);
      });
      render();
      if (rejected.length) {
        status.setAttribute('data-state', 'error');
        status.textContent = 'Skipped: ' + rejected.join(', ');
      } else if (files.length) {
        status.removeAttribute('data-state');
        status.textContent = files.length + (files.length === 1 ? ' photo attached.' : ' photos attached.');
      }
    }

    if (drop && fileInput) {
      drop.addEventListener('click', function () { fileInput.click(); });
      drop.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
      });
      fileInput.addEventListener('change', function () { accept(fileInput.files); fileInput.value = ''; });
      ['dragenter', 'dragover'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
      });
      drop.addEventListener('drop', function (e) {
        if (e.dataTransfer && e.dataTransfer.files) accept(e.dataTransfer.files);
      });
    }

    function setError(field, msg) {
      var wrap = field.closest('.field');
      var err = wrap.querySelector('.field-err');
      wrap.classList.toggle('invalid', !!msg);
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
      return !msg;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var v = f.value.trim();
        var msg = '';
        if (!v) msg = 'This field is required.';
        else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid email address.';
        else if (f.type === 'tel' && v.replace(/\D/g, '').length < 8) msg = 'Enter a valid contact number.';
        if (!setError(f, msg)) ok = false;
      });
      if (!ok) {
        status.setAttribute('data-state', 'error');
        status.textContent = 'Please correct the highlighted fields.';
        var bad = form.querySelector('.field.invalid input, .field.invalid textarea');
        if (bad) bad.focus();
        return;
      }

      submit.setAttribute('aria-busy', 'true');
      var label = submit.textContent;
      submit.textContent = files.length ? 'Preparing photos…' : 'Sending…';
      status.removeAttribute('data-state');
      status.textContent = '';

      var payload = {};
      new FormData(form).forEach(function (v, k) { if (k !== 'photos') payload[k] = v; });

      Promise.all(files.map(shrink)).then(function (photos) {
        submit.textContent = 'Sending…';
        payload.photos = photos;
        return fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        location.assign('/thank-you');
      }).catch(function () {
        submit.removeAttribute('aria-busy');
        submit.textContent = label;
        status.setAttribute('data-state', 'error');
        status.innerHTML = 'That did not send. Please call ' +
          '<a href="tel:0412107464" style="color:inherit;text-decoration:underline">0412 107 464</a> ' +
          'or email <a href="mailto:info@overspray.com.au" style="color:inherit;text-decoration:underline">info@overspray.com.au</a>.';
      });
    });

    /* Downscale before upload. Job photos come off a phone at 4000px and 6MB;
       1600px is plenty to identify fallout type and keeps the request small
       enough for a serverless body limit, and fast on site over mobile data. */
    function shrink(file) {
      return new Promise(function (resolve) {
        var url = URL.createObjectURL(file);
        var im = new Image();
        im.onload = function () {
          URL.revokeObjectURL(url);
          var max = 1600;
          var w = im.width, h = im.height;
          if (w > max || h > max) {
            var s = Math.min(max / w, max / h);
            w = Math.round(w * s); h = Math.round(h * s);
          }
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(im, 0, 0, w, h);
          resolve({ name: file.name.replace(/\.[^.]+$/, '') + '.jpg',
                    data: c.toDataURL('image/jpeg', 0.82).split(',')[1] });
        };
        im.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
        im.src = url;
      });
    }

    form.querySelectorAll('[required]').forEach(function (f) {
      f.addEventListener('blur', function () {
        if (f.value.trim()) setError(f, '');
      });
    });
  })();
})();
