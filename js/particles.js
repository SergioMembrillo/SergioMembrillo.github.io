/**
 * particles.js
 * Canvas-based floating particle network for the hero section.
 * Architecture: IIFE module to avoid global scope pollution.
 */
(function ParticleSystem() {
  'use strict';

  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  /* ── Config ─────────────────────────────────── */
  const CONFIG = {
    particleCount:  80,
    maxDistance:    130,
    particleRadius: 1.8,
    speed:          0.35,
    colorPrimary:   'rgba(0, 212, 255,',
    colorSecondary: 'rgba(168, 85, 247,',
    mouseRadius:    120,
  };

  let particles  = [];
  let mouse      = { x: null, y: null };
  let animId     = null;
  let W, H;

  /* ── Particle class ──────────────────────────── */
  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : -10;
      this.vx = (Math.random() - 0.5) * CONFIG.speed;
      this.vy = (Math.random() - 0.5) * CONFIG.speed;
      this.r  = Math.random() * CONFIG.particleRadius + 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.color = Math.random() > 0.5 ? CONFIG.colorPrimary : CONFIG.colorSecondary;
    }

    update() {
      /* Mouse repulsion */
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONFIG.mouseRadius) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
          this.vx += (dx / dist) * force * 0.6;
          this.vy += (dy / dist) * force * 0.6;
        }
      }

      /* Dampen velocity */
      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx;
      this.y += this.vy;

      /* Wrap around edges */
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color}${this.alpha})`;
      ctx.fill();
    }
  }

  /* ── Init ────────────────────────────────────── */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
    animate();
  }

  /* ── Draw connections ────────────────────────── */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < CONFIG.maxDistance) {
          const alpha = (1 - dist / CONFIG.maxDistance) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  /* ── Loop ────────────────────────────────────── */
  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(animate);
  }

  /* ── Events ──────────────────────────────────── */
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    animate();
  });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  /* ── Start after DOM ready ───────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
