(() => {
  // Shared global guard (safe if main.js is loaded)
  window.__SMARTCITY_UI__ = window.__SMARTCITY_UI__ || {};
  if (window.__SMARTCITY_UI__.scriptInitialized) return;
  window.__SMARTCITY_UI__.scriptInitialized = true;

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // Sticky nav blur/shadow on scroll
  const nav = document.getElementById('site-nav');
  const onNavScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  // FIX: prevent crash when `.nav` is missing
  const secondaryNav = document.querySelector('.nav');
  if (secondaryNav) {
    window.addEventListener('scroll', () => {
      secondaryNav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Scroll progress bar
  const bar = document.getElementById('scroll-progress__bar');
  const onProgress = () => {
    if (!bar) return;
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = (doc.scrollHeight - doc.clientHeight) || 1;
    const pct = Math.min(100, Math.max(0, (scrollTop / height) * 100));
    bar.style.width = `${pct}%`;
  };
  window.addEventListener('scroll', onProgress, { passive: true });
  onProgress();

  // Mobile menu toggle
  const btn = document.querySelector('.hamburger-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  if (btn && mobileMenu) {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      mobileMenu.hidden = open;
    });

    mobileMenu.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', () => {
        btn.setAttribute('aria-expanded', 'false');
        mobileMenu.hidden = true;
      });
    });
  }

  // v2 hamburger (works with #hamburger + #navMenu in new index.html)
  (() => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
    navMenu.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', () => navMenu.classList.remove('active'));
    });
  })();

  // Smooth scrolling (Lenis-like but vanilla; avoids heavy libs)
  // Uses requestAnimationFrame easing; respects reduced motion.
  const smoothScrollTo = (targetY) => {
    if (prefersReduced) {
      window.scrollTo(0, targetY);
      return;
    }
    const startY = window.scrollY;
    const delta = targetY - startY;
    const start = performance.now();
    const dur = 650;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      window.scrollTo(0, startY + delta * easeOutCubic(t));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Replace the current anchor handler with this stricter version
  document.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a');
    if (!a) return;

    const href = a.getAttribute('href') || '';

    // Ignore external links
    if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href)) return;

    // Ignore tooltip-only links (your Terms/Privacy use href="#")
    if (href === '#') {
      e.preventDefault();
      return;
    }

    // Handle internal anchors
    if (!href.startsWith('#')) return;

    const id = href.slice(1);
    if (!id) return;

    const el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();

    const headerOffset = 110; // should match scroll-margin-top
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    smoothScrollTo(Math.max(0, y));
  }, true);

  // Scroll reveal (IntersectionObserver) - fallback
  const revealEls = Array.from(document.querySelectorAll('.reveal'));

  // More reliable than only CSS.supports (some browsers are partial/buggy)
  const hasScrollTimelineSupport = (() => {
    try {
      return typeof CSS !== 'undefined'
        && CSS.supports?.('animation-timeline: view()')
        && CSS.supports?.('animation-range: entry 0% cover 40%');
    } catch {
      return false;
    }
  })();

  // Always keep a JS fallback available; only disable it if you *want* timeline-only.
  // Here we run fallback when timeline isn't supported.
  if (!hasScrollTimelineSupport) {
    if (revealEls.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.4 } // matches “cover 40%”
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // Form: client-side validation + success message (no external CRM)
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const setFieldError = (input, msg) => {
    const field = input?.closest('div') || input?.parentElement;
    if (!field) return;

    let err = field.querySelector('.field-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'field-error';
      field.appendChild(err);
    }
    err.textContent = msg || '';
  };

  const clearErrors = () => {
    form?.querySelectorAll('.field-error').forEach((n) => n.remove());
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();
      if (success) success.hidden = true;

      const firstName = form.querySelector('#first-name');
      const lastName = form.querySelector('#last-name');
      const email = form.querySelector('#email');
      const message = form.querySelector('#message');
      const agreement = form.querySelector('#agreement');

      let ok = true;
      const emailVal = (email?.value || '').trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

      if (!firstName?.value.trim()) { ok = false; setFieldError(firstName, 'First name is required.'); }
      if (!lastName?.value.trim()) { ok = false; setFieldError(lastName, 'Last name is required.'); }
      if (!emailVal) { ok = false; setFieldError(email, 'Email is required.'); }
      else if (!isEmail) { ok = false; setFieldError(email, 'Enter a valid email address.'); }
      if (!message?.value.trim()) { ok = false; setFieldError(message, 'Message is required.'); }
      if (agreement && !agreement.checked) { ok = false; setFieldError(agreement, 'Please accept the terms to continue.'); }

      if (!ok) return;

      // Demo success (no CRM)
      form.reset();
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
      }
    });
  }

  // Milestones rail: flash on hover + click
  const rail = document.querySelector('.js-milestones-rail');
  if (rail) {
    let t = 0;
    const flash = () => {
      rail.classList.remove('is-flashing');
      // force reflow so animation can restart
      void rail.offsetWidth;
      rail.classList.add('is-flashing');
      clearTimeout(t);
      t = window.setTimeout(() => rail.classList.remove('is-flashing'), 950);
    };

    rail.addEventListener('mouseenter', flash);
    rail.addEventListener('click', flash);
    rail.addEventListener('touchstart', flash, { passive: true });
  }

  /* ===========================
     Why Invest Now: scroll image sequence (sticky stage)
     - one image centered at a time
     - swaps as user scrolls
     =========================== */
  (() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const section = document.getElementById('why-now');
    if (!section) return;

    const seq = section.querySelector('.why-now-seq');
    const stageImg = section.querySelector('.why-now-seq__img');
    const sourcesWrap = section.querySelector('.why-now-seq__sources');
    const dotsWrap = section.querySelector('.why-now-seq__dots');

    if (!seq || !stageImg || !sourcesWrap) return;

    const sources = Array.from(sourcesWrap.querySelectorAll('img'));
    if (!sources.length) return;

    seq.style.setProperty('--seq-steps', String(sources.length));

    let activeIndex = -1;
    let isInView = false;
    let raf = 0;
    let dots = [];

    const buildDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      dots = sources.map(() => {
        const d = document.createElement('div');
        d.className = 'why-now-seq__dot';
        dotsWrap.appendChild(d);
        return d;
      });
    };

    const setDotActive = (idx) => {
      if (!dots.length) return;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    };

    const setImage = (idx) => {
      idx = Math.max(0, Math.min(sources.length - 1, idx));
      if (idx === activeIndex) return;

      activeIndex = idx;
      const srcImg = sources[idx];

      stageImg.src = srcImg.currentSrc || srcImg.src;
      stageImg.alt = srcImg.alt || '';
      setDotActive(idx);

      if (!prefersReduced) {
        stageImg.classList.remove('is-animating');
        void stageImg.offsetWidth;
        stageImg.classList.add('is-animating');
      }
    };

    const getIndexFromScroll = () => {
      const rect = seq.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // Define a "sequence band" that starts when the seq hits top of viewport
      // and ends after (steps * vh) worth of scroll.
      const startPx = rect.top; // relative to viewport
      const progressedPx = -startPx; // increases as you scroll down
      const stepSize = Math.max(1, vh * 0.85); // one image per ~0.85 viewport scroll
      const raw = Math.floor(progressedPx / stepSize);

      return Math.max(0, Math.min(sources.length - 1, raw));
    };

    const tick = () => {
      raf = 0;
      if (!isInView) return;
      setImage(getIndexFromScroll());
    };

    const requestTick = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    buildDots();

    // Decode to avoid first-swap blank/jank
    Promise.allSettled(sources.map((img) => img.decode?.() || Promise.resolve()))
      .then(() => {
        setImage(0);
        requestTick();
      });

    const io = new IntersectionObserver(
      (entries) => {
        isInView = entries.some((e) => e.isIntersecting);
        if (isInView) requestTick();
      },
      { root: null, threshold: 0.01, rootMargin: '200px 0px 200px 0px' }
    );
    io.observe(seq);

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });
  })();

  // ===== Why-now horizontal marquee gallery (seamless loop) =====
  (() => {
    const section = document.getElementById('why-now');
    const gallery = section?.querySelector('.why-now-gallery');
    const track = gallery?.querySelector('.why-now-gallery__track');
    if (!section || !gallery || !track) return;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReduced) return;

    const originals = Array.from(track.children);
    if (!originals.length) return;

    if (!track.dataset.looped) {
      track.dataset.looped = 'true';
      const frag = document.createDocumentFragment();
      originals.forEach((el) => frag.appendChild(el.cloneNode(true)));
      track.appendChild(frag);
    }

    const setLoopWidth = () => {
      const half = track.scrollWidth / 2;
      track.style.setProperty('--why-now-loop', `${Math.max(1, Math.round(half))}px`);
    };

    Promise.allSettled(
      Array.from(track.querySelectorAll('img')).map((img) => img.decode?.() || Promise.resolve())
    ).then(setLoopWidth);

    window.addEventListener('load', setLoopWidth, { once: true });
    window.addEventListener('resize', setLoopWidth, { passive: true });
  })();

  // v2 hero slider (scoped: only inside #home.hero-slider)
  (() => {
    const hero = document.getElementById('home');
    if (!hero?.classList.contains('hero-slider')) return;

    const track = hero.querySelector('#sliderTrack');
    const slides = Array.from(hero.querySelectorAll('.slider-track > .slide'));
    const dots = Array.from(hero.querySelectorAll('.slider-dot'));
    const prev = hero.querySelector('#sliderPrev');
    const next = hero.querySelector('#sliderNext');

    if (!track || !slides.length) return;

    let idx = 0;
    let timer = 0;

    const render = () => {
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };

    const go = (n) => {
      idx = (n + slides.length) % slides.length;
      render();
      if (!prefersReduced) restart();
    };

    const restart = () => {
      clearInterval(timer);
      timer = window.setInterval(() => go(idx + 1), 6000);
    };

    prev?.addEventListener('click', () => go(idx - 1));
    next?.addEventListener('click', () => go(idx + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

    if (!prefersReduced) restart();
    render();
  })();
})();

