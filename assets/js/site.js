/* The play.
   - Music gate: a stack of real instruments drops into place; choose with or without music.
   - The velvet curtain is driven by scroll: it is closed on every boundary between acts
     (showing the playbill for the coming act) and opens fully while an act is centred.
   - Act I: the batik painting pans inside the arch from the palace gate to the couple.
   - Words rise in on reveal; countdown; smooth scrolling via Lenis. */
(function () {
  'use strict';
  var html = document.documentElement, body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var audio = document.querySelector('[data-music]'), muteBtn = document.querySelector('[data-mute]');
  var halves = document.querySelectorAll('.half'), bills = document.querySelectorAll('.bill');
  var acts = Array.prototype.slice.call(document.querySelectorAll('[data-act-sec]'));
  var pan = document.querySelector('[data-pan]'), panImg = pan.querySelector('img');
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var sm = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* split words for the rising text */
  document.querySelectorAll('.split').forEach(function (el) {
    var i = 0, out = '';
    el.childNodes.forEach(function (n) {
      var text = n.textContent, tag = n.nodeType === 1 ? n.tagName.toLowerCase() : null;
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { out += ' '; return; }
        var w = tag ? '<' + tag + '>' + part + '</' + tag + '>' : part;
        out += '<span class="w"><span class="wi" style="--i:' + (i++) + '">' + w + '</span></span>';
      });
    });
    el.innerHTML = out;
  });
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -12% 0px', threshold: .15 });
  document.querySelectorAll('.rv, .split').forEach(function (el) { if (reduce) el.classList.add('in'); else io.observe(el); });

  /* gate */
  requestAnimationFrame(function () { body.classList.add('ready'); });
  var lenis = null;
  document.querySelectorAll('[data-sound]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var withMusic = b.getAttribute('data-sound') === 'on';
      if (withMusic) startMusic();
      if (window.FLOWERS) window.FLOWERS.burst(e.clientX, e.clientY, 24);
      muteBtn.hidden = false; muteBtn.setAttribute('aria-pressed', withMusic ? 'false' : 'true');
      body.setAttribute('data-state', 'play'); body.classList.add('play');
      setTimeout(function () {
        html.classList.remove('lock');
        if (!reduce && window.Lenis) {
          lenis = new window.Lenis({ duration: 1.6, wheelMultiplier: .8, touchMultiplier: 1.3, smoothWheel: true, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
          window.LENIS = lenis;
          (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
        }
      }, 1200);
    });
  });

  /* curtain + pan, every frame */
  function frame() {
    var vh = window.innerHeight, c = window.scrollY + vh / 2;
    var bounds = acts.map(function (a) { return a.offsetTop; });
    var best = 0, dmin = 1e9;
    bounds.forEach(function (y, i) { var d = Math.abs(c - y); if (d < dmin) { dmin = d; best = i; } });
    var open = body.getAttribute('data-state') === 'gate' ? 0 : sm((dmin - vh * .1) / (vh * .3));
    halves[0].style.transform = 'translate3d(' + (-open * 101).toFixed(2) + '%,0,0)';
    halves[1].style.transform = 'translate3d(' + (open * 101).toFixed(2) + '%,0,0)';
    var gate = body.getAttribute('data-state') === 'gate';
    bills.forEach(function (b, i) { b.style.opacity = (!gate && i === (best === 0 ? 0 : best + 1) ? (1 - open) : 0).toFixed(3); });
    halves.forEach(function (h) { h.style.pointerEvents = open > .5 ? 'none' : 'auto'; });

    // Act I: from the palace gate to the couple on the elephant
    var r = pan.getBoundingClientRect(), W = r.width, Hh = r.height;
    var t = sm((vh - r.top) / (vh + Hh));
    var from = { x: 1236, y: 520, z: 1.25 }, to = { x: 880, y: 290, z: 2.6 };
    var x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t, z = (from.z + (to.z - from.z) * t) * W / 1776;
    panImg.style.transform = 'translate3d(' + (W / 2 - x * z).toFixed(1) + 'px,' + (Hh / 2 - y * z).toFixed(1) + 'px,0) scale(' + z.toFixed(4) + ')';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* music */
  function fade(to, ms) {
    var from = audio.volume, t0 = performance.now();
    (function step(now) { var p = Math.min(1, (now - t0) / ms); audio.volume = from + (to - from) * p; if (p < 1) requestAnimationFrame(step); else if (to === 0) audio.pause(); })(t0);
  }
  function startMusic() { audio.volume = 0; var p = audio.play(); if (p && p.catch) p.catch(function () {}); fade(.85, 3000); }
  muteBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var muted = muteBtn.getAttribute('aria-pressed') === 'true';
    if (muted) { startMusic(); muteBtn.setAttribute('aria-pressed', 'false'); } else { fade(0, 500); muteBtn.setAttribute('aria-pressed', 'true'); }
  });

  /* countdown */
  var cd = document.querySelector('[data-countdown]');
  var target = new Date(cd.getAttribute('data-countdown')).getTime(), fld = {};
  ['d', 'h', 'm', 's'].forEach(function (k) { fld[k] = cd.querySelector('[data-cd="' + k + '"]'); });
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  (function tick() {
    var s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    fld.d.textContent = Math.floor(s / 86400); fld.h.textContent = pad(Math.floor(s / 3600) % 24); fld.m.textContent = pad(Math.floor(s / 60) % 60); fld.s.textContent = pad(s % 60);
    setTimeout(tick, 1000);
  })();
})();
