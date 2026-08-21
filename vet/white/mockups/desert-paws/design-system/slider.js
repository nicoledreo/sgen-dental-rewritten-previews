/* =====================================================================
   slider.js — generic card-grid slider (CSS scroll-snap + peek + dots)

   Dependency-free IIFE. Self-initialising. Safe on pages with no
   [data-slider] element (it simply finds nothing and exits).

   Contract
     data-slider="always"  → slides at every width
     data-slider="mobile"  → slides only at <=767.98px
   The grid must be followed by an EMPTY <div class="slider-dots"> sibling;
   this file fills it. All visual behaviour lives in structural.css under
   the .is-sliding class — this file only toggles state and builds dots.
   ===================================================================== */
(function () {
  'use strict';

  var MOBILE_Q = '(max-width:767.98px)';
  var mq = window.matchMedia ? window.matchMedia(MOBILE_Q) : null;

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  }

  /* The dots container is the grid's immediate next sibling. Returns null when
     the markup omits it — every caller must tolerate that. */
  function dotsFor(grid) {
    var el = grid.nextElementSibling;
    return (el && el.classList && el.classList.contains('slider-dots')) ? el : null;
  }

  function cardsOf(grid) {
    var out = [];
    for (var i = 0; i < grid.children.length; i++) {
      if (grid.children[i].nodeType === 1) out.push(grid.children[i]);
    }
    return out;
  }

  function shouldSlide(grid) {
    var mode = grid.getAttribute('data-slider');
    if (mode === 'always') return true;
    if (mode === 'mobile') return !!(mq && mq.matches);
    return false;
  }

  /* Mark the dot whose card sits nearest the container's left edge. */
  function setActive(grid, dots) {
    if (!dots) return;
    var kids = cardsOf(grid);
    if (!kids.length) return;
    var edge = grid.getBoundingClientRect().left;
    var best = 0, bestD = Infinity;
    for (var i = 0; i < kids.length; i++) {
      var d = Math.abs(kids[i].getBoundingClientRect().left - edge);
      if (d < bestD - 0.5) { bestD = d; best = i; }
    }
    for (var j = 0; j < dots.children.length; j++) {
      if (j === best) dots.children[j].classList.add('is-active');
      else dots.children[j].classList.remove('is-active');
    }
  }

  function build(grid) {
    var sliding = shouldSlide(grid);

    if (sliding) grid.classList.add('is-sliding');
    else grid.classList.remove('is-sliding');

    var dots = dotsFor(grid);
    if (!dots) return;

    var kids = cardsOf(grid);
    dots.innerHTML = '';

    if (!sliding || !kids.length) {
      dots.setAttribute('hidden', '');
      return;
    }
    dots.removeAttribute('hidden');

    var frag = document.createDocumentFragment();
    for (var i = 0; i < kids.length; i++) {
      frag.appendChild(makeDot(kids[i], i, kids.length, dots));
    }
    dots.appendChild(frag);
    setActive(grid, dots);
  }

  function makeDot(card, i, total, dots) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'slider-dot';
    b.setAttribute('aria-label', 'Go to card ' + (i + 1) + ' of ' + total);
    /* The markup contract puts aria-hidden="true" on .slider-dots. A focusable
       control inside an aria-hidden subtree is an axe "aria-hidden-focus"
       violation, so pull the dots out of the tab order when that is the case.
       Keyboard users are not stranded: the grid itself carries tabindex="0"
       and arrow-scrolls. If the container is NOT aria-hidden the dot stays
       tabbable, exactly as the contract describes. */
    if (dots && dots.getAttribute('aria-hidden') === 'true') b.tabIndex = -1;
    b.addEventListener('click', function () {
      card.scrollIntoView({
        inline: 'start',
        block: 'nearest',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });
    return b;
  }

  /* Scroll listener is attached once per grid and stays attached across
     rebuilds; it no-ops while the grid is not in sliding state. */
  function attachScroll(grid) {
    if (grid.getAttribute('data-slider-bound') === '1') return;
    grid.setAttribute('data-slider-bound', '1');
    var ticking = false;
    grid.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        if (grid.classList.contains('is-sliding')) setActive(grid, dotsFor(grid));
      });
    }, { passive: true });
  }

  function initAll() {
    var grids = document.querySelectorAll('[data-slider]');
    for (var i = 0; i < grids.length; i++) {
      attachScroll(grids[i]);
      build(grids[i]);
    }
  }

  var resizeTimer = null;
  function onResize() {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(initAll, 150);
  }

  function boot() {
    initAll();
    window.addEventListener('resize', onResize);
    if (mq) {
      if (mq.addEventListener) mq.addEventListener('change', initAll);
      else if (mq.addListener) mq.addListener(initAll);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
