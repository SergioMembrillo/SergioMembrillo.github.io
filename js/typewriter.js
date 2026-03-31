/**
 * typewriter.js
 * Typewriter effect for the hero section.
 * Cycles through an array of role strings with erase/type animation.
 */
(function TypewriterEffect() {
  'use strict';

  const el = document.getElementById('typewriter');
  if (!el) return;

  const ROLES = [
    'Desarrollo Multiplataforma',
    'Java, Kotlin & Python',
    'Desarrollo Móvil Android',
    'Bases de Datos SQL & NoSQL',
    'Soluciones ERP Odoo'
  ];

  const CONFIG = {
    typeSpeed:    65,   // ms per character when typing
    eraseSpeed:   35,   // ms per character when erasing
    pauseAfter:   2200, // ms to wait after full word is typed
    pauseBefore:  400,  // ms to wait before typing new word
  };

  let roleIndex  = 0;
  let charIndex  = 0;
  let isErasing  = false;
  let timeout    = null;

  function tick() {
    const currentRole = ROLES[roleIndex];

    if (!isErasing) {
      /* Typing */
      charIndex++;
      el.textContent = currentRole.slice(0, charIndex);

      if (charIndex === currentRole.length) {
        /* Finished typing → pause before erasing */
        timeout = setTimeout(() => { isErasing = true; tick(); }, CONFIG.pauseAfter);
        return;
      }
    } else {
      /* Erasing */
      charIndex--;
      el.textContent = currentRole.slice(0, charIndex);

      if (charIndex === 0) {
        /* Finished erasing → move to next role */
        isErasing = false;
        roleIndex = (roleIndex + 1) % ROLES.length;
        timeout = setTimeout(tick, CONFIG.pauseBefore);
        return;
      }
    }

    timeout = setTimeout(tick, isErasing ? CONFIG.eraseSpeed : CONFIG.typeSpeed);
  }

  /* Small random variance makes it feel more human */
  function variance() {
    return Math.floor(Math.random() * 30) - 15;
  }

  function tickHuman() {
    const currentRole = ROLES[roleIndex];

    if (!isErasing) {
      charIndex++;
      el.textContent = currentRole.slice(0, charIndex);

      if (charIndex === currentRole.length) {
        timeout = setTimeout(() => { isErasing = true; tickHuman(); }, CONFIG.pauseAfter);
        return;
      }
    } else {
      charIndex--;
      el.textContent = currentRole.slice(0, charIndex);

      if (charIndex === 0) {
        isErasing = false;
        roleIndex  = (roleIndex + 1) % ROLES.length;
        timeout    = setTimeout(tickHuman, CONFIG.pauseBefore);
        return;
      }
    }

    const delay = (isErasing ? CONFIG.eraseSpeed : CONFIG.typeSpeed) + variance();
    timeout = setTimeout(tickHuman, Math.max(20, delay));
  }

  /* Start after loader hides */
  function start() {
    timeout = setTimeout(tickHuman, CONFIG.pauseBefore);
  }

  /* Listen for loader-done event dispatched from main.js */
  document.addEventListener('loaderDone', start, { once: true });

  /* Fallback: start after 2s in case event never fires */
  setTimeout(() => {
    if (charIndex === 0 && !timeout) start();
  }, 2000);

}());
