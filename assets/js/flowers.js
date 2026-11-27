/* FLOWERS — tap or click anywhere and a handful of real flowers bursts from that spot:
   marigold, rose, jasmine, lotus, hibiscus, chrysanthemum. They fly up and out, tumble,
   fall under gravity and fade — over in about a second and a half. */
(function () {
  'use strict';
  var layer = document.querySelector('[data-flowers]');
  if (!layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { window.FLOWERS = { burst: function () {} }; return; }
  var SRC = ['marigold_1', 'marigold_4', 'rose_0', 'rose_4', 'jasmine_0', 'lotus_1', 'hibiscus_3', 'chrysanthemum_1', 'chrysanthemum_3']
    .map(function (n) { return 'assets/img/flowers/' + n + '.webp'; });
  // warm the cache so the first burst is instant
  var pool = SRC.map(function (s) { var i = new Image(); i.src = s; i.decoding = 'async'; return i; });
  var live = [], running = false, MAX = 90;

  function burst(x, y, n) {
    n = n || 16;
    for (var k = 0; k < n; k++) {
      if (live.length > MAX) live.shift().el.remove();
      var img = document.createElement('img');
      img.src = SRC[(Math.random() * SRC.length) | 0]; img.alt = '';
      var size = 26 + Math.random() * 46;
      img.style.width = size + 'px';
      layer.appendChild(img);
      var ang = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.35, sp = 380 + Math.random() * 520;
      live.push({ el: img, x: x - size / 2, y: y - size / 2, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: Math.random() * 360, vr: (Math.random() - .5) * 720, s: .4, t: 0, life: 1.1 + Math.random() * .6, flip: Math.random() * 6 });
    }
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(step); }
  }
  var last = 0;
  function step(now) {
    var dt = Math.min(.04, (now - last) / 1000); last = now;
    for (var i = live.length - 1; i >= 0; i--) {
      var p = live[i];
      p.t += dt; p.vy += 1400 * dt; p.vx *= (1 - 1.6 * dt); p.vy *= (1 - .6 * dt);
      p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.s = Math.min(1, p.s + dt * 6);
      var k = p.t / p.life, o = k < .7 ? 1 : Math.max(0, 1 - (k - .7) / .3);
      p.el.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0) rotate(' + p.r.toFixed(1) + 'deg) scale(' + (p.s * (.75 + .25 * Math.abs(Math.cos(p.t * 5 + p.flip)))).toFixed(3) + ',' + p.s.toFixed(3) + ')';
      p.el.style.opacity = o.toFixed(3);
      if (k >= 1) { p.el.remove(); live.splice(i, 1); }
    }
    if (live.length) requestAnimationFrame(step); else running = false;
  }
  document.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button, a, [data-ask]')) return;
    burst(e.clientX, e.clientY, 16);
  }, { passive: true });
  window.FLOWERS = { burst: burst };
})();
