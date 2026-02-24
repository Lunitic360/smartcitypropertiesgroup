(() => {
  window.__SMARTCITY_UI__ = window.__SMARTCITY_UI__ || {};
  if (window.__SMARTCITY_UI__.mainInitialized) return;
  window.__SMARTCITY_UI__.mainInitialized = true;

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // Scroll-to-top button
  const scrollBtn = document.getElementById('scrollToTop');
  const onScrollBtn = () => {
    if (!scrollBtn) return;
    scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  };
  window.addEventListener('scroll', onScrollBtn, { passive: true });
  onScrollBtn();

  scrollBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  // Ticker arrows + optional auto-scroll (pauses on hover and focus)
  const ticker = document.getElementById('ticker');
  const left = document.getElementById('scroll-left');
  const right = document.getElementById('scroll-right');

  const scrollByAmount = (dir) => {
    if (!ticker) return;
    const amt = Math.max(240, Math.round(ticker.clientWidth * 0.8));
    ticker.scrollBy({ left: dir * amt, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  left?.addEventListener('click', () => scrollByAmount(-1));
  right?.addEventListener('click', () => scrollByAmount(1));

  // Only auto-scroll when overflow exists (perf)
  const canScroll = () => ticker && ticker.scrollWidth > ticker.clientWidth + 4;

  // Auto-scroll (very lightweight)
  let raf = 0;
  let paused = false;

  const step = () => {
    if (!ticker || paused || prefersReduced) return;
    ticker.scrollLeft += 0.45;
    // loop-ish behavior (works fine for finite list too)
    if (ticker.scrollLeft + ticker.clientWidth >= ticker.scrollWidth - 2) {
      ticker.scrollLeft = 0;
    }
    raf = requestAnimationFrame(step);
  };

  const start = () => {
    if (!ticker || prefersReduced) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  if (ticker && !prefersReduced && canScroll()) {
    const pause = () => { paused = true; stop(); };
    const resume = () => { paused = false; start(); };

    ticker.addEventListener('mouseenter', pause);
    ticker.addEventListener('mouseleave', resume);
    ticker.addEventListener('focusin', pause);
    ticker.addEventListener('focusout', resume);

    start();
  }

  // FAQ: single-open behavior (optional polish; keeps <details> semantics)
  const accordion = document.querySelector('[data-accordion]');
  if (accordion) {
    const items = Array.from(accordion.querySelectorAll('details'));
    accordion.addEventListener('toggle', (e) => {
      const el = e.target;
      if (!(el instanceof HTMLDetailsElement) || !el.open) return;
      items.forEach((d) => { if (d !== el) d.open = false; });
    });
  }
})();
