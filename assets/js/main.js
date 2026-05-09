/* =============================================================
   HOENN FIELD GUIDE — main.js
   Vanilla JS. No frameworks. No dependencies.
   ============================================================= */

(function () {
  'use strict';

  /* -----------------------------------------------------------
     1. Sticky nav scroll state + current-page highlight
     ----------------------------------------------------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 8) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Highlight current page link
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const links = nav.querySelectorAll('a[href]');
    links.forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;
      const file = href.split('/').pop().split('#')[0];
      if (file === path || (path === '' && file === 'index.html')) {
        a.classList.add('is-current');
      }
    });
  }

  /* -----------------------------------------------------------
     2. Mobile nav drawer toggle
     ----------------------------------------------------------- */
  const navToggle = document.querySelector('.nav__toggle');
  const navDrawer = document.querySelector('.nav__drawer');
  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', () => {
      const open = navDrawer.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.textContent = open ? 'CLOSE' : 'MENU';
    });
    navDrawer.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        navDrawer.classList.remove('is-open');
        navToggle.textContent = 'MENU';
      })
    );
  }

  /* -----------------------------------------------------------
     3. Smooth scroll for anchor links (CSS handles it, but we
        adjust focus behaviour for accessibility)
     ----------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* -----------------------------------------------------------
     4. Back-to-top button
     ----------------------------------------------------------- */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const toggleBtt = () => {
      if (window.scrollY > 400) backToTop.classList.add('is-visible');
      else backToTop.classList.remove('is-visible');
    };
    toggleBtt();
    window.addEventListener('scroll', toggleBtt, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -----------------------------------------------------------
     5. Reveal-on-scroll using IntersectionObserver

     Arm only elements that are below the initial viewport — above-the-fold
     content is never hidden so it renders reliably (including in full-page
     screenshots and when JS is slow). A safety timer kicks any still-armed
     elements into the visible state after 1.2s, so missed observer firings
     can't leave content invisible.
     ----------------------------------------------------------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const vh = window.innerHeight || 800;
    const armBelow = vh * 0.85;
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top > armBelow) el.classList.add('is-armed');
    });

    document.querySelectorAll('[data-stagger]').forEach((parent) => {
      const kids = parent.querySelectorAll('.reveal');
      kids.forEach((el, i) => el.style.setProperty('--delay', String(i)));
    });

    const flushIn = (el) => {
      el.classList.add('is-in');
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              flushIn(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px 80px 0px' }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach(flushIn);
    }

    setTimeout(() => {
      document.querySelectorAll('.reveal.is-armed:not(.is-in)').forEach(flushIn);
    }, 1200);
  }

  /* -----------------------------------------------------------
     6. Starter card — keyboard expand on focus (already handled
        by CSS :focus-within, but we expose tabindex)
     ----------------------------------------------------------- */
  document.querySelectorAll('.card-starter').forEach((card) => {
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        card.classList.toggle('is-expanded');
      }
    });
  });

  /* -----------------------------------------------------------
     7. Year in footer
     ----------------------------------------------------------- */
  const yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