(() => {
  // Scope hard to the "What we are about" section so broken markup elsewhere can't break this.
  const homeVideos = document.getElementById('home-videos');
  const ticker = homeVideos?.querySelector('#ticker');
  const leftBtn = homeVideos?.querySelector('#scroll-left');
  const rightBtn = homeVideos?.querySelector('#scroll-right');
  if (!homeVideos || !ticker || !leftBtn || !rightBtn) return;
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // Grab ORIGINAL slides once (before cloning)
  const slides = Array.from(ticker.querySelectorAll(':scope > a'));
  if (!slides.length) return;

  // Decorate originals only
  slides.forEach((s, i) => {
    s.classList.add('about-slide');
    s.setAttribute('target', '_blank');
    s.setAttribute('rel', 'noopener noreferrer');
    if (!prefersReduced) s.classList.add('is-floating');
    s.dataset.bubbleIndex = String(i);
  });

  // --- Clone once for seamless loop ---
  let loopWidth = 0;
  const cloneOnceAndMeasure = () => {
    const before = ticker.scrollWidth;
    if (!ticker.dataset.looped) {
      ticker.dataset.looped = 'true';
      const frag = document.createDocumentFragment();
      slides.forEach((s) => frag.appendChild(s.cloneNode(true)));
      ticker.appendChild(frag);
    }
    const after = ticker.scrollWidth;
    loopWidth = Math.max(1, Math.round(after - before));
  };

  const reMeasure = () => {
    loopWidth = Math.max(1, Math.round(ticker.scrollWidth / 2));
    ticker.scrollLeft = ((ticker.scrollLeft % loopWidth) + loopWidth) % loopWidth;
  };

  cloneOnceAndMeasure();

  // Re-measure after ALL ticker images decode (prevents “stuck” / wrong loopWidth)
  Promise.allSettled(
    Array.from(ticker.querySelectorAll('img')).map((img) => img.decode?.() || Promise.resolve())
  ).then(reMeasure);
  window.addEventListener('load', reMeasure, { once: true });
  window.addEventListener('resize', reMeasure, { passive: true });

  // --- Auto scroll (RIGHT -> LEFT visual) ---
  // (In scrollLeft terms, moving content left means increasing scrollLeft.)
  const SPEED_PX_PER_SEC = 95;
  let rafId = 0;
  let lastT = performance.now();
  let paused = false;
  let resumeT = 0;
  const pauseAuto = () => { paused = true; };
  const resumeAuto = () => { paused = false; lastT = performance.now(); };
  const resumeAutoSoon = () => {
    clearTimeout(resumeT);
    resumeT = window.setTimeout(resumeAuto, 900);
  };

  const tick = (t) => {
    rafId = requestAnimationFrame(tick);
    if (prefersReduced || paused) { lastT = t; return; }
    if (!loopWidth) { reMeasure(); lastT = t; return; }
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    ticker.scrollLeft += SPEED_PX_PER_SEC * dt;
    // wrap seamlessly
    if (ticker.scrollLeft >= loopWidth) ticker.scrollLeft = ticker.scrollLeft % loopWidth;
  };

  // Buttons (nudge + keep loop)
  const nudge = (dir) => {
    pauseAuto();
    ticker.scrollLeft += dir * 360;
    if (loopWidth) ticker.scrollLeft = ((ticker.scrollLeft % loopWidth) + loopWidth) % loopWidth;
    resumeAutoSoon();
  };
  leftBtn.addEventListener('click', () => nudge(-1));
  rightBtn.addEventListener('click', () => nudge(1));

  // Pause on user intent
  ticker.addEventListener('mouseenter', pauseAuto);
  ticker.addEventListener('mouseleave', resumeAutoSoon);
  ticker.addEventListener('pointerdown', pauseAuto);
  ticker.addEventListener('pointerup', resumeAutoSoon);
  ticker.addEventListener('touchstart', pauseAuto, { passive: true });
  ticker.addEventListener('touchend', resumeAutoSoon);
  rafId = requestAnimationFrame(tick);
})();

// REMOVE/COMMENT OUT the legacy hero script at the bottom.
// It queries `.slide` and will interfere with the v2 slider on #home.
/*
document.addEventListener('DOMContentLoaded', function() {
  // ...legacy hero slideshow code...
});
*/