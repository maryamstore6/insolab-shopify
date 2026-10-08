/* ============================================================
   InsoLab — theme behaviour
   Kept from the static build; the order form is now a real Shopify
   product form, so the old client-side price table is gone.
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  var lenis = null;

  /* ---------- Lenis smooth scroll ---------- */
  function initLenis() {
    if (prefersReduced || typeof Lenis === 'undefined') return null;
    var instance = new Lenis({
      duration: 1.3,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true, wheelMultiplier: 1.1, touchMultiplier: 1.8, infinite: false
    });
    if (window.ScrollTrigger && typeof gsap !== 'undefined') {
      instance.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { instance.raf(time * 1000); });
      gsap.ticker.lagSmoothing(500, 33);
    } else {
      (function raf(time) { instance.raf(time); requestAnimationFrame(raf); })();
    }
    return instance;
  }

  /* ---------- nav ---------- */
  function closeNav() {
    var nav = document.querySelector('.nav');
    var toggle = document.querySelector('.nav-toggle');
    var wasOpen = nav && nav.classList.contains('is-open');
    if (nav) nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (wasOpen && toggle) toggle.focus();
    if (lenis) lenis.start();
  }
  function openNav() {
    var nav = document.querySelector('.nav');
    var toggle = document.querySelector('.nav-toggle');
    if (!nav) return;
    nav.classList.add('is-open');
    document.body.classList.add('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
  }
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var closeBtn = document.querySelector('.nav-close');
    var nav = document.querySelector('.nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });
    nav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !nav.classList.contains('is-open')) return;
      var f = nav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && nav.classList.contains('is-open')) closeNav();
    }, { passive: true });
  }

  /* ---------- smooth anchors ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.6 });
        else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeNav();
      });
    });
  }

  /* ---------- header + progress ---------- */
  function initChrome() {
    var hdr = document.querySelector('.hdr');
    var progress = document.querySelector('.progress');
    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      var stuck = y > 40;
      if (hdr) hdr.classList.toggle('is-stuck', stuck);
      document.documentElement.classList.toggle('hdr-stuck', stuck);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var btn = item.querySelector('.faq-q');
      var panel = item.querySelector('.faq-a');
      if (!btn || !panel) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        var group = item.parentElement;
        if (group) {
          group.querySelectorAll('.faq-item.is-open').forEach(function (other) {
            if (other === item) return;
            other.classList.remove('is-open');
            var op = other.querySelector('.faq-a');
            var ob = other.querySelector('.faq-q');
            if (op) op.style.height = '0px';
            if (ob) ob.setAttribute('aria-expanded', 'false');
          });
        }
        item.classList.toggle('is-open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
        panel.style.height = isOpen ? '0px' : panel.scrollHeight + 'px';
      });
    });
    window.addEventListener('resize', function () {
      document.querySelectorAll('.faq-item.is-open .faq-a').forEach(function (p) {
        p.style.height = p.scrollHeight + 'px';
      });
    }, { passive: true });
  }

  /* ---------- quantity stepper + live total ----------
     Every id is namespaced with the Shopify section id, so this resolves
     the stepper and the form from the SAME section instance. The price
     table is gone: values come from the rendered product/variant. */
  var MAX_QTY = 10;

  function money(cents) {
    // Shopify renders money with the store's format; mirror it simply here.
    return 'RM' + (cents / 100).toFixed(2).replace(/\.00$/, '');
  }

  function initQty(scope) {
    scope = scope || document;
    var form = scope.querySelector('form[id^="order-form-"]');
    if (!form) return;

    var sid = (form.id || '').replace('order-form-', '');
    var wrap = form.closest('[data-order-section]') || scope;
    var unitPrice = parseFloat(wrap.getAttribute('data-unit-price')) * 100 || 0;
    var minus = scope.querySelector('[id="qty-minus-' + sid + '"]');
    var plus  = scope.querySelector('[id="qty-plus-' + sid + '"]');
    var val   = scope.querySelector('[id="qty-value-' + sid + '"]');
    var cta   = scope.querySelector('[id="cta-total-' + sid + '"]');
    var unit  = form.querySelector('input[name="id"]');
    var sel   = scope.querySelector('[id="variant-select-' + sid + '"]');

    var qtyInput = form.querySelector('input[name="quantity"]');
    if (!qtyInput) {
      qtyInput = document.createElement('input');
      qtyInput.type = 'hidden';
      qtyInput.name = 'quantity';
      qtyInput.value = '1';
      form.appendChild(qtyInput);
    }

    function pickedPrice() {
      var picked = scope.querySelector('.pick.is-picked');
      if (picked) {
        var v = picked.getAttribute('data-variant');
        if (v && unit) unit.value = v;
        return parseFloat(picked.getAttribute('data-price')) * 100 || 0;
      }
      if (sel) {
        var opt = sel.options[sel.selectedIndex];
        if (opt && unit) unit.value = sel.value;
        return parseFloat(opt ? opt.getAttribute('data-price') : 0) * 100 || 0;
      }
      return unitPrice;
    }

    function render() {
      var q = parseInt(qtyInput.value, 10) || 1;
      if (val) val.textContent = String(q);
      if (minus) minus.disabled = q <= 1;
      if (plus) plus.disabled = q >= MAX_QTY;
      var price = pickedPrice();
      if (cta && price) cta.textContent = money(price * q);
    }

    if (minus) minus.addEventListener('click', function () {
      var q = parseInt(qtyInput.value, 10) || 1;
      if (q > 1) { qtyInput.value = q - 1; render(); }
    });
    if (plus) plus.addEventListener('click', function () {
      var q = parseInt(qtyInput.value, 10) || 1;
      if (q < MAX_QTY) { qtyInput.value = q + 1; render(); }
    });

    scope.querySelectorAll('.pick').forEach(function (p) {
      p.addEventListener('click', function () {
        scope.querySelectorAll('.pick').forEach(function (o) { o.classList.remove('is-picked'); });
        p.classList.add('is-picked');
        qtyInput.value = '1';
        render();
      });
    });

    if (sel) sel.addEventListener('change', render);
    render();
  }

  function initAllQty() {
    var wraps = document.querySelectorAll('[data-order-section]');
    if (!wraps.length) return;
    wraps.forEach(function (w) { initQty(w); });
  }

  /* ---------- films: play only while visible ---------- */
  function initFilms() {
    var films = Array.prototype.slice.call(document.querySelectorAll('.split-visual-film'));
    if (!films.length) return;
    if (prefersReduced) {
      films.forEach(function (v) {
        if (v.tagName === 'VIDEO') { v.removeAttribute('autoplay'); v.pause(); }
      });
      return;
    }
    films.forEach(function (v) {
      if (v.tagName !== 'VIDEO') return;
      var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
      if (!('IntersectionObserver' in window)) { play(); return; }
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? play() : v.pause(); });
      }, { threshold: 0.25 }).observe(v);
    });
  }

  /* ---------- GSAP choreography ---------- */
  function initGsap() {
    var revealAll = function () {
      document.querySelectorAll('.hero .line-inner').forEach(function (el) { el.style.transform = 'none'; });
      document.querySelectorAll('.hero-sub, .hero-actions, .hero-meta, .hero-visual')
        .forEach(function (el) { el.style.opacity = '1'; });
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.style.opacity = '1'; el.style.transform = 'none';
      });
    };

    if (typeof gsap === 'undefined') { revealAll(); return; }
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    if (prefersReduced) {
      gsap.set('.hero .line-inner', { y: 0 });
      gsap.set('[data-reveal]', { opacity: 1, y: 0 });
      return;
    }

    gsap.to('.hero .line-inner', { y: 0, duration: 1.25, ease: 'expo.out', stagger: 0.09, delay: 0.15 });
    gsap.from('.hero-sub, .hero-actions, .hero-meta', { y: 26, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.55 });
    gsap.from('.hero-visual', { y: 60, opacity: 0, scale: 0.96, duration: 1.5, ease: 'expo.out', delay: 0.35 });
    setTimeout(revealAll, 4000);

    if (!window.ScrollTrigger) return;

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, duration: 1.05, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      var kids = group.querySelectorAll('[data-reveal]');
      if (!kids.length) return;
      gsap.to(kids, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09,
        scrollTrigger: { trigger: group, start: 'top 82%', once: true } });
    });

    setTimeout(function () {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        if (getComputedStyle(el).opacity === '0') { el.style.opacity = '1'; el.style.transform = 'none'; }
      });
    }, 6000);

    if (!isTouch) {
      document.querySelectorAll('.split-visual-film').forEach(function (film) {
        var host = film.closest('.split-visual');
        if (!host) return;
        gsap.fromTo(film, { yPercent: -7 }, { yPercent: 7, ease: 'none',
          scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
    }

    var heroInner = document.querySelector('.hero-inner');
    if (heroInner) {
      gsap.to(heroInner, { y: -70, opacity: 0.45, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.3 } });
    }
    var heroBg = document.querySelector('.hero-bg-img');
    if (heroBg) {
      gsap.fromTo(heroBg, { scale: 1.15 }, { scale: 1.0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });
    }

    gsap.from('.process-row', { opacity: 0, y: 30, duration: 0.9, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: '.process-list', start: 'top 82%', once: true } });

    document.querySelectorAll('.section-head h2').forEach(function (h) {
      gsap.from(h, { opacity: 0, y: 34, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });

    ScrollTrigger.refresh();
  }

  /* ---------- boot ---------- */
  function boot() {
    if (prefersReduced) document.documentElement.classList.add('no-motion');
    if (typeof gsap !== 'undefined') document.documentElement.classList.add('js-reveal');

    document.body.classList.remove('is-loading');

    lenis = initLenis();
    initChrome();
    initNav();
    initAnchors();
    initFaq();
    initAllQty();
    initFilms();
    initGsap();
  }

  window.addEventListener('error', function () {
    document.body.classList.remove('is-loading');
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
