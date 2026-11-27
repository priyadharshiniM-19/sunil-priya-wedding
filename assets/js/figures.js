/* FIGURES — the rigged procession.
   Every walker has a real skeleton: two-bone legs solved with inverse kinematics against
   a gait clock that is driven by distance travelled, so a foot in stance stays planted
   on the ground while the body passes over it (no skating), then lifts and swings forward.
   - Elephant: lateral-sequence walk (hind, fore same side, then the other side),
     duty factor .66; front knees fold backward, hind knees forward; body rolls and dips,
     head nods, ears breathe, trunk is a 12-joint chain that sways with the stride.
   - People: human walk (duty .6), knees forward, body rises over the planted leg,
     arms counter-swing; the veshti/robe hem is rebuilt every frame from the legs.
   Local coordinates: x forward (right), y down, ground at y = 0. */
(function () {
  'use strict';
  var A = window.ART, f = A.f, INK = A.INK;
  var NS = 'http://www.w3.org/2000/svg';
  var D2R = Math.PI / 180, R2D = 180 / Math.PI, TAU = Math.PI * 2;
  var FIG = (window.FIG = {});

  function g(html, cls) { var e = document.createElementNS(NS, 'g'); if (cls) e.setAttribute('class', cls); e.innerHTML = html; return e; }
  function q(root, sel) { return root.querySelector(sel); }
  function T(el, s) { el.setAttribute('transform', s); }

  /* gait: foot position relative to its hip over one cycle */
  function gait(p, D, L, lift) {
    p = ((p % 1) + 1) % 1;
    var S = D * L;
    if (p < D) return { x: S / 2 - (p / D) * S, y: 0, sw: 0 };
    var s = (p - D) / (1 - D), e = s * s * (3 - 2 * s);
    return { x: -S / 2 + e * S, y: -lift * Math.sin(Math.PI * s), sw: s };
  }
  FIG.gait = gait;

  /* two-bone IK; bend +1 folds the joint backward (−x), −1 forward */
  function ik(hx, hy, fx, fy, a, b, bend) {
    var dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy);
    d = Math.max(Math.abs(a - b) + .01, Math.min(a + b - .01, d));
    var th = Math.atan2(dy, dx), A = Math.acos((a * a + d * d - b * b) / (2 * a * d));
    var ang = th + bend * A;
    var kx = hx + Math.cos(ang) * a, ky = hy + Math.sin(ang) * a;
    var ex = hx + Math.cos(th) * d, ey = hy + Math.sin(th) * d;
    return { kx: kx, ky: ky, ax: ex, ay: ey, a1: Math.atan2(ky - hy, kx - hx) * R2D - 90, a2: Math.atan2(ey - ky, ex - kx) * R2D - 90 };
  }
  FIG.ik = ik;

  /* =====================================================================
     ELEPHANT
     ===================================================================== */
  var EL = {
    a: 84, b: 80, pad: 20, L: 236, D: .66, lift: 24,
    legs: [ // hip in body frame, phase offset, front?, near?
      { id: 'rhf', hx: -100, hy: -176, off: .5, front: false, near: false },
      { id: 'flf', hx: 100, hy: -174, off: .75, front: true, near: false },
      { id: 'rhn', hx: -128, hy: -170, off: 0, front: false, near: true },
      { id: 'fln', hx: 74, hy: -168, off: .25, front: true, near: true }
    ]
  };

  /* one continuous leg of skin per frame: hip → knee → ankle → round foot pad */
  function elLeg(near) {
    var fill = near ? 'url(#gSkinLeg)' : 'url(#gSkinFar)', sk = near ? INK : '#2E170B';
    return '<path class="skin" fill="' + fill + '" stroke="' + sk + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path class="crease" stroke="#3B2113" stroke-width="1.3" fill="none" opacity="' + (near ? .5 : .35) + '"/>' +
      '<path class="band" fill="url(#gGoldH)" stroke="' + INK + '" stroke-width="1.1"/>' +
      '<path class="nails" fill="#D2AA74" stroke="' + sk + '" stroke-width="1"/>';
  }
  function legShape(H, K, Ak, padH, front) {
    function nrm(ax, ay, bx, by) { var dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l, -dy / l, dx / l]; }
    var u1 = nrm(H[0], H[1], K[0], K[1]), u2 = nrm(K[0], K[1], Ak[0], Ak[1]);
    var nk = [u1[2] + u2[2], u1[3] + u2[3]], nl = Math.hypot(nk[0], nk[1]) || 1; nk = [nk[0] / nl, nk[1] / nl];
    var wH = 33, wK = 28.5, wA = 26.5, wF = 32;
    var top = [H[0] - u1[0] * 16, H[1] - u1[1] * 16];
    var mid1 = [(H[0] + K[0]) / 2, (H[1] + K[1]) / 2], mid2 = [(K[0] + Ak[0]) / 2, (K[1] + Ak[1]) / 2];
    var gy = Ak[1] + padH;
    var A1 = [[top[0] + u1[2] * wH, top[1] + u1[3] * wH], [mid1[0] + u1[2] * (wH + wK) / 2 * 1.02, mid1[1] + u1[3] * (wH + wK) / 2], [K[0] + nk[0] * wK, K[1] + nk[1] * wK], [mid2[0] + u2[2] * (wK + wA) / 2, mid2[1] + u2[3] * (wK + wA) / 2], [Ak[0] + u2[2] * wA, Ak[1] + u2[3] * wA]];
    var B1 = [[top[0] - u1[2] * wH, top[1] - u1[3] * wH], [mid1[0] - u1[2] * (wH + wK) / 2 * 1.02, mid1[1] - u1[3] * (wH + wK) / 2], [K[0] - nk[0] * wK, K[1] - nk[1] * wK], [mid2[0] - u2[2] * (wK + wA) / 2, mid2[1] - u2[3] * (wK + wA) / 2], [Ak[0] - u2[2] * wA, Ak[1] - u2[3] * wA]];
    // normals point to −x for a downward leg, so A side is the back of the leg
    var back = A1, fwd = B1;
    var fb = [Ak[0] - wF, gy], ff = [Ak[0] + wF, gy];
    var d = A.smooth(back.concat([[fb[0] + 2, gy - 8]]), false);
    d += 'Q' + f(fb[0] - 1) + ' ' + f(gy) + ' ' + f(fb[0] + 8) + ' ' + f(gy);
    d += 'L' + f(ff[0] - 8) + ' ' + f(gy) + 'Q' + f(ff[0] + 1) + ' ' + f(gy) + ' ' + f(ff[0] - 2) + ' ' + f(gy - 8);
    d += A.smooth([[ff[0] - 2, gy - 8]].concat(fwd.slice().reverse()), false).replace(/^M[^C]*/, '') + 'Z';
    // creases across the knee and shin
    var cr = '';
    [[.62, .7], [.74, .82], [.3, .55]].forEach(function (c, i) {
      var seg = i < 2 ? [K, Ak, u2] : [H, K, u1];
      var px = seg[0][0] + (seg[1][0] - seg[0][0]) * c[0], py = seg[0][1] + (seg[1][1] - seg[0][1]) * c[0], u = seg[2], w = 22;
      cr += 'M' + f(px + u[2] * w) + ' ' + f(py + u[3] * w) + 'Q' + f(px + u[0] * 5) + ' ' + f(py + u[1] * 5) + ' ' + f(px - u[2] * w * .6) + ' ' + f(py - u[3] * w * .6);
    });
    // gold anklet band just above the pad
    var b0 = .72, b1 = .86;
    var p0 = [K[0] + (Ak[0] - K[0]) * b0, K[1] + (Ak[1] - K[1]) * b0], p1 = [K[0] + (Ak[0] - K[0]) * b1, K[1] + (Ak[1] - K[1]) * b1], ww = wA + 1.5;
    var band = 'M' + f(p0[0] + u2[2] * ww) + ' ' + f(p0[1] + u2[3] * ww) + 'Q' + f(p0[0] + u2[0] * 4) + ' ' + f(p0[1] + u2[1] * 4) + ' ' + f(p0[0] - u2[2] * ww) + ' ' + f(p0[1] - u2[3] * ww) +
      'L' + f(p1[0] - u2[2] * ww) + ' ' + f(p1[1] - u2[3] * ww) + 'Q' + f(p1[0] + u2[0] * 4) + ' ' + f(p1[1] + u2[1] * 4) + ' ' + f(p1[0] + u2[2] * ww) + ' ' + f(p1[1] + u2[3] * ww) + 'Z';
    var nails = '';
    [6, 17, 27].forEach(function (nx) { nails += 'M' + f(Ak[0] + nx - 5) + ' ' + f(gy) + 'a5 4.2 0 0 1 10 0Z'; });
    return { d: d, cr: cr, band: band, nails: nails };
  }

  function elBody() {
    var body = 'M-204 -212C-210 -280 -160 -334 -88 -342C-20 -350 52 -348 98 -334C126 -324 142 -306 152 -288L154 -182C142 -152 114 -142 82 -144C30 -134 -40 -134 -96 -142C-150 -148 -196 -168 -204 -212Z';
    var s = '<path d="' + body + '" fill="url(#gSkin)" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
    s += '<path d="M-186 -250q14 -10 30 -6M-190 -220q16 -8 34 -2M-176 -192q16 -6 30 0M120 -300q8 14 6 30" stroke="#512A16" stroke-width="1.5" fill="none" opacity=".5"/>';
    return s;
  }

  function elTailPath(t, ph) {
    var pts = [[-198, -236]], x = -198, y = -236;
    for (var i = 0; i < 7; i++) {
      var ang = (96 + i * 2 + Math.sin(t * 1.1 + ph * TAU * .5 - i * .4) * (4 + i * 1.6)) * D2R;
      x += Math.cos(ang) * 15; y += Math.sin(ang) * 15; pts.push([x, y]);
    }
    return { d: A.ribbon(pts, 9, 4, true), end: pts[pts.length - 1] };
  }

  function elCloth() {
    var outer = 'M-156 -338C-60 -354 40 -352 96 -338L106 -186C62 -176 0 -174 -60 -176C-104 -178 -134 -182 -164 -190Z';
    var inner = 'M-142 -326C-60 -340 38 -338 84 -326L92 -200C54 -192 0 -190 -58 -192C-98 -194 -124 -197 -150 -202Z';
    var s = '<path d="' + outer + '" fill="url(#pBorder)" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
    s += '<path d="' + inner + '" fill="url(#gRed)" stroke="#4A1A0C" stroke-width="1.6"/>';
    s += '<path d="' + inner + '" fill="url(#pCaparison)" opacity=".85"/>';
    // central medallion
    s += '<g transform="translate(-30 -262)"><circle r="30" fill="#6A2410" stroke="#C29663" stroke-width="5"/><circle r="17" fill="none" stroke="#D2AA74" stroke-width="2.5"/>' +
      '<path d="M0 -14L4 -4L14 0L4 4L0 14L-4 4L-14 0L-4 -4Z" fill="#D2AA74" stroke="#7F411C" stroke-width=".8"/></g>';
    // tassels along the hem
    var tas = '';
    for (var x = -152; x <= 96; x += 22) {
      var yb = -190 + (x < -60 ? (x + 60) * -.03 : 0) + 4;
      tas += '<path d="M' + x + ' ' + yb + 'v8" stroke="#7F411C" stroke-width="1.4"/><path d="M' + (x - 4.5) + ' ' + (yb + 8) + 'h9l-2 12h-5z" fill="url(#gGold)" stroke="' + INK + '" stroke-width="1"/>';
    }
    return s + tas;
  }

  function couple() {
    var s = '';
    // groom (left)
    s += '<path d="M-70 -386C-70 -406 -62 -420 -46 -422C-30 -420 -22 -406 -22 -386Z" fill="url(#gCloth)" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M-52 -420L-46 -404L-40 -420" fill="none" stroke="#B47838" stroke-width="2"/>';
    s += '<path d="M-60 -418C-56 -398 -36 -398 -32 -418" fill="none" stroke="#6A2410" stroke-width="5" stroke-dasharray="3 2.4"/>'; // rose garland
    s += '<path d="M-58 -417C-54 -401 -38 -401 -34 -417" fill="none" stroke="#E0BE88" stroke-width="2" stroke-dasharray="2 3"/>';
    s += '<rect x="-50" y="-428" width="8" height="8" fill="url(#gHuman)"/>';
    s += '<ellipse cx="-46" cy="-437" rx="10" ry="11.5" fill="url(#gHuman)" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M-56.5 -440C-58 -456 -34 -458 -35.5 -440C-42 -444 -50 -444 -56.5 -440Z" fill="#6A2410" stroke="' + INK + '" stroke-width="1.3"/>';
    s += '<path d="M-48 -452l2 -8l2 8z" fill="#D2AA74"/><circle cx="-46" cy="-447" r="2" fill="#D2AA74"/>';
    s += '<circle cx="-49.5" cy="-437" r="1.1" fill="' + INK + '"/><circle cx="-42.5" cy="-437" r="1.1" fill="' + INK + '"/><path d="M-50 -431q4 2.4 8 0" stroke="' + INK + '" stroke-width="1.5" fill="none"/>';
    // bride (right)
    s += '<path d="M-22 -386C-22 -404 -14 -418 2 -420C17 -418 25 -404 26 -386Z" fill="url(#gRed)" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M-16 -414C-6 -404 6 -398 22 -388" stroke="#C29663" stroke-width="4" fill="none"/>';
    s += '<path d="M-6 -418q8 9 16 0" stroke="#D2AA74" stroke-width="2.2" fill="none"/>';
    s += '<rect x="-2" y="-426" width="8" height="8" fill="url(#gHuman)"/>';
    s += '<ellipse cx="2" cy="-435" rx="9.5" ry="11" fill="url(#gHuman)" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M-8 -433C-12 -452 16 -452 12 -433C10 -442 5 -446 2 -446C-2 -446 -6 -442 -8 -433Z" fill="#2E170B"/>';
    s += '<path d="M10 -440q6 6 4 16" stroke="#E0BE88" stroke-width="3.4" stroke-dasharray="2 2" fill="none"/>';
    s += '<circle cx="2" cy="-444" r="1.8" fill="#C29663"/><circle cx="2" cy="-439.5" r="1" fill="#6A2410"/>';
    s += '<circle cx="-1.5" cy="-434" r="1" fill="' + INK + '"/><circle cx="5.5" cy="-434" r="1" fill="' + INK + '"/><path d="M-1 -429q3 1.8 6 0" stroke="#6A2410" stroke-width="1.3" fill="none"/>';
    s += '<circle cx="-7.6" cy="-430" r="1.7" fill="#C29663"/><circle cx="11.6" cy="-430" r="1.7" fill="#C29663"/>';
    return s;
  }

  function howdah() {
    var s = '', cx = -20;
    // back pillars + back wall shade
    s += '<rect x="-88" y="-472" width="134" height="100" fill="#512A16" opacity=".55"/>';
    s += couple();
    // platform
    s += '<path d="M-100 -342H62L68 -374H-106Z" fill="url(#gGold)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<rect x="-104" y="-368" width="170" height="9" fill="#6A2410" stroke="' + INK + '" stroke-width="1.2"/>';
    var studs = ''; for (var x = -98; x < 64; x += 11) studs += '<circle cx="' + x + '" cy="-350" r="2.3" fill="#D2AA74" stroke="#7F411C" stroke-width=".7"/>';
    s += studs;
    // front railing
    var rail = '<rect x="-104" y="-388" width="170" height="5" fill="url(#gGoldH)" stroke="' + INK + '" stroke-width="1"/>';
    for (x = -100; x < 66; x += 9) rail += '<rect x="' + (x - 1.5) + '" y="-383" width="3" height="10" fill="#B47838"/>';
    s += rail;
    // pillars
    [-96, 54].forEach(function (px) {
      s += '<rect x="' + (px - 4) + '" y="-474" width="8" height="90" fill="url(#gGoldH)" stroke="' + INK + '" stroke-width="1.3"/>';
      s += '<ellipse cx="' + px + '" cy="-432" rx="6" ry="3" fill="#D2AA74" stroke="' + INK + '" stroke-width="1"/>';
    });
    // cornice + dome
    s += '<path d="M-112 -472H74L68 -486H-106Z" fill="url(#gGold)" stroke="' + INK + '" stroke-width="1.8"/>';
    s += '<path d="M-100 -486C-98 -548 58 -548 60 -486Z" fill="url(#gGold)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M-64 -488C-60 -530 0 -540 -20 -540M24 -488C20 -530 -40 -540 -20 -540M-20 -540V-486" stroke="#7F411C" stroke-width="1.4" fill="none" opacity=".7"/>';
    s += '<path d="M-26 -544q6 -10 12 0zM-23 -552h6v-4h-6zM-20 -556l0 -16" stroke="' + INK + '" stroke-width="1.2" fill="url(#gGold)"/>';
    s += '<circle cx="-20" cy="-560" r="4" fill="url(#gGold)" stroke="' + INK + '" stroke-width="1"/>';
    // swags of jasmine with marigold drops between pillars
    s += '<path d="M-96 -470Q-20 -432 54 -470" stroke="#E0BE88" stroke-width="5" stroke-dasharray="3 2" fill="none"/>';
    s += '<path d="M-96 -470Q-20 -440 54 -470" stroke="#B47838" stroke-width="3" stroke-dasharray="3 6" fill="none"/>';
    for (var k = 0; k < 5; k++) { var gx = -80 + k * 30; s += '<line x1="' + gx + '" y1="-462" x2="' + gx + '" y2="-444" stroke="#E0BE88" stroke-width="3" stroke-dasharray="2 1.5"/><circle cx="' + gx + '" cy="-441" r="3.6" fill="#6A2410"/>'; }
    return '<g class="howdah">' + s + '</g>';
  }

  function elHead() {
    var s = '';
    // far ear peeking behind the head
    s += '<path d="M150 -322C130 -330 112 -316 112 -296C112 -280 122 -268 134 -262Z" fill="url(#gSkinFar)" stroke="#2E170B" stroke-width="2"/>';
    s += '<path d="M118 -306C130 -360 202 -376 236 -344C256 -324 262 -288 256 -258C252 -238 244 -226 236 -218L176 -204C152 -204 132 -232 122 -262Z" fill="url(#gSkin)" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
    s += '<path d="M180 -214q-6 10 4 16q18 2 30 -6" fill="#7F411C" stroke="' + INK + '" stroke-width="2"/>';
    // eye with wrinkles
    s += '<path d="M206 -292q8 -6 16 0q-8 5 -16 0Z" fill="#2E170B"/><circle cx="215" cy="-292" r="1.8" fill="#B47838"/>';
    s += '<path d="M202 -300q12 -8 24 2M200 -286q10 6 24 0" stroke="#3B2113" stroke-width="1.3" fill="none" opacity=".55"/>';
    return s;
  }

  function elEar() {
    var s = '<path d="M172 -328C140 -336 108 -318 106 -284C104 -250 122 -222 150 -206C162 -218 168 -246 170 -270Z" fill="url(#gSkin)" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
    s += '<path d="M160 -318C132 -318 118 -300 118 -280M150 -300C136 -296 130 -284 132 -268" stroke="#512A16" stroke-width="1.4" fill="none" opacity=".5"/>';
    var spots = ''; var r = A.rng(31);
    for (var i = 0; i < 14; i++) spots += '<circle cx="' + f(118 + r() * 30) + '" cy="' + f(-300 + r() * 70) + '" r="' + f(1 + r() * 1.6) + '" fill="#B47838" opacity=".55"/>';
    return s + spots;
  }

  function elNetti() {
    var shape = 'M178 -356C206 -368 236 -358 248 -336L256 -270C250 -248 240 -238 232 -234C216 -246 202 -270 192 -302Z';
    var s = '<path d="' + shape + '" fill="url(#gGold)" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="' + shape + '" fill="url(#pNetti)" opacity=".9"/>';
    s += '<path d="M188 -352C210 -362 232 -354 242 -338" stroke="#6A2410" stroke-width="4" fill="none"/>';
    s += '<path d="M214 -364q8 -14 16 0q-8 -5 -16 0Z" fill="url(#gGold)" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<path d="M232 -236l-3 14h7z" fill="#6A2410" stroke="' + INK + '" stroke-width="1"/>';
    return s;
  }

  FIG.elephant = function () {
    var root = document.createElementNS(NS, 'g'); root.setAttribute('class', 'elephant');
    root.innerHTML =
      '<ellipse cx="-20" cy="2" rx="250" ry="20" fill="url(#gShadow)"/>' +
      '<g class="farlegs"><g data-leg="rhf">' + elLeg(false) + '</g><g data-leg="flf">' + elLeg(false) + '</g></g>' +
      '<g class="bodyA"><path class="tail" fill="url(#gSkin)" stroke="' + INK + '" stroke-width="1.8"/><path class="tuft" fill="#2E170B"/>' + elBody() + '</g>' +
      '<g class="nearlegs"><g data-leg="rhn">' + elLeg(true) + '</g><g data-leg="fln">' + elLeg(true) + '</g></g>' +
      '<g class="bodyB">' + elCloth() +
        '<g class="hw">' + howdah() + '</g>' +
        '<g class="head">' + elHead() +
          '<path class="trunk" fill="url(#gSkin)" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/><path class="creases" stroke="#3B2113" stroke-width="1.3" fill="none" opacity=".45"/>' +
          '<path d="M226 -228C258 -218 290 -208 306 -226C292 -214 260 -210 228 -216Z" fill="url(#gIvory)" stroke="' + INK + '" stroke-width="1.8"/>' +
          elNetti() +
          '<g class="ear">' + elEar() + '</g>' +
          '<g class="bell"><path d="M160 -214Q166 -200 168 -186" stroke="#7F411C" stroke-width="2" fill="none"/><path d="M160 -186q8 -10 16 0l3 10h-22z" fill="url(#gGold)" stroke="' + INK + '" stroke-width="1.2"/></g>' +
        '</g>' +
      '</g>';
    var legs = EL.legs.map(function (L) {
      var el = q(root, '[data-leg="' + L.id + '"]');
      return { cfg: L, skin: q(el, '.skin'), crease: q(el, '.crease'), band: q(el, '.band'), nails: q(el, '.nails') };
    });
    var bodyA = q(root, '.bodyA'), bodyB = q(root, '.bodyB'), head = q(root, '.head'), ear = q(root, '.ear');
    var trunk = q(root, '.trunk'), creases = q(root, '.creases'), tail = q(root, '.tail'), tuft = q(root, '.tuft'), hw = q(root, '.hw'), bell = q(root, '.bell');

    function update(t, phase, amp) {
      // body: dips as weight transfers (4 footfalls per cycle), rolls side to side
      var bob = 2.6 * amp * Math.cos(TAU * phase * 2) + Math.sin(t * 1.1) * .6;
      var roll = .9 * amp * Math.sin(TAU * phase);
      var bf = 'translate(0 ' + f(bob) + ') rotate(' + f(roll) + ' 0 -240)';
      T(bodyA, bf); T(bodyB, bf);
      var cr = Math.cos(roll * D2R), sr = Math.sin(roll * D2R);
      legs.forEach(function (Lg) {
        var c = Lg.cfg;
        // hip follows the body frame
        var hx = c.hx * cr - (c.hy + 240) * sr, hy = c.hx * sr + (c.hy + 240) * cr - 240 + bob;
        var gp = gait(phase + c.off, EL.D, EL.L, EL.lift * amp);
        var fx = c.hx + 6 + gp.x * amp, fy = -EL.pad + gp.y;
        var s = ik(hx, hy, fx, fy, EL.a, EL.b, c.front ? 1 : -1);
        var sh = legShape([hx, hy], [s.kx, s.ky], [s.ax, s.ay], EL.pad + gp.y * 0, c.front);
        Lg.skin.setAttribute('d', sh.d); Lg.crease.setAttribute('d', sh.cr); Lg.band.setAttribute('d', sh.band); Lg.nails.setAttribute('d', sh.nails);
      });
      // head nods with the front legs, ears breathe, the bell swings
      T(head, 'rotate(' + f(1.6 * amp * Math.sin(TAU * phase + 1.2) + Math.sin(t * .7) * .6) + ' 140 -290)');
      T(ear, 'translate(170 -300) scale(' + f(1 + .05 * Math.sin(t * 1.25)) + ' 1) skewY(' + f(2.5 * Math.sin(t * 1.25 + .4)) + ') translate(-170 300)');
      T(bell, 'rotate(' + f(-6 * Math.sin(TAU * phase + .6) * amp) + ' 160 -214)');
      T(hw, 'rotate(' + f(.7 * amp * Math.sin(TAU * phase - .7)) + ' -20 -342)');
      // trunk: a hanging chain that swings with the stride, curling at the tip
      var base = [72, 78, 83, 87, 90, 92, 93, 92, 88, 76, 58, 38];
      var pts = [[238, -224]], x = 238, y = -224;
      for (var i = 0; i < base.length; i++) {
        var w = (i / base.length);
        var a = base[i] + (Math.sin(TAU * phase - i * .32) * 7 * amp + Math.sin(t * .9 - i * .25) * 4) * (.3 + w);
        x += Math.cos(a * D2R) * 14.5; y += Math.sin(a * D2R) * 14.5; pts.push([x, y]);
      }
      trunk.setAttribute('d', A.ribbon(pts, 34, 11, true));
      var cd = '';
      for (i = 1; i < pts.length - 2; i++) {
        var p = pts[i], n = pts[i + 1], dx = n[0] - p[0], dy = n[1] - p[1], dl = Math.hypot(dx, dy), ww = (34 - 23 * i / 12) * .36;
        cd += 'M' + f(p[0] - dy / dl * ww) + ' ' + f(p[1] + dx / dl * ww) + 'L' + f(p[0] + dy / dl * ww) + ' ' + f(p[1] - dx / dl * ww);
      }
      creases.setAttribute('d', cd);
      var tl = elTailPath(t, phase);
      tail.setAttribute('d', tl.d);
      tuft.setAttribute('d', 'M' + f(tl.end[0] - 4) + ' ' + f(tl.end[1] - 4) + 'q-6 14 0 22q4 -6 6 -2q2 -8 6 -4q-2 -10 -8 -16z');
    }
    return { el: root, update: update, L: EL.L };
  };

  /* =====================================================================
     PEOPLE
     ===================================================================== */
  var HU = { a: 50, b: 48, ank: 6, L: 118, D: .6, lift: 11, hipY: -102 };
  var SK = { near: 'url(#gHuman)', far: 'url(#gHumanFar)' };

  function huLeg(near) {
    var fill = near ? SK.near : SK.far;
    return '<g class="up"><path d="M-9 -3C-10 20 -8 40 -6 50L6 50C8 40 9 20 8 -3Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.4"/></g>' +
      '<g class="lo"><path d="M-6 0C-9 14 -6 34 -4 48L3 48C4 30 5 12 5 0Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.4"/></g>' +
      '<g class="ft"><path d="M-4 -1L3 -1C8 1 13 3 14 6C14 8 12 8 10 8L-5 8C-6 5 -5 1 -4 -1Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.3"/>' +
      '<path d="M-4 1h7" stroke="#C29663" stroke-width="1.6"/></g>';
  }
  function huArm(near) {
    var fill = near ? SK.near : SK.far;
    return '<path d="M-5 -3C-6 10 -5 22 -4 30L4 30C5 22 6 10 5 -3Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.3"/>' +
      '<g class="fa"><path d="M-4 0C-4 10 -3 20 -3 27L3 27C4 20 4 10 4 0Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.3"/>' +
      '<ellipse cx="0" cy="30" rx="4.3" ry="5" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M-4 22h8" stroke="#C29663" stroke-width="1.6"/></g>';
  }
  function huHead(o) {
    var s = '<path d="M-2 -170L-3 -181L7 -181L8 -170Z" fill="url(#gHuman)"/>';
    s += '<path d="M-8 -188C-9 -200 -2 -205 5 -204C11 -203 14 -198 14 -193L17 -189L14 -187C14 -183 12 -180 9 -179C4 -178 -2 -180 -5 -183C-7 -185 -8 -186 -8 -188Z" fill="url(#gHuman)" stroke="' + INK + '" stroke-width="1.4"/>';
    s += '<path d="M-3 -181C1 -177 8 -177 12 -181L11 -185C7 -183 2 -183 -2 -184Z" fill="#2E170B"/><path d="M9 -185q4 .4 7 -1.6" stroke="#2E170B" stroke-width="1.8" fill="none"/>';
    s += '<ellipse cx="9.5" cy="-193" rx="1.4" ry="1" fill="#2E170B"/><path d="M7 -196q3 -1.4 5 0" stroke="#2E170B" stroke-width="1" fill="none"/>';
    s += '<ellipse cx="-1" cy="-191" rx="2.2" ry="3" fill="#7F411C" stroke="' + INK + '" stroke-width=".9"/>';
    s += '<path d="M11 -199h3" stroke="#D2AA74" stroke-width="1.4"/><circle cx="12.5" cy="-197" r=".9" fill="#6A2410"/>';
    s += '<path d="M-10.5 -191C-13 -204 -4 -212 6 -211C13 -210 17 -204 16 -197C10 -199 0 -198 -10.5 -191Z" fill="' + o.turban + '" stroke="' + INK + '" stroke-width="1.3"/>';
    s += '<path d="M-8 -197C0 -201 8 -203 15 -201M-6 -203C2 -207 9 -207 14 -205" stroke="' + INK + '" stroke-width=".9" fill="none" opacity=".45"/>';
    if (o.crest) s += '<path d="M-6 -208q-6 -12 2 -18q2 8 6 12z" fill="' + o.crest + '" stroke="' + INK + '" stroke-width="1"/>';
    if (o.band) s += '<path d="M-10 -194C0 -199 9 -200 16 -198" stroke="' + o.band + '" stroke-width="2.4" fill="none"/>';
    return s;
  }
  function huTorso(o) {
    var s = '';
    if (o.robe) {
      s += '<path d="M-13 -100C-16 -122 -16 -146 -12 -160C-8 -170 0 -173 6 -172C12 -170 17 -162 17 -150C18 -130 15 -116 14 -100Z" fill="url(#gCloth)" stroke="' + INK + '" stroke-width="1.4"/>';
      s += '<path d="M4 -170L8 -104" stroke="#B47838" stroke-width="1.6"/><path d="M-13 -104H14" stroke="#6A2410" stroke-width="4"/>';
      s += '<path d="M-8 -168C-14 -140 -16 -120 -18 -86L-10 -86C-8 -118 -4 -146 2 -168Z" fill="#6A2410" stroke="' + INK + '" stroke-width="1.2"/>';
    } else {
      s += '<path d="M-11 -100C-14 -120 -15 -140 -12 -158C-9 -168 -2 -172 4 -171C10 -170 15 -163 16 -152C17 -140 13 -122 12 -100Z" fill="url(#gHuman)" stroke="' + INK + '" stroke-width="1.4"/>';
      s += '<path d="M-9 -165L12 -106" stroke="#E0BE88" stroke-width="1.1"/>';
      s += '<path d="M10 -150q-4 6 -2 12" stroke="#683417" stroke-width="1" fill="none" opacity=".6"/>';
      s += '<path d="M-10 -136h22M-10 -142h22" stroke="#E0BE88" stroke-width="1.4" opacity=".55"/>';
      if (o.sash) s += '<path d="M-12 -166C-4 -150 6 -134 13 -112L9 -110C2 -130 -8 -148 -14 -160Z" fill="' + o.sash + '" stroke="' + INK + '" stroke-width="1"/>';
    }
    return s;
  }

  /* kinds: leader, umbrella, thavil, nadaswaram */
  FIG.person = function (kind, seed) {
    var o = {
      leader: { turban: '#B47838', band: '#6A2410', crest: '#6A2410', robe: true, hem: .9, cloth: 'url(#gCloth)' },
      umbrella: { turban: '#E0BE88', band: '#B47838', sash: '#B47838', hem: .62, cloth: 'url(#gCloth)' },
      thavil: { turban: '#6A2410', band: '#C29663', sash: '#E0BE88', hem: .6, cloth: 'url(#gCloth)' },
      nadaswaram: { turban: '#B47838', band: '#E0BE88', sash: '#6A2410', hem: .6, cloth: 'url(#gCloth)' }
    }[kind];
    var root = document.createElementNS(NS, 'g'); root.setAttribute('class', 'person ' + kind);
    var props = '', propsBack = '';
    if (kind === 'umbrella') {
      props = '<g class="umb"><path d="M17 -96L19 -330" stroke="#683417" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M-44 -322Q18 -404 80 -322Z" fill="url(#gRed)" stroke="' + INK + '" stroke-width="2"/>' +
        '<path d="M-14 -326Q2 -380 18 -386M50 -326Q36 -380 18 -386M18 -386V-326" stroke="#C29663" stroke-width="1.6" fill="none" opacity=".8"/>' +
        '<path d="M-46 -322H82V-312H-46Z" fill="url(#pBorder)" stroke="' + INK + '" stroke-width="1.2"/>' +
        (function () { var t = ''; for (var x = -42; x <= 78; x += 10) t += '<path d="M' + x + ' -312q5 9 10 0" fill="#C29663" stroke="#7F411C" stroke-width=".8"/>'; return t; })() +
        '<path d="M-46 -312v16M82 -312v16" stroke="#C29663" stroke-width="2"/><circle cx="-46" cy="-294" r="3.5" fill="#6A2410"/><circle cx="82" cy="-294" r="3.5" fill="#6A2410"/>' +
        '<path d="M14 -392h8l-4 -14z" fill="url(#gGold)" stroke="' + INK + '" stroke-width="1"/></g>';
    } else if (kind === 'thavil') {
      props = '<g class="drum"><path d="M-22 -122C-26 -112 -26 -96 -22 -88H26C30 -96 30 -112 26 -122Z" fill="#683417" stroke="' + INK + '" stroke-width="1.6"/>' +
        '<path d="M-20 -121L24 -89M-20 -89L24 -121M-10 -122L14 -88M-10 -88L14 -122" stroke="#C29663" stroke-width="1.1" opacity=".85"/>' +
        '<ellipse cx="-22" cy="-105" rx="4.5" ry="17" fill="#D2AA74" stroke="' + INK + '" stroke-width="1.3"/><ellipse cx="26" cy="-105" rx="4.5" ry="17" fill="#D2AA74" stroke="' + INK + '" stroke-width="1.3"/>' +
        '<path d="M-14 -160L-20 -121M12 -158L24 -121" stroke="#6A2410" stroke-width="2.2"/></g>';
    } else if (kind === 'nadaswaram') {
      props = '<g class="pipe"><path d="M14 -186L50 -122" stroke="#512A16" stroke-width="5.5" stroke-linecap="round"/>' +
        '<path d="M14 -186L50 -122" stroke="#7F411C" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M44 -132L62 -100Q46 -98 38 -112Z" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="1.3"/>' +
        '<path d="M22 -172l2 1M27 -163l2 1M32 -154l2 1M37 -145l2 1" stroke="#C29663" stroke-width="2"/></g>';
    } else if (kind === 'leader') {
      props = '<g class="staff"><path d="M0 0V-150" stroke="#683417" stroke-width="4" stroke-linecap="round"/><path d="M-5 -150h10l-5 -18z" fill="url(#gGold)" stroke="' + INK + '" stroke-width="1"/><circle cx="0" cy="-151" r="4" fill="url(#gGold)" stroke="' + INK + '" stroke-width="1"/></g>';
    }
    root.innerHTML =
      '<ellipse cx="2" cy="2" rx="38" ry="7" fill="url(#gShadow)"/>' +
      '<g class="bf">' +
        '<g class="armF">' + huArm(false) + '</g>' +
      '</g>' +
      '<g class="legF">' + huLeg(false) + '</g>' +
      '<g class="legN">' + huLeg(true) + '</g>' +
      '<path class="dhoti" fill="' + o.cloth + '" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path class="hem" stroke="' + (o.robe ? '#B47838' : '#6A2410') + '" stroke-width="2.2" fill="none"/>' +
      '<path class="pleat" stroke="#B47838" stroke-width="1.1" fill="none" opacity=".8"/>' +
      '<g class="bf2">' + huTorso(o) + huHead(o) + propsBack + props + '<g class="armN">' + huArm(true) + '</g></g>';
    var bf = q(root, '.bf'), bf2 = q(root, '.bf2');
    var legs = ['legF', 'legN'].map(function (c, i) { var e = q(root, '.' + c); return { up: q(e, '.up'), lo: q(e, '.lo'), ft: q(e, '.ft'), off: i ? 0 : .5, hx: i ? 2 : -2 }; });
    var armN = q(root, '.armN'), armF = q(root, '.armF'), faN = q(armN, '.fa'), faF = q(armF, '.fa');
    var dhoti = q(root, '.dhoti'), hem = q(root, '.hem'), pleat = q(root, '.pleat');
    var umb = q(root, '.umb'), drum = q(root, '.drum'), staff = q(root, '.staff'), pipe = q(root, '.pipe');
    var sh = [2, -163], UA = 30, FA = 28;

    function placeArm(arm, fa, hand, bodyY, bend) {
      var s = ik(sh[0], sh[1], hand[0], hand[1] - bodyY, UA, FA + 2, bend);
      T(arm, 'translate(' + sh[0] + ' ' + sh[1] + ') rotate(' + f(s.a1) + ')');
      T(fa, 'translate(0 ' + UA + ') rotate(' + f(s.a2 - s.a1) + ')');
    }
    function swingArm(arm, fa, ang, elbow) {
      T(arm, 'translate(' + sh[0] + ' ' + sh[1] + ') rotate(' + f(ang) + ')');
      T(fa, 'translate(0 ' + UA + ') rotate(' + f(elbow) + ')');
    }

    function update(t, phase, amp, beat) {
      var bob = -2.2 * amp * Math.cos(TAU * 2 * (phase - .3));
      var lean = kind === 'umbrella' ? -1.5 : 1.2;
      var bfT = 'translate(0 ' + f(bob) + ') rotate(' + f(lean + Math.sin(TAU * phase) * .8 * amp) + ' 0 -100)';
      T(bf, bfT); T(bf2, bfT);
      var hipY = HU.hipY + bob, feet = [];
      legs.forEach(function (L) {
        var gp = gait(phase + L.off, HU.D, HU.L, HU.lift * amp);
        var fx = L.hx + 3 + gp.x * amp, fy = -HU.ank + gp.y;
        var s = ik(L.hx, hipY, fx, fy, HU.a, HU.b, -1);
        T(L.up, 'translate(' + f(L.hx) + ' ' + f(hipY) + ') rotate(' + f(s.a1) + ')');
        T(L.lo, 'translate(' + f(s.kx) + ' ' + f(s.ky) + ') rotate(' + f(s.a2) + ')');
        var toe = gp.sw ? (gp.sw < .5 ? 18 * gp.sw * 2 : 18 * (1 - gp.sw) * 2 - 6 * (gp.sw - .5)) * amp : 0;
        T(L.ft, 'translate(' + f(s.ax) + ' ' + f(s.ay) + ') rotate(' + f(toe) + ')');
        feet.push(s);
      });
      // cloth: waist band moves with the body, hem follows the shins
      var hk = o.hem, F = feet[1], B = feet[0];
      var front = F.ax > B.ax ? F : B, back = F.ax > B.ax ? B : F;
      var fxh = front.kx + (front.ax - front.kx) * hk + 9, fyh = front.ky + (front.ay - front.ky) * hk;
      var bxh = back.kx + (back.ax - back.kx) * hk - 9, byh = back.ky + (back.ay - back.ky) * hk;
      var wy = hipY - 2, wl = -15, wr = 15;
      if (o.robe) { wy = hipY - 70; wl = -13; wr = 16; }
      var d = 'M' + f(wl) + ' ' + f(wy) + 'L' + f(wr) + ' ' + f(wy) + 'C' + f(wr + 4) + ' ' + f(wy + 30) + ' ' + f(fxh + 1) + ' ' + f(fyh - 26) + ' ' + f(fxh) + ' ' + f(fyh) +
        'Q' + f((fxh + bxh) / 2) + ' ' + f((fyh + byh) / 2 + 5) + ' ' + f(bxh) + ' ' + f(byh) + 'C' + f(bxh - 2) + ' ' + f(byh - 30) + ' ' + f(wl - 4) + ' ' + f(wy + 30) + ' ' + f(wl) + ' ' + f(wy) + 'Z';
      dhoti.setAttribute('d', d);
      hem.setAttribute('d', 'M' + f(fxh) + ' ' + f(fyh - 2) + 'Q' + f((fxh + bxh) / 2) + ' ' + f((fyh + byh) / 2 + 3) + ' ' + f(bxh) + ' ' + f(byh - 2));
      pleat.setAttribute('d', 'M2 ' + f(wy + 4) + 'Q' + f((F.kx + B.kx) / 2) + ' ' + f((F.ky + B.ky) / 2) + ' ' + f((fxh + bxh) / 2 - 2) + ' ' + f((fyh + byh) / 2) +
        'M7 ' + f(wy + 4) + 'Q' + f(F.kx + 2) + ' ' + f(F.ky - 4) + ' ' + f(fxh - 6) + ' ' + f(fyh - 4));
      // arms
      var sw = Math.sin(TAU * (phase - .3));
      if (kind === 'leader') {
        swingArm(armF, faF, 14 * sw * amp + 4, -12);
        placeArm(armN, faN, [26 - sw * 4 * amp, -112], bob, -1);
        T(staff, 'translate(' + f(28 - sw * 4 * amp) + ' ' + f(-112 + bob + 140) + ') rotate(' + f(-3 + sw * 3 * amp) + ' 0 -140)');
      } else if (kind === 'umbrella') {
        placeArm(armF, faF, [18, -178], bob, 1);
        placeArm(armN, faN, [18, -150], bob, 1);
        T(umb, 'rotate(' + f(Math.sin(TAU * phase + .5) * 2.2 * amp + Math.sin(t * .8) * .8) + ' 17 -100)');
      } else if (kind === 'thavil') {
        var hit = Math.pow(Math.max(0, Math.sin(beat * TAU)), 6);
        var hit2 = Math.pow(Math.max(0, Math.sin(beat * TAU * 2 + 1.2)), 6);
        placeArm(armN, faN, [32 - hit * 6, -110 - hit * 18], bob, 1);
        placeArm(armF, faF, [-30 + hit2 * 4, -112 - hit2 * 16], bob, -1);
      } else if (kind === 'nadaswaram') {
        var lift = Math.sin(t * .55) * 2;
        placeArm(armF, faF, [26, -166 + lift], bob, 1);
        placeArm(armN, faN, [38, -146 + lift], bob, 1);
        T(pipe, 'rotate(' + f(lift * .6) + ' 14 -186)');
      }
    }
    return { el: root, update: update, L: HU.L };
  };
})();
