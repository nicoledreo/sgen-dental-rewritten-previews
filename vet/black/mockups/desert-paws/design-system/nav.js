/* =====================================================================
   nav.js — Desert Paws shared page behaviour (inner pages).
   Inner-page shells carry no inline script; behaviour lives here so every
   page inherits identical drawer + scroll choreography from the design system.

   1. Mobile drawer  — NAV-PATTERNS.md #3 drawer state
   2. Scroll reveals — MOTION-PATTERNS.md #21 Fade-up + #26 Fade-in-on-view
   3. Open/closed    — reflects real clinic hours in the header strip
   ===================================================================== */
(function () {
  'use strict';

  /* ── 1. Mobile drawer ───────────────────────────────────────────── */
  var toggle = document.querySelector('.hamburger');
  var drawer = document.querySelector('.drawer');
  var scrim = document.querySelector('.scrim');
  var closeBtn = document.querySelector('.drawer-close');

  function setOpen(open) {
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim) scrim.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      setOpen(drawer.getAttribute('aria-hidden') !== 'false');
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
    if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  /* ── 1b. Header: NAV-PATTERNS.md #2 transparent-over-hero → solid ──────
     Also publishes the header's measured height as --header-h so the first
     section can pad itself clear of the fixed bar at any breakpoint. */
  var header = document.querySelector('.site-header');
  if (header) {
    var measure = function () {
      document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    };
    var solidify = function () {
      header.classList.toggle('is-solid', window.scrollY > 60);
    };
    measure();
    solidify();
    window.addEventListener('scroll', solidify, { passive: true });
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }

  /* ── 2. Scroll choreography ─────────────────────────────────────────
     Attribute-driven so inner-page shells stay class-pure per
     COMPONENT-VOCABULARY.md (which has no reveal class). */
  var els = document.querySelectorAll('[data-reveal]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(els, function (el) { el.setAttribute('data-in', ''); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-in', '');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* ── 3. Open / closed state ─────────────────────────────────────── */
  var stateEls = document.querySelectorAll('[data-hours]');
  if (stateEls.length) {
    var now = new Date();
    var day = now.getDay();
    var hrs = now.getHours() + now.getMinutes() / 60;
    var win = day === 0 ? [9, 15] : (day === 6 ? [8, 17] : [7, 19]);
    var isOpen = hrs >= win[0] && hrs < win[1];
    var fmt = function (h) {
      var ap = h >= 12 ? 'PM' : 'AM';
      return (h % 12 || 12) + ':00 ' + ap;
    };
    var msg = isOpen
      ? '\u2600 Open today until ' + fmt(win[1]) + ' \u00b7 Walk-ins welcome for urgent care \u00b7 Se habla espa\u00f1ol'
      : '\u25cf Closed now \u00b7 Opens ' + fmt(win[0]) + ' \u00b7 Urgent line answered during open hours \u00b7 Se habla espa\u00f1ol';
    Array.prototype.forEach.call(stateEls, function (el) { el.textContent = msg; });
  }
})();
