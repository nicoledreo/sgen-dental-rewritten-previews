/* Harbor Paws — shared mobile nav drawer.
 * Behaviour is a port of the Phase-1 locked homepage (NAV-PATTERNS.md #4 drawer state)
 * so inner pages match it exactly: toggle, close button, scrim click, Escape, and
 * close-on-link-click.
 *
 * TWO THINGS THIS ADDS OVER THE HOMEPAGE ORIGINAL, both a11y fixes:
 *  1. `inert` on the closed drawer. Without it the off-screen panel stays in the tab
 *     order — measured on the homepage, a keyboard user reached the closed drawer's
 *     close button on Tab #4 at 375px. CSS `visibility:hidden` (in structural.css)
 *     is the primary guard so this holds even if JS never runs; `inert` also removes
 *     it from the accessibility tree for screen readers.
 *  2. Focus returns to the toggle when the drawer closes, instead of being dropped
 *     to the top of the document.
 * Guarded so a page without the drawer markup is a no-op rather than a console error. */
(function () {
  var toggle = document.getElementById('navToggle');
  var drawer = document.getElementById('mobileDrawer');
  var scrim = document.getElementById('navScrim');
  var closeB = document.getElementById('drawerClose');
  if (!toggle || !drawer || !scrim || !closeB) return;

  function setDrawer(open, returnFocus) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    scrim.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if ('inert' in drawer) drawer.inert = !open;
    if (open) {
      var first = drawer.querySelector('a, button');
      if (first) first.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  }

  setDrawer(false, false); // start closed AND inert, before any interaction

  toggle.addEventListener('click', function () {
    setDrawer(toggle.getAttribute('aria-expanded') !== 'true', false);
  });
  closeB.addEventListener('click', function () { setDrawer(false, true); });
  scrim.addEventListener('click', function () { setDrawer(false, false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setDrawer(false, true);
  });
  Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) {
    a.addEventListener('click', function () { setDrawer(false, false); });
  });
})();
