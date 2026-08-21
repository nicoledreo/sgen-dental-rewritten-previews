/* =====================================================================
   nav.js — Alignwell Chiropractic shared inner-page behaviour.
   Inner-page shells carry no inline script (verify-shell-purity), so all
   behaviour lives here and every page inherits it identically.

   1. Mobile drawer  — NAV-PATTERNS.md #2 mobile state
   2. Scroll reveals — MOTION-PATTERNS.md #21 Fade-up + #26 Fade-in-on-view

   Element id contract (from COMPONENT-VOCABULARY.md):
     #navToggle · #navScrim · #mobileDrawer · #drawerClose
   Rename one and the drawer silently stops working.
   ===================================================================== */
(function () {
  'use strict';

  /* ── 1 · Mobile drawer ─────────────────────────────────────────── */
  var toggle  = document.getElementById('navToggle');
  var drawer  = document.getElementById('mobileDrawer');
  var scrim   = document.getElementById('navScrim');
  var closeBtn= document.getElementById('drawerClose');

  function setOpen(open) {
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim)  scrim.classList.toggle('is-open', open);
    // structural.css carries visibility:hidden on the closed drawer so a keyboard
    // user cannot tab into it; inert is the belt-and-braces on top of that.
    if ('inert' in HTMLElement.prototype) drawer.inert = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && drawer) {
    setOpen(false);
    toggle.addEventListener('click', function () {
      setOpen(drawer.getAttribute('aria-hidden') !== 'false');
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
    if (scrim)    scrim.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  /* ── 2 · Scroll reveals ────────────────────────────────────────── */
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // Fail visible: no observer support, or the user asked for reduced motion,
  // and every element is simply shown. Content is never trapped mid-fade.
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Array.prototype.forEach.call(els, function (e) { e.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  Array.prototype.forEach.call(els, function (e, i) {
    e.style.transitionDelay = ((i % 4) * 70) + 'ms';
    io.observe(e);
  });
})();
