/* ART — vector painting kit for the procession.
   Style: the envelope's world (cream sky, sepia washes for everything far away) meets
   the invitation's temple gold and kumkum red, drawn crisp like a Kerala mural:
   flat rich colour, dark-brown outlines, gold ornament. Everything returns SVG strings. */
(function () {
  'use strict';
  var A = (window.ART = {});
  var f = function (n) { return Math.round(n * 10) / 10; };
  A.f = f;

  /* seeded random so the world is identical on every visit */
  A.rng = function (seed) {
    var s = seed >>> 0;
    return function () { s += 0x6D2B79F5; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };

  var INK = '#2E170B';
  A.INK = INK;

  /* sepia by depth: 0 = nearest (strong), 1 = far (melts into the haze) */
  A.sepia = function (depth, k) {
    var near = [150, 104, 62], far = [236, 214, 178];
    var t = Math.min(1, Math.max(0, depth));
    var c = near.map(function (n, i) { return Math.round(n + (far[i] - n) * t + (k || 0)); });
    return 'rgb(' + c.join(',') + ')';
  };

  /* ------------------------------------------------------------------ defs */
  A.defs = function () {
    return '' +
      '<linearGradient id="gSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E3A1C"/><stop offset=".55" stop-color="#55301A"/><stop offset="1" stop-color="#3E2213"/></linearGradient>' +
      '<linearGradient id="gSkinFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E2213"/><stop offset="1" stop-color="#2B170C"/></linearGradient>' +
      '<linearGradient id="gSkinLeg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3E2213"/><stop offset=".45" stop-color="#5A321B"/><stop offset="1" stop-color="#3B2012"/></linearGradient>' +
      '<linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D2AA74"/><stop offset=".45" stop-color="#B47838"/><stop offset="1" stop-color="#97511D"/></linearGradient>' +
      '<linearGradient id="gGoldH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#97511D"/><stop offset=".35" stop-color="#D2AA74"/><stop offset=".6" stop-color="#B47838"/><stop offset="1" stop-color="#7F411C"/></linearGradient>' +
      '<linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A2410"/><stop offset="1" stop-color="#6A2410"/></linearGradient>' +
      '<linearGradient id="gIvory" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0BE88"/><stop offset="1" stop-color="#C29663"/></linearGradient>' +
      '<linearGradient id="gCloth" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9A06C"/><stop offset=".4" stop-color="#E3C796"/><stop offset="1" stop-color="#C29663"/></linearGradient>' +
      '<linearGradient id="gHuman" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6A3418"/><stop offset=".5" stop-color="#94532A"/><stop offset="1" stop-color="#6E3619"/></linearGradient>' +
      '<linearGradient id="gHumanFar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4E260F"/><stop offset="1" stop-color="#5E2E15"/></linearGradient>' +
      '<linearGradient id="gBrass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7F411C"/><stop offset=".3" stop-color="#C29663"/><stop offset=".55" stop-color="#A3632D"/><stop offset="1" stop-color="#683417"/></linearGradient>' +
      '<linearGradient id="gBanana" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A3632D"/><stop offset="1" stop-color="#7F411C"/></linearGradient>' +
      '<linearGradient id="gWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3B2113"/><stop offset=".5" stop-color="#683417"/><stop offset="1" stop-color="#3B2113"/></linearGradient>' +
      '<radialGradient id="gFlame" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#E0BE88"/><stop offset=".35" stop-color="#D2AA74"/><stop offset=".8" stop-color="#B47838"/><stop offset="1" stop-color="#A3632D" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="gGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#D2AA74" stop-opacity=".75"/><stop offset=".4" stop-color="#C29663" stop-opacity=".25"/><stop offset="1" stop-color="#C29663" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="gShadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#512A16" stop-opacity=".42"/><stop offset="1" stop-color="#512A16" stop-opacity="0"/></radialGradient>' +
      '<pattern id="pCaparison" width="26" height="26" patternUnits="userSpaceOnUse">' +
        '<path d="M13 3 L17 13 L13 23 L9 13 Z" fill="#C29663" stroke="#7F411C" stroke-width=".8"/>' +
        '<circle cx="0" cy="0" r="2.4" fill="#D2AA74"/><circle cx="26" cy="0" r="2.4" fill="#D2AA74"/><circle cx="0" cy="26" r="2.4" fill="#D2AA74"/><circle cx="26" cy="26" r="2.4" fill="#D2AA74"/>' +
        '<circle cx="13" cy="13" r="1.6" fill="#6A2410"/></pattern>' +
      '<pattern id="pNetti" width="11" height="10" patternUnits="userSpaceOnUse">' +
        '<circle cx="5.5" cy="5" r="4.1" fill="#D2AA74" stroke="#7F411C" stroke-width=".9"/><circle cx="5.5" cy="5" r="1.4" fill="#A3632D"/></pattern>' +
      '<pattern id="pBorder" width="12" height="12" patternUnits="userSpaceOnUse">' +
        '<rect width="12" height="12" fill="#B47838"/><circle cx="6" cy="6" r="3" fill="#D2AA74" stroke="#7F411C" stroke-width=".7"/></pattern>';
  };

  /* --------------------------------------------------------------- helpers */
  /* smooth path through points (Catmull-Rom → cubic bezier) */
  A.smooth = function (pts, closed) {
    var n = pts.length, d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    for (var i = 0; i < n - (closed ? 0 : 1); i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      if (!closed) { if (i === 0) p0 = p1; if (i + 2 >= n) p3 = p2; }
      d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
        f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
    }
    return d + (closed ? 'Z' : '');
  };

  /* tapered ribbon along a polyline (used for trunk, tail, fronds) */
  A.ribbon = function (pts, w0, w1, tipRound) {
    var L = [], R = [], n = pts.length;
    for (var i = 0; i < n; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      var nx = -dy / len, ny = dx / len, w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
      L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    }
    var d = A.smooth(L, false);
    var e = pts[n - 1], r = R[n - 1];
    d += tipRound ? 'A' + f(w1 / 2) + ' ' + f(w1 / 2) + ' 0 0 1 ' + f(r[0]) + ' ' + f(r[1]) : 'L' + f(r[0]) + ' ' + f(r[1]);
    var back = A.smooth(R.slice().reverse(), false);
    return d + back.replace(/^M[^C]*/, '') + 'Z';
  };

  /* ------------------------------------------------------------- landscape */
  A.hills = function (x0, x1, baseY, amp, rnd, fill) {
    var pts = [[x0, baseY + 40]], x = x0;
    while (x < x1) { pts.push([x, baseY - amp * (.35 + rnd() * .65)]); x += 160 + rnd() * 260; }
    pts.push([x1, baseY - amp * .5]); pts.push([x1, baseY + 40]);
    var top = pts.slice(1, -1);
    return '<path d="M' + x0 + ' ' + (baseY + 40) + A.smooth(top, false).replace(/^M/, 'L') + 'L' + x1 + ' ' + (baseY + 40) + 'Z" fill="' + fill + '"/>';
  };

  /* coconut palm, sepia wash — fronds drawn as feathery silhouettes like a miniature painting */
  A.frond = function (tx, ty, ang, len, droop, wid, col) {
    var ex = tx + Math.cos(ang) * len, ey = ty + Math.sin(ang) * len * .55 + droop;
    var qx = tx + Math.cos(ang) * len * .55, qy = ty + Math.sin(ang) * len * .55 - len * .16;
    var N = 18, sideA = [], sideB = [], spine = [];
    function P(u) { return [(1 - u) * (1 - u) * tx + 2 * (1 - u) * u * qx + u * u * ex, (1 - u) * (1 - u) * ty + 2 * (1 - u) * u * qy + u * u * ey]; }
    for (var k = 0; k <= N; k++) {
      var u = k / N, p = P(u), p2 = P(Math.min(1, u + .02)), dx = p2[0] - p[0], dy = p2[1] - p[1], dl = Math.hypot(dx, dy) || 1;
      var nx = -dy / dl, ny = dx / dl, w = wid * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.06 + .04)), .8);
      spine.push(p);
      // leaflets hang: both sides swept back along the spine and pulled down by gravity
      var bx = -dx / dl * w * .55, by = -dy / dl * w * .55 + w * .55;
      sideA.push([p[0] + nx * w * .25, p[1] + ny * w * .25]); sideA.push([p[0] + nx * w + bx, p[1] + ny * w + by]);
      sideB.push([p[0] - nx * w * .25, p[1] - ny * w * .25]); sideB.push([p[0] - nx * w + bx, p[1] - ny * w + by]);
    }
    var d = 'M' + f(tx) + ' ' + f(ty);
    sideA.forEach(function (q) { d += 'L' + f(q[0]) + ' ' + f(q[1]); });
    d += 'L' + f(ex) + ' ' + f(ey);
    sideB.reverse().forEach(function (q) { d += 'L' + f(q[0]) + ' ' + f(q[1]); });
    return '<path d="' + d + 'Z" fill="' + col + '" stroke="' + col + '" stroke-width="1" stroke-linejoin="round"/>';
  };
  A.palm = function (x, baseY, h, lean, rnd, col, w) {
    w = w || 1;
    var tx = x + lean, ty = baseY - h, s = '';
    var cx = x + lean * .25, cy = baseY - h * .55;
    s += '<path d="M' + f(x - 9 * w) + ' ' + baseY + 'Q' + f(cx - 7 * w) + ' ' + f(cy) + ' ' + f(tx - 4.5 * w) + ' ' + f(ty) + 'L' + f(tx + 4.5 * w) + ' ' + f(ty) + 'Q' + f(cx + 7 * w) + ' ' + f(cy) + ' ' + f(x + 9 * w) + ' ' + baseY + 'Z" fill="' + col + '"/>';
    var rings = '';
    for (var t = .06; t < .97; t += .05) {
      var px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * tx, py = (1 - t) * (1 - t) * baseY + 2 * (1 - t) * t * cy + t * t * ty;
      var ww = (9 - 4 * t) * w;
      rings += 'M' + f(px - ww) + ' ' + f(py) + 'q' + f(ww) + ' ' + f(2.5 * w) + ' ' + f(ww * 2) + ' 0';
    }
    s += '<path d="' + rings + '" stroke="rgba(40,20,8,.18)" stroke-width="' + f(1.2 * w) + '" fill="none"/>';
    var fronds = 10, sc = h / 420;
    for (var i = 0; i < fronds; i++) {
      var ang = -Math.PI / 2 + (i / (fronds - 1) - .5) * Math.PI * 1.7 + (rnd() - .5) * .22;
      var side = Math.abs(Math.cos(ang));
      var len = (120 + rnd() * 40) * sc * (side * .45 + .65) * w;
      s += A.frond(tx, ty, ang, len, (30 + side * 70) * sc * w, (20 + rnd() * 6) * sc * w, col);
    }
    s += '<ellipse cx="' + f(tx) + '" cy="' + f(ty + 7 * w) + '" rx="' + f(9 * w) + '" ry="' + f(6 * w) + '" fill="' + col + '"/>';
    return '<g>' + s + '</g>';
  };

  /* Dravidian gopuram, front view: plinth with doorway, stepped tiers of niches, barrel vault + kalasams */
  A.gopuram = function (cx, baseY, w, h, col, line, opts) {
    opts = opts || {};
    var s = '', baseH = h * .2, top = baseY - h, tiers = opts.tiers || 7;
    var bw = w;
    // plinth
    s += '<rect x="' + f(cx - bw / 2) + '" y="' + f(baseY - baseH) + '" width="' + f(bw) + '" height="' + f(baseH) + '" fill="' + col + '"/>';
    for (var m = 0; m < 4; m++) s += '<rect x="' + f(cx - bw / 2 - 4) + '" y="' + f(baseY - baseH + m * baseH * .26) + '" width="' + f(bw + 8) + '" height="' + f(baseH * .05) + '" fill="' + line + '" opacity=".55"/>';
    // pilasters on plinth
    for (var p = 0; p < 6; p++) {
      var px = cx - bw / 2 + bw * (.08 + p * .168);
      if (Math.abs(px - cx) < bw * .14) continue;
      s += '<rect x="' + f(px - bw * .012) + '" y="' + f(baseY - baseH * .92) + '" width="' + f(bw * .024) + '" height="' + f(baseH * .85) + '" fill="' + line + '" opacity=".35"/>';
    }
    // doorway
    var dw = bw * .24, dh = baseH * .86;
    if (opts.door !== false) {
      s += '<path d="M' + f(cx - dw / 2) + ' ' + baseY + 'V' + f(baseY - dh * .8) + 'Q' + f(cx - dw / 2) + ' ' + f(baseY - dh) + ' ' + f(cx) + ' ' + f(baseY - dh) + 'Q' + f(cx + dw / 2) + ' ' + f(baseY - dh) + ' ' + f(cx + dw / 2) + ' ' + f(baseY - dh * .8) + 'V' + baseY + 'Z" fill="' + (opts.doorFill || line) + '" ' + (opts.doorId ? 'id="' + opts.doorId + '"' : '') + '/>';
    }
    // tiers
    var y = baseY - baseH, tierH0 = (h - baseH) * .15;
    var tw = bw * .9;
    var rnd = A.rng(opts.seed || 7);
    for (var i = 0; i < tiers; i++) {
      var th = tierH0 * (1 - i * .07), nw = tw * (1 - .075);
      // cornice
      s += '<path d="M' + f(cx - tw / 2 - 6) + ' ' + f(y) + 'H' + f(cx + tw / 2 + 6) + 'L' + f(cx + tw / 2 + 2) + ' ' + f(y - th * .18) + 'H' + f(cx - tw / 2 - 2) + 'Z" fill="' + line + '" opacity=".75"/>';
      // tier body
      s += '<path d="M' + f(cx - tw / 2) + ' ' + f(y - th * .18) + 'L' + f(cx - nw / 2) + ' ' + f(y - th) + 'H' + f(cx + nw / 2) + 'L' + f(cx + tw / 2) + ' ' + f(y - th * .18) + 'Z" fill="' + col + '"/>';
      // niches with tiny figures
      var nN = Math.max(3, Math.round(tw / (w * .12)));
      for (var k = 0; k < nN; k++) {
        var nx = cx - tw / 2 + tw * (k + .5) / nN, nh = th * .5, nwid = tw / nN * .42;
        s += '<path d="M' + f(nx - nwid / 2) + ' ' + f(y - th * .24) + 'v' + f(-nh * .7) + 'q0 ' + f(-nh * .3) + ' ' + f(nwid / 2) + ' ' + f(-nh * .3) + 'q' + f(nwid / 2) + ' 0 ' + f(nwid / 2) + ' ' + f(nh * .3) + 'v' + f(nh * .7) + 'Z" fill="' + line + '" opacity="' + (.35 + rnd() * .2) + '"/>';
        // kudu (horseshoe) on the cornice above each niche
        s += '<circle cx="' + f(nx) + '" cy="' + f(y - th * .98) + '" r="' + f(Math.min(th * .1, nwid * .3)) + '" fill="' + line + '" opacity=".5"/>';
      }
      y -= th; tw = nw;
    }
    // barrel vault (shala) with horns
    var sw = tw * 1.05, sh = (y - top) * .9;
    s += '<path d="M' + f(cx - sw / 2 - sw * .08) + ' ' + f(y) + 'Q' + f(cx - sw / 2 - sw * .12) + ' ' + f(y - sh * .7) + ' ' + f(cx - sw / 2 + sw * .04) + ' ' + f(y - sh * .55) + 'Q' + f(cx) + ' ' + f(y - sh * 1.25) + ' ' + f(cx + sw / 2 - sw * .04) + ' ' + f(y - sh * .55) + 'Q' + f(cx + sw / 2 + sw * .12) + ' ' + f(y - sh * .7) + ' ' + f(cx + sw / 2 + sw * .08) + ' ' + f(y) + 'Z" fill="' + col + '"/>';
    s += '<path d="M' + f(cx - sw * .28) + ' ' + f(y - 2) + 'Q' + f(cx) + ' ' + f(y - sh * .9) + ' ' + f(cx + sw * .28) + ' ' + f(y - 2) + '" fill="none" stroke="' + line + '" stroke-width="' + f(w * .012) + '" opacity=".5"/>';
    // kalasams
    var kN = 5, ky = y - sh * .92;
    for (k = 0; k < kN; k++) {
      var kx = cx - sw * .34 + sw * .68 * k / (kN - 1), kh = sw * .16 * (k === 2 ? 1.15 : 1);
      var kyy = ky + Math.abs(k - 2) * sh * .12;
      s += '<path d="M' + f(kx - kh * .18) + ' ' + f(kyy) + 'q' + f(kh * .18) + ' ' + f(-kh * .45) + ' ' + f(kh * .36) + ' 0z M' + f(kx - kh * .07) + ' ' + f(kyy - kh * .2) + 'L' + f(kx) + ' ' + f(kyy - kh * .9) + 'L' + f(kx + kh * .07) + ' ' + f(kyy - kh * .2) + 'Z" fill="' + (opts.kalasam || line) + '"/>';
    }
    return '<g>' + s + '</g>';
  };

  /* mandapam colonnade: plinth, pillars with brackets, flat roof with parapet of little shrines */
  A.colonnade = function (x0, x1, baseY, h, col, line, rnd) {
    var s = '', span = 64 + (h / 260) * 30;
    s += '<rect x="' + x0 + '" y="' + f(baseY - h * .12) + '" width="' + (x1 - x0) + '" height="' + f(h * .12) + '" fill="' + col + '"/>';
    s += '<rect x="' + x0 + '" y="' + f(baseY - h * .86) + '" width="' + (x1 - x0) + '" height="' + f(h * .74) + '" fill="' + line + '" opacity=".28"/>';
    for (var x = x0 + span / 2; x < x1; x += span) {
      var pw = span * .22;
      s += '<rect x="' + f(x - pw / 2) + '" y="' + f(baseY - h * .86) + '" width="' + f(pw) + '" height="' + f(h * .74) + '" fill="' + col + '"/>';
      // pillar bands and bracket (pothigai)
      s += '<rect x="' + f(x - pw / 2 - 2) + '" y="' + f(baseY - h * .5) + '" width="' + f(pw + 4) + '" height="' + f(h * .05) + '" fill="' + line + '" opacity=".4"/>';
      s += '<path d="M' + f(x - pw * 1.2) + ' ' + f(baseY - h * .86) + 'q' + f(pw * .3) + ' ' + f(h * .07) + ' ' + f(pw * 1.2) + ' ' + f(h * .07) + 'q' + f(pw * .9) + ' 0 ' + f(pw * 1.2) + ' ' + f(-h * .07) + 'Z" fill="' + col + '"/>';
      // arch between pillars
      s += '<path d="M' + f(x + pw / 2) + ' ' + f(baseY - h * .62) + 'Q' + f(x + span / 2) + ' ' + f(baseY - h * .86) + ' ' + f(x + span - pw / 2) + ' ' + f(baseY - h * .62) + '" stroke="' + col + '" stroke-width="' + f(h * .035) + '" fill="none"/>';
    }
    s += '<rect x="' + (x0 - 6) + '" y="' + f(baseY - h * .95) + '" width="' + (x1 - x0 + 12) + '" height="' + f(h * .1) + '" fill="' + col + '"/>';
    s += '<rect x="' + (x0 - 6) + '" y="' + f(baseY - h * .955) + '" width="' + (x1 - x0 + 12) + '" height="' + f(h * .02) + '" fill="' + line + '" opacity=".5"/>';
    for (x = x0 + 20; x < x1 - 10; x += 46) {
      s += '<path d="M' + f(x - 9) + ' ' + f(baseY - h * .95) + 'v-' + f(h * .07) + 'q9 -' + f(h * .07) + ' 18 0v' + f(h * .07) + 'Z" fill="' + col + '"/>';
    }
    return '<g>' + s + '</g>';
  };

  /* deepa stambha — stone lamp pillar */
  A.stambha = function (x, baseY, h, col, line) {
    var s = '<path d="M' + f(x - h * .09) + ' ' + baseY + 'h' + f(h * .18) + 'l-' + f(h * .03) + ' -' + f(h * .08) + 'h-' + f(h * .12) + 'Z" fill="' + col + '"/>';
    s += '<rect x="' + f(x - h * .035) + '" y="' + f(baseY - h * .9) + '" width="' + f(h * .07) + '" height="' + f(h * .83) + '" fill="' + col + '"/>';
    for (var i = 0; i < 9; i++) {
      var y = baseY - h * (.18 + i * .085), r = h * (.1 - i * .006);
      s += '<path d="M' + f(x - r) + ' ' + f(y) + 'q' + f(r) + ' ' + f(-r * .5) + ' ' + f(r * 2) + ' 0q-' + f(r) + ' ' + f(r * .25) + ' -' + f(r * 2) + ' 0Z" fill="' + col + '" stroke="' + line + '" stroke-opacity=".35" stroke-width="1"/>';
    }
    s += '<path d="M' + f(x - h * .05) + ' ' + f(baseY - h * .9) + 'q' + f(h * .05) + ' -' + f(h * .12) + ' ' + f(h * .1) + ' 0Z" fill="' + col + '"/>';
    return '<g>' + s + '</g>';
  };

  /* banana plant with hanging jasmine + marigold strings (full colour, like the envelope) */
  A.banana = function (x, baseY, h, rnd, flip, sw) {
    var dir = flip ? -1 : 1, s = '';
    s += '<path d="M' + f(x - 13) + ' ' + baseY + 'C' + f(x - 12) + ' ' + f(baseY - h * .4) + ' ' + f(x - 8) + ' ' + f(baseY - h * .55) + ' ' + f(x - 6) + ' ' + f(baseY - h * .62) + 'L' + f(x + 6) + ' ' + f(baseY - h * .62) + 'C' + f(x + 8) + ' ' + f(baseY - h * .55) + ' ' + f(x + 12) + ' ' + f(baseY - h * .4) + ' ' + f(x + 13) + ' ' + baseY + 'Z" fill="#97511D" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<path d="M' + f(x - 4) + ' ' + baseY + 'Q' + f(x - 2) + ' ' + f(baseY - h * .3) + ' ' + f(x - 1) + ' ' + f(baseY - h * .6) + 'M' + f(x + 6) + ' ' + baseY + 'Q' + f(x + 5) + ' ' + f(baseY - h * .3) + ' ' + f(x + 3) + ' ' + f(baseY - h * .58) + '" stroke="#683417" stroke-width="1.3" fill="none" opacity=".7"/>';
    var leaves = [[-.95, .5], [-.55, .62], [-.15, .7], [.3, .62], [.75, .55], [1.1, .45]];
    var garl = '';
    leaves.forEach(function (lv, i) {
      var a = (lv[0] * dir) - Math.PI / 2, L = h * lv[1];
      var ox = x, oy = baseY - h * .6;
      var ex = ox + Math.cos(a) * L, ey = oy + Math.sin(a) * L + L * .35 * Math.abs(Math.cos(a));
      var mx = ox + Math.cos(a) * L * .5, my = oy + Math.sin(a) * L * .5 - L * .05;
      var pts = []; for (var k = 0; k <= 10; k++) { var u = k / 10; pts.push([(1 - u) * (1 - u) * ox + 2 * (1 - u) * u * mx + u * u * ex, (1 - u) * (1 - u) * oy + 2 * (1 - u) * u * my + u * u * ey]); }
      var wmax = h * .1;
      var ribbonPts = pts.slice(1);
      var widths = ribbonPts.map(function (_, k) { var u = (k + 1) / 10; return Math.sin(Math.PI * Math.min(1, u * 1.08)) * wmax; });
      // leaf blade
      var Lp = [], Rp = [];
      ribbonPts.forEach(function (p, k) {
        var q = ribbonPts[Math.max(0, k - 1)], r2 = ribbonPts[Math.min(ribbonPts.length - 1, k + 1)];
        var dx = r2[0] - q[0], dy = r2[1] - q[1], dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl;
        Lp.push([p[0] + nx * widths[k], p[1] + ny * widths[k]]); Rp.push([p[0] - nx * widths[k] * .8, p[1] - ny * widths[k] * .8]);
      });
      var d = 'M' + f(pts[1][0]) + ' ' + f(pts[1][1]) + A.smooth(Lp, false).replace(/^M/, 'L') + A.smooth(Rp.reverse(), false).replace(/^M/, 'L') + 'Z';
      s += '<path d="' + d + '" fill="url(#gBanana)" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/>';
      s += '<path d="' + A.smooth(pts, false) + '" stroke="#C29663" stroke-width="2" fill="none" opacity=".8"/>';
      // tears in the blade
      var tears = '';
      for (k = 2; k < ribbonPts.length - 1; k += 1 + (rnd() < .5 ? 1 : 0)) {
        var p = ribbonPts[k], lp = Lp[k] || p;
        tears += 'M' + f(p[0]) + ' ' + f(p[1]) + 'L' + f(lp[0]) + ' ' + f(lp[1]);
      }
      s += '<path d="' + tears + '" stroke="#683417" stroke-width="1.1" opacity=".55" fill="none"/>';
      // garland string from this leaf
      if (sw && i % 2 === 1) {
        var gx = pts[6][0], gy = pts[6][1] + 4, gl = h * (.28 + rnd() * .14);
        garl += A.garland(gx, gy, gl, rnd);
      }
    });
    return '<g>' + s + '<g class="sway">' + garl + '</g></g>';
  };

  /* jasmine string with marigold balls and a rose bunch at the end */
  A.garland = function (x, y, len, rnd) {
    var s = '<line x1="' + f(x) + '" y1="' + f(y) + '" x2="' + f(x) + '" y2="' + f(y + len) + '" stroke="#683417" stroke-width="1"/>';
    for (var t = 0; t < len - 12; t += 6.5) {
      var yy = y + t;
      if (t % 39 < 6.5 && t > 10) {
        s += '<circle cx="' + f(x) + '" cy="' + f(yy) + '" r="5.6" fill="#B47838" stroke="#7F411C" stroke-width=".8"/><circle cx="' + f(x - 1.5) + '" cy="' + f(yy - 1.5) + '" r="2.2" fill="#C29663"/>';
      } else {
        s += '<ellipse cx="' + f(x) + '" cy="' + f(yy) + '" rx="3.4" ry="3.1" fill="#E0BE88" stroke="#B47838" stroke-width=".6"/>';
      }
    }
    var ey = y + len;
    s += '<path d="M' + f(x - 8) + ' ' + f(ey - 6) + 'q8 -8 16 0q2 12 -8 16q-10 -4 -8 -16Z" fill="#6A2410" stroke="#4A1A0C" stroke-width="1"/>';
    s += '<path d="M' + f(x - 4) + ' ' + f(ey - 3) + 'q4 -4 8 0" stroke="#7D2F13" stroke-width="1.4" fill="none"/>';
    return s;
  };

  /* tall brass kuthuvilakku with three live flames */
  A.lamp = function (x, baseY, h, id) {
    var s = '', w = h * .2;
    s += '<ellipse cx="' + f(x) + '" cy="' + f(baseY - 3) + '" rx="' + f(w * .75) + '" ry="' + f(w * .16) + '" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="1.3"/>';
    s += '<path d="M' + f(x - w * .7) + ' ' + f(baseY - 4) + 'Q' + f(x) + ' ' + f(baseY - h * .14) + ' ' + f(x + w * .7) + ' ' + f(baseY - 4) + 'Z" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="1.3"/>';
    s += '<rect x="' + f(x - w * .07) + '" y="' + f(baseY - h * .84) + '" width="' + f(w * .14) + '" height="' + f(h * .74) + '" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="1.2"/>';
    [.2, .32, .46, .6, .72].forEach(function (k, i) {
      var r = w * (i % 2 ? .16 : .22);
      s += '<ellipse cx="' + f(x) + '" cy="' + f(baseY - h * k) + '" rx="' + f(r) + '" ry="' + f(r * .55) + '" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="1.1"/>';
    });
    // the dish
    var dy = baseY - h * .84;
    s += '<path d="M' + f(x - w * .75) + ' ' + f(dy) + 'Q' + f(x) + ' ' + f(dy + w * .5) + ' ' + f(x + w * .75) + ' ' + f(dy) + 'Z" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="1.3"/>';
    s += '<path d="M' + f(x - w * .12) + ' ' + f(dy) + 'Q' + f(x) + ' ' + f(dy - h * .12) + ' ' + f(x + w * .12) + ' ' + f(dy) + 'Z" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="1.1"/>';
    s += '<path d="M' + f(x) + ' ' + f(dy - h * .12) + 'q' + f(-w * .12) + ' ' + f(-h * .05) + ' 0 ' + f(-h * .1) + 'q' + f(w * .12) + ' ' + f(h * .05) + ' 0 ' + f(h * .1) + 'Z" fill="url(#gBrass)" stroke="' + INK + '" stroke-width="1"/>';
    // flames
    [-.6, 0, .6].forEach(function (k, i) {
      var fx = x + w * k, fy = dy - 2, fh = h * .085;
      s += '<g class="flame" style="transform-origin:' + f(fx) + 'px ' + f(fy) + 'px;animation-delay:' + (-i * .37) + 's">' +
        '<circle cx="' + f(fx) + '" cy="' + f(fy - fh * .5) + '" r="' + f(fh * 1.6) + '" fill="url(#gGlow)"/>' +
        '<path d="M' + f(fx) + ' ' + f(fy - fh) + 'Q' + f(fx + fh * .38) + ' ' + f(fy - fh * .35) + ' ' + f(fx) + ' ' + f(fy) + 'Q' + f(fx - fh * .38) + ' ' + f(fy - fh * .35) + ' ' + f(fx) + ' ' + f(fy - fh) + 'Z" fill="url(#gFlame)"/></g>';
    });
    return '<g' + (id ? ' id="' + id + '"' : '') + '>' + s + '</g>';
  };

  /* kolam drawn on the sand (seen low, so squashed) */
  A.kolam = function (cx, cy, r, op) {
    var s = '', rows = 5;
    for (var i = -2; i <= 2; i++) for (var j = -2; j <= 2; j++) {
      if (Math.abs(i) + Math.abs(j) > 3) continue;
      s += '<circle cx="' + f(cx + i * r * .38) + '" cy="' + f(cy + j * r * .38 * .28) + '" r="1.6"/>';
    }
    var loops = '';
    for (var k = 0; k < 8; k++) {
      var a = k / 8 * Math.PI * 2, ax = cx + Math.cos(a) * r * .55, ay = cy + Math.sin(a) * r * .55 * .28;
      loops += 'M' + f(cx) + ' ' + f(cy) + 'Q' + f(cx + Math.cos(a + .6) * r) + ' ' + f(cy + Math.sin(a + .6) * r * .28) + ' ' + f(ax) + ' ' + f(ay) + 'Q' + f(cx + Math.cos(a - .6) * r) + ' ' + f(cy + Math.sin(a - .6) * r * .28) + ' ' + f(cx) + ' ' + f(cy);
    }
    return '<g opacity="' + (op || .75) + '" fill="#E0BE88"><path d="' + loops + '" fill="none" stroke="#E0BE88" stroke-width="1.6"/>' +
      '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(r * 1.08) + '" ry="' + f(r * 1.08 * .28) + '" fill="none" stroke="#E0BE88" stroke-width="1.4" stroke-dasharray="3 5"/>' + s + '</g>';
  };

  /* carved stone pillar in the near foreground: dark, close, passing by like a camera wipe */
  A.fgPillar = function (x, baseY, h) {
    var w = h * .075, s = '';
    s += '<defs><linearGradient id="gPil' + Math.round(x) + '" x1="0" x2="1"><stop offset="0" stop-color="#2E170B"/><stop offset=".35" stop-color="#512A16"/><stop offset=".55" stop-color="#3B2113"/><stop offset="1" stop-color="#24110A"/></linearGradient></defs>';
    var gid = 'url(#gPil' + Math.round(x) + ')';
    s += '<rect x="' + f(x - w / 2) + '" y="' + f(baseY - h) + '" width="' + f(w) + '" height="' + f(h + 300) + '" fill="' + gid + '"/>';
    for (var i = 0; i < 4; i++) {
      var y = baseY - h + h * (.1 + i * .24), bh = h * .06;
      s += '<rect x="' + f(x - w / 2 - 8) + '" y="' + f(y) + '" width="' + f(w + 16) + '" height="' + f(bh) + '" fill="' + gid + '"/>';
      s += '<path d="M' + f(x - w / 2 - 8) + ' ' + f(y + bh * .35) + 'h' + f(w + 16) + 'M' + f(x - w / 2 - 8) + ' ' + f(y + bh * .7) + 'h' + f(w + 16) + '" stroke="#7F411C" stroke-width="1.5" opacity=".6"/>';
      // lotus band carved between the mouldings
      var lb = '';
      for (var k = 0; k < 5; k++) { var lx = x - w / 2 + w * (k + .5) / 5, ly = y + bh + h * .05; lb += 'M' + f(lx) + ' ' + f(ly) + 'q' + f(-w * .08) + ' ' + f(-h * .03) + ' 0 ' + f(-h * .045) + 'q' + f(w * .08) + ' ' + f(h * .015) + ' 0 ' + f(h * .045) + 'Z'; }
      s += '<path d="' + lb + '" fill="#683417" opacity=".8"/>';
    }
    // bracket capital at the top
    s += '<path d="M' + f(x - w * 1.3) + ' ' + f(baseY - h) + 'q' + f(w * .3) + ' ' + f(h * .05) + ' ' + f(w * .8) + ' ' + f(h * .06) + 'h' + f(w) + 'q' + f(w * .5) + ' -' + f(h * .01) + ' ' + f(w * .8) + ' -' + f(h * .06) + 'Z" fill="' + gid + '"/>';
    return '<g>' + s + '</g>';
  };
})();
