/**
 * main.js
 * Portfolio – Main Controller
 * Architecture: Module pattern with separated concerns.
 * Modules: Loader, Cursor, Navbar, ScrollReveal, SkillBars,
 *          StatCounters, ProjectFilter, ContactForm, BackToTop, Footer
 */
(function PortfolioApp() {
  'use strict';

  /* ════════════════════════════════════════════════
     1. LOADER MODULE
     Simulates loading progress, then reveals the page.
  ══════════════════════════════════════════════════ */
  const Loader = (() => {
    const loader     = document.getElementById('loader');
    const loaderFill = document.getElementById('loaderFill');
    if (!loader || !loaderFill) return { init() {} };

    let progress = 0;

    function tick() {
      progress += Math.random() * 18 + 5;
      if (progress > 100) progress = 100;
      loaderFill.style.width = `${progress}%`;

      if (progress < 100) {
        setTimeout(tick, 80 + Math.random() * 60);
      } else {
        setTimeout(hide, 350);
      }
    }

    function hide() {
      loader.classList.add('hidden');
      document.dispatchEvent(new CustomEvent('loaderDone'));
    }

    return {
      init() { setTimeout(tick, 200); },
    };
  })();

  /* ════════════════════════════════════════════════
     2. CURSOR MODULE
     Smooth custom cursor with follower.
  ══════════════════════════════════════════════════ */
  const Cursor = (() => {
    const dot      = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!dot || !follower) return { init() {} };

    let mx = -100, my = -100;
    let fx = -100, fy = -100;

    function loop() {
      /* Smooth follower */
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;

      dot.style.left      = `${mx}px`;
      dot.style.top       = `${my}px`;
      follower.style.left = `${fx}px`;
      follower.style.top  = `${fy}px`;

      requestAnimationFrame(loop);
    }

    function onMove(e) { mx = e.clientX; my = e.clientY; }

    function onHover(el, enter) {
      if (enter) {
        follower.style.width  = '52px';
        follower.style.height = '52px';
        follower.style.borderColor = 'rgba(0,212,255,0.8)';
      } else {
        follower.style.width  = '32px';
        follower.style.height = '32px';
        follower.style.borderColor = 'rgba(0,212,255,0.5)';
      }
    }

    return {
      init() {
        /* Only on non-touch */
        if (window.matchMedia('(pointer: coarse)').matches) {
          dot.style.display = follower.style.display = 'none';
          return;
        }
        document.addEventListener('mousemove', onMove);
        loop();

        /* Interactive elements enlarge follower */
        document.querySelectorAll('a, button, .project-card, .skill-chip, .contact-card').forEach(el => {
          el.addEventListener('mouseenter', () => onHover(el, true));
          el.addEventListener('mouseleave', () => onHover(el, false));
        });
      },
    };
  })();

  /* ════════════════════════════════════════════════
     3. NAVBAR MODULE
     Sticky navbar, scroll style, active section,
     mobile hamburger menu.
  ══════════════════════════════════════════════════ */
  const Navbar = (() => {
    const nav       = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    const links     = document.querySelectorAll('.nav-link');
    if (!nav) return { init() {} };

    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    }

    function setActive() {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      links.forEach(a => {
        a.classList.toggle('active', a.dataset.section === current);
      });
    }

    function toggleMenu() {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    }

    return {
      init() {
        window.addEventListener('scroll', () => { onScroll(); setActive(); }, { passive: true });
        onScroll();
        hamburger?.addEventListener('click', toggleMenu);

        /* Close menu on link click */
        links.forEach(a => a.addEventListener('click', () => {
          navLinks.classList.remove('open');
          hamburger.classList.remove('open');
        }));
      },
    };
  })();

  /* ════════════════════════════════════════════════
     4. SCROLL REVEAL MODULE
     IntersectionObserver to animate elements in view.
  ══════════════════════════════════════════════════ */
  const ScrollReveal = (() => {
    const options = { threshold: 0.12, rootMargin: '0px 0px -60px 0px' };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, options);

    return {
      init() {
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
      },
    };
  })();

  /* ════════════════════════════════════════════════
     5. SKILL BARS MODULE
     Animate chip-fill bars when visible.
  ══════════════════════════════════════════════════ */
  const SkillBars = (() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.chip-fill').forEach(bar => {
            bar.classList.add('animated');
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    return {
      init() {
        document.querySelectorAll('.skill-category').forEach(cat => obs.observe(cat));
      },
    };
  })();

  /* ════════════════════════════════════════════════
     6. STAT COUNTERS MODULE
     Animate number counters when About section is visible.
  ══════════════════════════════════════════════════ */
  const StatCounters = (() => {
    function animateCounter(el, target, duration = 1500) {
      const start = performance.now();
      const update = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        /* Ease out cubic */
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      };
      requestAnimationFrame(update);
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-number[data-target]').forEach(el => {
            animateCounter(el, parseInt(el.dataset.target, 10));
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    return {
      init() {
        const aboutSection = document.getElementById('about');
        if (aboutSection) obs.observe(aboutSection);
      },
    };
  })();

  /* ════════════════════════════════════════════════
     7. PROJECT FILTER MODULE
     Filter project cards by category.
  ══════════════════════════════════════════════════ */
  const ProjectFilter = (() => {
    const btns  = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    function filter(category) {
      cards.forEach(card => {
        const match = category === 'all' || card.dataset.category === category;
        if (match) {
          card.classList.remove('hidden');
          /* Re-trigger reveal */
          card.classList.remove('visible');
          setTimeout(() => card.classList.add('visible'), 10);
        } else {
          card.classList.add('hidden');
        }
      });
    }

    return {
      init() {
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filter(btn.dataset.filter);
          });
        });
      },
    };
  })();

  /* ════════════════════════════════════════════════
     8. CONTACT FORM MODULE
     Client-side validation + submit feedback.
  ══════════════════════════════════════════════════ */
  const ContactForm = (() => {
    const form    = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    const submit  = document.getElementById('submitBtn');
    if (!form) return { init() {} };

    const fields = [
      { id: 'name',    errorId: 'nameError',    validate: v => v.trim().length >= 2 },
      { id: 'email',   errorId: 'emailError',   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      { id: 'subject', errorId: 'subjectError', validate: v => v.trim().length >= 3 },
      { id: 'message', errorId: 'messageError', validate: v => v.trim().length >= 10 },
    ];

    function validateField(field) {
      const el    = document.getElementById(field.id);
      const errEl = document.getElementById(field.errorId);
      const valid = field.validate(el.value);
      el.classList.toggle('error', !valid);
      errEl.classList.toggle('visible', !valid);
      return valid;
    }

    function validateAll() {
      return fields.reduce((acc, f) => validateField(f) && acc, true);
    }

    function setLoading(loading) {
      const text   = submit.querySelector('.btn-text');
      const loader = submit.querySelector('.btn-loader');
      submit.disabled = loading;
      text.hidden     = loading;
      loader.hidden   = !loading;
    }

    return {
      init() {
        /* Inline validation on blur */
        fields.forEach(f => {
          const el = document.getElementById(f.id);
          el?.addEventListener('blur', () => validateField(f));
          el?.addEventListener('input', () => {
            if (el.classList.contains('error')) validateField(f);
          });
        });

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!validateAll()) return;

          setLoading(true);

          try {
            // URL de Formspree - ¡Reemplaza 'YOUR_FORM_ID' por la ID real que te den!
            const endpoint = 'https://formspree.io/f/mwvwbywl';

            const formData = new FormData(form);
            
            const response = await fetch(endpoint, {
              method: 'POST',
              body: formData,
              headers: {
                'Accept': 'application/json'
              }
            });

            if (response.ok) {
              form.reset();
              success.hidden = false;
              setTimeout(() => { success.hidden = true; }, 5000);
            } else {
              alert('Hubo un problema al enviar el formulario. ¿Has puesto tu ID de Formspree?');
            }
          } catch (error) {
            alert('Error de red. Asegúrate de tener conexión y de haber configurado el formulario.');
          } finally {
            setLoading(false);
          }
        });
      },
    };
  })();

  /* ════════════════════════════════════════════════
     9. BACK TO TOP MODULE
  ══════════════════════════════════════════════════ */
  const BackToTop = (() => {
    const btn = document.getElementById('backTop');
    if (!btn) return { init() {} };

    return {
      init() {
        window.addEventListener('scroll', () => {
          btn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });

        btn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      },
    };
  })();

  /* ════════════════════════════════════════════════
     10. FOOTER YEAR
  ══════════════════════════════════════════════════ */
  function setFooterYear() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ════════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════════ */
  function boot() {
    Loader.init();
    Cursor.init();
    Navbar.init();
    ScrollReveal.init();
    SkillBars.init();
    StatCounters.init();
    ProjectFilter.init();
    ContactForm.init();
    BackToTop.init();
    setFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

}());
