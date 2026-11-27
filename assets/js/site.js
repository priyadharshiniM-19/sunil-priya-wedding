/* The play.
   - Music gate: a stack of real instruments drops into place; choose with or without music.
   - The velvet curtain is driven by scroll: it is closed on every boundary between acts
     (showing the playbill for the coming act) and opens fully while an act is centred.
   - The royal window: zoom into the gilded window; the elephant procession walks past its panes, left to right.
   - Words rise in on reveal; countdown; smooth scrolling via Lenis. */
(function () {
  'use strict';
  var html = document.documentElement, body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var audio = document.querySelector('[data-music]'), muteBtn = document.querySelector('[data-mute]');
  var halves = document.querySelectorAll('.half'), bills = document.querySelectorAll('.bill');
  var acts = Array.prototype.slice.call(document.querySelectorAll('[data-act-sec]'));
  var scene = document.querySelector('[data-wscene]'), wwall = document.querySelector('[data-wwall]'), wbox = document.querySelector('[data-wbox]'), proc = document.querySelector('[data-proc]'), wcap = document.querySelector('[data-wcap]');
  var legs = Array.prototype.slice.call(document.querySelectorAll('[data-leg]')), bobs = Array.prototype.slice.call(document.querySelectorAll('[data-bob]'));
  var ebody = document.querySelector('[data-ebody]'), trunk = document.querySelector('[data-trunk]');
  var mrot = 0, invite = document.querySelector('[data-invite]'), dusk = document.querySelector('[data-dusk]');
  var paper = document.querySelector('[data-paper]'), scin = document.querySelector('[data-scin]'), sclines = Array.prototype.slice.call(scin.children), scScale = 1, scH = 0, lastPh = '';
  var remeasure = function () { scH = 0; }; window.addEventListener('resize', remeasure); if (document.fonts) document.fonts.ready.then(remeasure); window.addEventListener('load', remeasure);
  var bless = document.querySelector('[data-bless]'), a3 = document.querySelector('.a3'), sunX = 0, sunY = 0;
  var temple = document.querySelector('[data-temple]'), sun = document.querySelector('[data-sun]'), sky2 = document.querySelector('[data-sky2]'), rays = document.querySelector('[data-rays]');
  var mrings = Array.prototype.slice.call(rays.querySelectorAll('.mr')).reverse(), msun = rays.querySelector('.msun');
  var lastZt = '';
  var walkPh = 0, lastQ = null, lastT = performance.now();
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
    bills.forEach(function (b, i) { b.style.opacity = (!gate && i === (best === 0 ? 0 : best + 1) ? clamp(1 - open * 2.2, 0, 1) : 0).toFixed(3); });
    halves.forEach(function (h) { h.style.pointerEvents = open > .5 ? 'none' : 'auto'; });

    // the royal window: zoom in to peek through the panes; the procession walks left to right with the scroll
    var now = performance.now(), dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    var range = scene.offsetHeight - vh, p = clamp((window.scrollY - scene.offsetTop) / range, 0, 1);
    var Wb = wbox.offsetWidth, Hb = wbox.offsetHeight, vw = window.innerWidth;
    var Zt = clamp(Math.min(.86 * vh / (.5214 * Hb), .84 * vw / (.3818 * Wb)), 1, 2.2), e = sm(p / .11), Z = 1 + (Zt - 1) * e;
    var dx = 0, dy = (.5536 - .5) * Hb;
    var zt = 'translate3d(' + (-dx * Z * e).toFixed(1) + 'px,' + (-dy * Z * e).toFixed(1) + 'px,0) scale(' + Z.toFixed(4) + ')';
    if (zt !== lastZt) { wbox.style.transform = zt; wwall.style.transform = zt; lastZt = zt; }
    wcap.style.opacity = (1 - e).toFixed(3);
    var q = clamp((p - .04) / .38, 0, 1);
    var sceneOn = window.scrollY < scene.offsetTop + scene.offsetHeight && window.scrollY + vh > scene.offsetTop;
    if (sceneOn) proc.style.transform = 'translate3d(' + (-100 + 142.6 * q).toFixed(2) + '%,0,0)';
    if (sceneOn && q > 0 && q < 1) {
      if (lastQ !== null) walkPh += Math.abs(q - lastQ) * 95;
      lastQ = q;
      walkPh += dt * .35; // a slow idle step so the elephant never freezes mid-stride
      legs.forEach(function (l) { var o = +l.getAttribute('data-leg') * Math.PI; l.style.transform = 'rotate(' + (Math.sin(walkPh + o) * 9).toFixed(2) + 'deg)'; });
      ebody.style.transform = 'translate3d(0,' + (-Math.abs(Math.cos(walkPh)) * 0.9).toFixed(2) + '%,0)';
      trunk.style.transform = 'translate3d(0,' + (-Math.abs(Math.cos(walkPh)) * 5).toFixed(2) + '%,0) rotate(' + (Math.sin(walkPh * .5 + now / 1600) * 6).toFixed(2) + 'deg)';
      bobs.forEach(function (b) { var o = +b.getAttribute('data-bob'), ph = walkPh * 2 + o; b.style.transform = 'translate3d(0,' + (-Math.abs(Math.sin(ph)) * 1.6).toFixed(2) + '%,0) rotate(' + (Math.sin(ph) * 1.2).toFixed(2) + 'deg)'; });
    } else lastQ = q;
    // dawn: the gopuram rises, the sun climbs above it, and sunset rays pour out of the window to fill the screen
    var tr = sm((p - .38) / .18), su = sm((p - .54) / .2), ry = sm((p - .74) / .26);
    if (sceneOn) {
      temple.style.transform = 'translate3d(0,' + (100 - 94 * tr).toFixed(2) + '%,0)';
      bless.style.opacity = (sm((p - .47) / .05) * (1 - sm((p - .71) / .04))).toFixed(3);
      sky2.style.opacity = su.toFixed(3);
      sun.style.opacity = clamp(su * 3, 0, 1).toFixed(3);
      sun.style.transform = 'translate3d(0,' + (260 - 255 * su).toFixed(1) + '%,0)';
    }
    if (ry > 0) {
      // follow the sun while the scene is pinned; afterwards the rangoli stays put and keeps turning behind the invitation
      if (window.scrollY <= scene.offsetTop + range) { var sr = sun.getBoundingClientRect(); sunX = sr.left + sr.width / 2; sunY = sr.top + sr.height / 2; }
      var gone = a3.getBoundingClientRect().top < vh * .56;
      // as the invitation arrives, the rangoli glides to the centre of the screen
      var it = sm(1 - invite.getBoundingClientRect().top / vh), cxp = sunX + (vw / 2 - sunX) * it, cyp = sunY + (vh / 2 - sunY) * it;
      dusk.style.opacity = gone ? '0' : sm((ry - .2) / .7).toFixed(3);
      // the rangoli settles into a quiet backdrop while the names are read
      rays.style.opacity = gone ? '0' : (clamp(ry * 6, 0, 1) * (1 - .3 * it)).toFixed(3);
      rays.style.transform = 'translate3d(' + cxp.toFixed(1) + 'px,' + cyp.toFixed(1) + 'px,0) scale(' + (.075 + .9 * Math.pow(ry, 1.4)).toFixed(4) + ') rotate(' + (mrot = (mrot + dt * 9 * sm((ry - .85) / .15)) % 360).toFixed(2) + 'deg)';
      // the rangoli opens ring by ring from the sun, each ring turning into place; the dusk fills behind it
      mrings.forEach(function (g, i) {
        var rp = sm((ry * 1.3 - i * .1) / .32), dir = i % 2 ? 1 : -1;
        g.style.opacity = rp.toFixed(3);
        g.style.transform = 'translate(-50%,-50%) rotate(' + (dir * ((1 - rp) * 50 + now / 900)).toFixed(2) + 'deg) scale(' + (.6 + .4 * rp).toFixed(4) + ')';
      });
      msun.style.transform = 'translate(-50%,-50%) scale(' + (1 + .06 * Math.sin(now / 700)).toFixed(3) + ')';
    } else { rays.style.opacity = '0'; dusk.style.opacity = '0'; }
    // fully hidden layers are taken out of the compositor so they cost nothing
    var rv = rays.style.opacity !== '0' && rays.style.opacity !== '0.000' ? 'visible' : 'hidden', dv = dusk.style.opacity !== '0' && dusk.style.opacity !== '0.000' ? 'visible' : 'hidden';
    if (rays.style.visibility !== rv) rays.style.visibility = rv;
    if (dusk.style.visibility !== dv) dusk.style.visibility = dv;

    // the royal scroll: arrives rolled shut, opens from its centre once it is in the middle of the screen, then the ink appears line by line
    var ir = invite.offsetHeight - vh, k = clamp((window.scrollY - invite.offsetTop) / ir, 0, 1);
    if (!scH) scH = scin.offsetHeight;
    var full = vh * .8; scScale = Math.min(1, (full - 8) / scH);
    var o = sm((k - .03) / .3);
    var openH = Math.min(full, scH * scScale + 4), ph = Math.max(openH, paper.offsetWidth * 1.43).toFixed(0) + 'px';
    if (ph !== lastPh) { paper.style.setProperty('--ph', ph); lastPh = ph; }
    paper.style.height = (o * openH).toFixed(1) + 'px';
    scin.style.transform = 'translate3d(0,' + (-scH * scScale / 2).toFixed(1) + 'px,0) scale(' + scScale.toFixed(4) + ')';
    sclines.forEach(function (el, i) { var a = sm((k - .2 - i * .04) / .09); el.style.opacity = a.toFixed(3); el.style.transform = 'translate3d(0,' + ((1 - a) * 14).toFixed(1) + 'px,0)'; });
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
