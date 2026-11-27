/* BATIK — the painting kit.
   The look of a Rajasthani wax-resist batik: cream cotton with indigo & madder crackle,
   an indigo night cut by scalloped jharokha arches, a madder-red ground, figures in
   flat dyed colour with bold black outlines and rows of white resist-dots.
   Every builder returns an SVG string. */
(function () {
  'use strict';
  var B = (window.BATIK = {});
  var f = function (n) { return Math.round(n * 10) / 10; };
  B.f = f;
  B.INK = '#1A0B07';
  B.C = { cream: '#EFE5CD', indigo: '#1C2347', indigo2: '#2B3566', red: '#B0261E', red2: '#7E1612', madder: '#C2412C', mustard: '#DDA033', ochre: '#E7B44A', green: '#6A8A38', green2: '#4C6828', pink: '#E59AB0', teal: '#3F9C93', white: '#FBF4E2', skin: '#E9BC4C', skin2: '#C9952E' };
  var C = B.C, INK = B.INK;

  B.rng = function (seed) {
    var s = seed >>> 0;
    return function () { s += 0x6D2B79F5; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  B.smooth = function (pts, closed) {
    var n = pts.length, d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    for (var i = 0; i < n - (closed ? 0 : 1); i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      if (!closed) { if (i === 0) p0 = p1; if (i + 2 >= n) p3 = p2; }
      d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
    }
    return d + (closed ? 'Z' : '');
  };
  B.ribbon = function (pts, w0, w1, tipRound) {
    var L = [], R = [], n = pts.length;
    for (var i = 0; i < n; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
      L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    }
    var d = B.smooth(L, false), r = R[n - 1];
    d += tipRound ? 'A' + f(w1 / 2) + ' ' + f(w1 / 2) + ' 0 0 1 ' + f(r[0]) + ' ' + f(r[1]) : 'L' + f(r[0]) + ' ' + f(r[1]);
    return d + B.smooth(R.slice().reverse(), false).replace(/^M[^C]*/, '') + 'Z';
  };
  /* a row of white resist dots along a path given as points */
  B.dots = function (pts, step, r, col) {
    var s = '', acc = 0;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (acc <= L) { var t = acc / L; s += '<circle cx="' + f(a[0] + (b[0] - a[0]) * t) + '" cy="' + f(a[1] + (b[1] - a[1]) * t) + '" r="' + r + '"/>'; acc += step; }
      acc -= L;
    }
    return '<g fill="' + (col || C.white) + '">' + s + '</g>';
  };

  /* ------------------------------------------------------------ dyes & patterns */
  var DYE = { '#EFE5CD': 'cream', '#1C2347': 'indigo', '#2B3566': 'indigo2', '#B0261E': 'red', '#7E1612': 'red2', '#C2412C': 'madder', '#DDA033': 'mustard',
    '#E7B44A': 'ochre', '#6A8A38': 'green', '#4C6828': 'green2', '#E59AB0': 'pink', '#3F9C93': 'teal', '#FBF4E2': 'white', '#E9BC4C': 'skin', '#6B3A1E': 'brown', '#8E97C2': 'indigo2' };
  /* swap every flat batik colour for its hand-dyed cotton texture */
  B.dye = function (svg) {
    return svg.replace(/fill="(#[0-9A-Fa-f]{6})"/g, function (m, hex) { var k = DYE[hex.toUpperCase()]; return k ? 'fill="url(#d-' + k + ')"' : m; });
  };
  B.dyeDefs = function () {
    var s = '';
    Object.keys(DYE).forEach(function (hex) { var k = DYE[hex]; if (s.indexOf('id="d-' + k + '"') >= 0) return;
      s += '<pattern id="d-' + k + '" width="420" height="420" patternUnits="userSpaceOnUse"><image href="assets/img/dye/' + k + '.webp" width="420" height="420" preserveAspectRatio="none"/></pattern>'; });
    s += '<filter id="bleed" x="-1%" y="-1%" width="102%" height="102%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation=".7" result="b"/><feComposite in="SourceGraphic" in2="b" operator="arithmetic" k1="0" k2=".5" k3=".5" k4="0"/></filter>';
    return s;
  };
  B.defs = function () { return B.dyeDefs() + B.dye(rawDefs()); };
  function rawDefs() {
    return '' +
      '<pattern id="bEle" width="160" height="160" patternUnits="userSpaceOnUse"><rect width="160" height="160" fill="#6E8E3A"/>' +
        '<ellipse cx="40" cy="44" rx="38" ry="30" fill="#55732C" opacity=".55"/><ellipse cx="118" cy="110" rx="46" ry="34" fill="#4C6828" opacity=".45"/><ellipse cx="126" cy="30" rx="22" ry="16" fill="#8AA84E" opacity=".55"/>' +
        '<ellipse cx="46" cy="128" rx="26" ry="18" fill="#88A64C" opacity=".5"/><ellipse cx="84" cy="76" rx="14" ry="10" fill="#3F5A22" opacity=".35"/><ellipse cx="150" cy="150" rx="18" ry="12" fill="#55732C" opacity=".5"/></pattern>' +
      '<pattern id="bEleFar" width="160" height="160" patternUnits="userSpaceOnUse"><rect width="160" height="160" fill="#4C6828"/><ellipse cx="50" cy="60" rx="40" ry="30" fill="#3A5220" opacity=".55"/><ellipse cx="120" cy="120" rx="30" ry="22" fill="#5E7E34" opacity=".5"/></pattern>' +
      '<pattern id="bGrid" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="' + C.red + '"/>' +
        '<rect x="4" y="4" width="26" height="26" fill="' + C.mustard + '" stroke="' + INK + '" stroke-width="1.4"/><circle cx="17" cy="17" r="6" fill="' + C.white + '"/><circle cx="17" cy="17" r="2.4" fill="' + C.red + '"/></pattern>' +
      '<pattern id="bChevron" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="36" height="36" fill="' + C.red2 + '"/>' +
        '<rect y="0" width="36" height="8" fill="' + INK + '"/><rect y="12" width="36" height="5" fill="' + C.white + '"/><rect y="21" width="36" height="9" fill="' + C.red + '"/>' +
        '<g fill="' + C.white + '"><circle cx="6" cy="33" r="2"/><circle cx="18" cy="33" r="2"/><circle cx="30" cy="33" r="2"/></g></pattern>' +
      '<pattern id="bFrockR" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="' + C.red + '"/><circle cx="11" cy="11" r="1.8" fill="' + C.ochre + '"/></pattern>' +
      '<pattern id="bFrockT" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="' + C.teal + '"/><circle cx="11" cy="11" r="1.8" fill="' + C.white + '"/></pattern>' +
      '<pattern id="bFrockM" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="' + C.mustard + '"/><path d="M0 11h22" stroke="' + C.red2 + '" stroke-width="1.5"/></pattern>' +
      '<pattern id="bFrockI" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="' + C.indigo2 + '"/><circle cx="11" cy="11" r="1.8" fill="' + C.ochre + '"/></pattern>' +
      '<pattern id="bSkirt" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="' + C.pink + '"/><path d="M0 15h30" stroke="#C9708A" stroke-width="2"/><circle cx="15" cy="7" r="2" fill="' + C.white + '"/></pattern>' +
      '<pattern id="bBorder" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="' + C.indigo + '"/>' +
        '<path d="M0 40L20 12L40 40Z" fill="' + C.mustard + '" stroke="' + INK + '" stroke-width="1.5"/><circle cx="20" cy="31" r="4" fill="' + C.red + '"/><circle cx="20" cy="5" r="2.4" fill="' + C.white + '"/></pattern>' +
      '<linearGradient id="bRedBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B5291F"/><stop offset="1" stop-color="#8C1A14"/></linearGradient>' +
      '<radialGradient id="bShadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2A0806" stop-opacity=".45"/><stop offset="1" stop-color="#2A0806" stop-opacity="0"/></radialGradient>';
  };

  /* ------------------------------------------------------------ the arcade */
  /* scalloped (cusped) Mughal arch opening, as in the reference painting */
  B.archPath = function (cx, yb, w, ys, ya) {
    var K = 4, left = [], i, d;
    for (i = 0; i <= K; i++) {
      var t = i / K;
      left.push([cx - w / 2 + (w / 2) * Math.pow(t, 1.35), ys - (ys - ya) * Math.sin(t * Math.PI / 2) * (t < 1 ? 1 : 1)]);
    }
    d = 'M' + f(cx - w / 2) + ' ' + f(yb) + 'L' + f(cx - w / 2) + ' ' + f(ys);
    for (i = 1; i <= K; i++) {
      var a = left[i - 1], b = left[i], r = Math.hypot(b[0] - a[0], b[1] - a[1]) * .58;
      d += 'A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(b[0]) + ' ' + f(b[1]);
    }
    d += 'l0 -' + f(w * .035);   // little finial point at the apex
    d += 'l0 ' + f(w * .035);
    for (i = K - 1; i >= 0; i--) {
      var a2 = left[i + 1], b2 = left[i], r2 = Math.hypot(b2[0] - a2[0], b2[1] - a2[1]) * .58;
      d += 'A' + f(r2) + ' ' + f(r2) + ' 0 0 1 ' + f(2 * cx - b2[0]) + ' ' + f(b2[1]);
    }
    d += 'L' + f(cx + w / 2) + ' ' + f(yb) + 'Z';
    return d;
  };

  B.arcade = function (x0, x1, top, groundTop, opts) {
    var s = '', rnd = B.rng(opts.seed || 3), span = opts.span, aw = opts.aw;
    var holes = '';
    var motifs = '';
    var k = 0;
    for (var cx = Math.floor((x0 - span) / span) * span + span / 2; cx < x1 + span; cx += span) {
      if (opts.skip && opts.skip(cx)) { k++; continue; }
      holes += B.archPath(cx, groundTop + 2, aw, opts.ys, opts.ya);
      // a dyed motif framed by each arch
      var m = ((Math.round(cx / span) % 4) + 4) % 4;
      motifs += '<g opacity=".55">' + B.palace(cx + (m % 2 ? 120 : -120), groundTop, 420, 420, '#8E97C2') + '</g>';
      if (m === 0) motifs += B.tree(cx, groundTop, opts.ys * .9 - groundTop * .2, rnd);
      else if (m === 1) motifs += B.peacocks(cx, groundTop, rnd);
      else if (m === 2) motifs += B.sun(cx, (opts.ys + opts.ya) / 2 + 40, 70) + B.lotusPond(cx, groundTop, aw);
      else motifs += B.tree(cx - aw * .22, groundTop, opts.ys * .75, rnd, true) + B.tree(cx + aw * .24, groundTop, opts.ys * .62, rnd, true);
      k++;
    }
    s += '<g opacity=".72">' + motifs + '</g>';
    s += '<path fill-rule="evenodd" d="M' + x0 + ' ' + top + 'H' + x1 + 'V' + (groundTop + 2) + 'H' + x0 + 'Z' + holes + '" fill="' + C.indigo + '"/>';
    // piers: lotus medallions, dotted vines and a lamp niche on every pier
    var pier = '';
    for (var px = Math.floor((x0 - span) / span) * span; px < x1 + span; px += span) {
      var ph = groundTop - opts.ya;
      pier += B.medallion(px, opts.ya + ph * .18, 44) + B.medallion(px, opts.ya + ph * .62, 34);
      pier += '<path d="M' + (px - 70) + ' ' + f(opts.ya - 40) + 'V' + (groundTop - 30) + 'M' + (px + 70) + ' ' + f(opts.ya - 40) + 'V' + (groundTop - 30) + '" stroke="' + C.mustard + '" stroke-width="3"/>';
      pier += B.dots([[px - 58, opts.ya - 30], [px - 58, groundTop - 40]], 16, 3) + B.dots([[px + 58, opts.ya - 30], [px + 58, groundTop - 40]], 16, 3);
      pier += B.niche(px, groundTop - 40, 70, 130);
    }
    s += pier;
    // toran garland under every arch crown
    var tor = '';
    for (cx = Math.floor((x0 - span) / span) * span + span / 2; cx < x1 + span; cx += span) tor += B.toran(cx, opts.ys - 40, aw * .7);
    s += tor;
    // kangura parapet along the top of the arcade
    var kg = '', ky = opts.ya - 120;
    s += '<rect x="' + x0 + '" y="' + (ky - 10) + '" width="' + (x1 - x0) + '" height="26" fill="' + C.mustard + '" stroke="' + INK + '" stroke-width="3"/>';
    for (var kx = x0; kx < x1; kx += 46) kg += 'M' + kx + ' ' + (ky - 10) + 'v-22q11 -16 23 0q11 -16 23 0v22Z';
    s += '<path d="' + kg + '" fill="' + C.red + '" stroke="' + INK + '" stroke-width="2.4"/>';
    s += B.dots([[x0, ky + 3], [x1, ky + 3]], 23, 3.4);
    // a resist-dot border tracing every arch
    s += '<path fill="none" stroke="' + C.ochre + '" stroke-width="5" d="' + holes.replace(/M[^L]*L/g, function (m) { return m; }) + '" opacity=".9"/>';
    s += '<path fill="none" stroke="' + C.white + '" stroke-width="2.6" stroke-dasharray="0.1 12" stroke-linecap="round" d="' + holes + '" transform="translate(0 -9)" opacity=".75"/>';
    return s;
  };

  /* ------------------------------------------------------------ dyed motifs */
  B.tree = function (x, baseY, h, rnd, small) {
    h = Math.abs(h); var s = '', tw = small ? 10 : 16;
    var top = baseY - h;
    s += '<path d="M' + f(x - tw) + ' ' + baseY + 'C' + f(x - tw * .7) + ' ' + f(baseY - h * .4) + ' ' + f(x - tw * .5) + ' ' + f(baseY - h * .6) + ' ' + f(x - 3) + ' ' + f(top + h * .3) + 'L' + f(x + 3) + ' ' + f(top + h * .3) + 'C' + f(x + tw * .5) + ' ' + f(baseY - h * .6) + ' ' + f(x + tw * .7) + ' ' + f(baseY - h * .4) + ' ' + f(x + tw) + ' ' + baseY + 'Z" fill="#6B3A1E" stroke="' + INK + '" stroke-width="2"/>';
    var n = small ? 7 : 11, R = h * (small ? .2 : .17);
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (i / (n - 1) - .5) * Math.PI * 1.3, rr = h * (small ? .22 : .28) * (.7 + rnd() * .3);
      var cx = x + Math.cos(a) * rr * 1.25, cy = top + h * .28 + Math.sin(a) * rr;
      var col = [C.green, C.teal, C.green2][i % 3];
      s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(R) + '" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>';
      // leaf veins inside each crown ball
      s += '<path d="M' + f(cx) + ' ' + f(cy + R * .8) + 'V' + f(cy - R * .8) + 'M' + f(cx) + ' ' + f(cy) + 'l' + f(R * .5) + ' -' + f(R * .45) + 'M' + f(cx) + ' ' + f(cy + R * .3) + 'l-' + f(R * .5) + ' -' + f(R * .45) + '" stroke="' + C.white + '" stroke-width="1.6" fill="none" opacity=".7"/>';
      if (rnd() < .4) s += '<circle cx="' + f(cx + R * .4) + '" cy="' + f(cy + R * .5) + '" r="' + f(R * .2) + '" fill="' + C.red + '" stroke="' + INK + '" stroke-width="1.2"/>';
    }
    return '<g>' + s + '</g>';
  };

  B.peacock = function (x, y, s, flip) {
    var k = flip ? -1 : 1, g = '';
    g += '<path d="M' + x + ' ' + y + 'c' + (-k * 60 * s) + ' ' + (10 * s) + ' ' + (-k * 150 * s) + ' ' + (40 * s) + ' ' + (-k * 190 * s) + ' ' + (80 * s) + 'c' + (k * 60 * s) + ' ' + (-10 * s) + ' ' + (k * 130 * s) + ' ' + (-30 * s) + ' ' + (k * 190 * s) + ' ' + (-80 * s) + 'Z" fill="' + C.teal + '" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < 4; i++) g += '<circle cx="' + f(x - k * (60 + i * 36) * s) + '" cy="' + f(y + (16 + i * 15) * s) + '" r="' + f(7 * s) + '" fill="' + C.indigo2 + '" stroke="' + C.ochre + '" stroke-width="2.5"/>';
    g += '<path d="M' + f(x - k * 14 * s) + ' ' + f(y + 6 * s) + 'c' + (k * 4 * s) + ' ' + (-30 * s) + ' ' + (k * 30 * s) + ' ' + (-30 * s) + ' ' + (k * 34 * s) + ' ' + (-6 * s) + 'c' + (k * 2 * s) + ' ' + (14 * s) + ' ' + (-k * 14 * s) + ' ' + (20 * s) + ' ' + (-k * 34 * s) + ' ' + (6 * s) + 'Z" fill="' + C.indigo2 + '" stroke="' + INK + '" stroke-width="2"/>';
    g += '<path d="M' + f(x + k * 12 * s) + ' ' + f(y - 18 * s) + 'c' + (k * 4 * s) + ' ' + (-20 * s) + ' ' + (k * 2 * s) + ' ' + (-40 * s) + ' ' + (k * 10 * s) + ' ' + (-46 * s) + 'c' + (k * 10 * s) + ' ' + (-4 * s) + ' ' + (k * 14 * s) + ' ' + (6 * s) + ' ' + (k * 8 * s) + ' ' + (10 * s) + 'c' + (-k * 4 * s) + ' ' + (10 * s) + ' ' + (-k * 6 * s) + ' ' + (24 * s) + ' ' + (-k * 4 * s) + ' ' + (36 * s) + 'Z" fill="' + C.indigo2 + '" stroke="' + INK + '" stroke-width="2"/>';
    g += '<circle cx="' + f(x + k * 23 * s) + '" cy="' + f(y - 60 * s) + '" r="' + f(2 * s) + '" fill="' + C.white + '"/><path d="M' + f(x + k * 28 * s) + ' ' + f(y - 58 * s) + 'l' + (k * 8 * s) + ' ' + (3 * s) + 'l' + (-k * 8 * s) + ' ' + (2 * s) + '" fill="' + C.ochre + '"/>';
    g += '<path d="M' + f(x + k * 16 * s) + ' ' + f(y - 66 * s) + 'l' + (-k * 4 * s) + ' ' + (-10 * s) + 'M' + f(x + k * 20 * s) + ' ' + f(y - 66 * s) + 'l0 ' + (-12 * s) + '" stroke="' + INK + '" stroke-width="1.6"/>';
    g += '<path d="M' + f(x - k * 4 * s) + ' ' + f(y + 18 * s) + 'v' + (26 * s) + 'M' + f(x + k * 8 * s) + ' ' + f(y + 18 * s) + 'v' + (26 * s) + '" stroke="' + INK + '" stroke-width="2.4"/>';
    return g;
  };
  B.peacocks = function (cx, groundTop) {
    return B.peacock(cx - 150, groundTop - 50, 1.2, false) + B.peacock(cx + 150, groundTop - 50, 1.2, true);
  };
  B.sun = function (x, y, r) {
    var s = '';
    for (var i = 0; i < 16; i++) {
      var a = i / 16 * Math.PI * 2, b = a + Math.PI / 16;
      s += '<path d="M' + f(x + Math.cos(a - .12) * r) + ' ' + f(y + Math.sin(a - .12) * r) + 'L' + f(x + Math.cos(a) * r * 1.55) + ' ' + f(y + Math.sin(a) * r * 1.55) + 'L' + f(x + Math.cos(a + .12) * r) + ' ' + f(y + Math.sin(a + .12) * r) + 'Z" fill="' + (i % 2 ? C.red : C.mustard) + '" stroke="' + INK + '" stroke-width="1.6"/>';
    }
    s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + C.ochre + '" stroke="' + INK + '" stroke-width="2.2"/><circle cx="' + x + '" cy="' + y + '" r="' + f(r * .62) + '" fill="' + C.madder + '" stroke="' + INK + '" stroke-width="1.6"/>';
    s += B.dots(Array.from({ length: 33 }, function (_, i) { var a = i / 32 * Math.PI * 2; return [x + Math.cos(a) * r * .82, y + Math.sin(a) * r * .82]; }), 12, 2.6);
    return s;
  };
  B.lotusPond = function (cx, groundTop, w) {
    var s = '<path d="M' + f(cx - w * .4) + ' ' + f(groundTop - 6) + 'q' + f(w * .4) + ' -46 ' + f(w * .8) + ' 0Z" fill="' + C.indigo2 + '" stroke="' + INK + '" stroke-width="2"/>';
    [-.24, 0, .24].forEach(function (k, i) {
      var x = cx + w * k, y = groundTop - 20 - (i === 1 ? 10 : 0);
      s += '<path d="M' + x + ' ' + y + 'c-26 -6 -34 -30 -24 -44c8 10 18 16 24 26c6 -10 16 -16 24 -26c10 14 2 38 -24 44Z" fill="' + C.pink + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + x + ' ' + y + 'c-6 -14 -4 -34 0 -46c4 12 6 32 0 46Z" fill="#F4C2CF" stroke="' + INK + '" stroke-width="1.6"/>';
    });
    return s;
  };


  B.medallion = function (x, y, r) {
    var s = '';
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * Math.PI * 2;
      s += '<path d="M' + x + ' ' + y + 'Q' + f(x + Math.cos(a - .28) * r * .9) + ' ' + f(y + Math.sin(a - .28) * r * .9) + ' ' + f(x + Math.cos(a) * r) + ' ' + f(y + Math.sin(a) * r) + 'Q' + f(x + Math.cos(a + .28) * r * .9) + ' ' + f(y + Math.sin(a + .28) * r * .9) + ' ' + x + ' ' + y + 'Z" fill="' + (i % 2 ? C.red : C.mustard) + '" stroke="' + INK + '" stroke-width="1.8"/>';
    }
    s += '<circle cx="' + x + '" cy="' + y + '" r="' + f(r * .34) + '" fill="' + C.green + '" stroke="' + INK + '" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="' + f(r * .12) + '" fill="' + C.white + '"/>';
    return s;
  };
  B.niche = function (x, baseY, w, h) {
    var s = '<path d="' + B.archPath(x, baseY, w, baseY - h * .55, baseY - h) + '" fill="#0E1230" stroke="' + C.mustard + '" stroke-width="4"/>';
    s += '<path d="M' + (x - 16) + ' ' + (baseY - 8) + 'q16 12 32 0z" fill="#9A4A22" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<circle cx="' + x + '" cy="' + (baseY - 24) + '" r="22" fill="#FFB84A" opacity=".25"/><path d="M' + x + ' ' + (baseY - 38) + 'q7 12 0 26q-7 -14 0 -26z" fill="' + C.ochre + '" stroke="#C2412C" stroke-width="1.4"/>';
    return s;
  };
  B.toran = function (cx, y, w) {
    var s = '<path d="M' + f(cx - w / 2) + ' ' + y + 'Q' + cx + ' ' + (y + 46) + ' ' + f(cx + w / 2) + ' ' + y + '" stroke="' + INK + '" stroke-width="2.4" fill="none"/>';
    for (var i = 0; i <= 16; i++) {
      var t = i / 16, x = cx - w / 2 + w * t, yy = y + 46 * 4 * t * (1 - t) * .5 * 2 * .5 + 2;
      yy = y + (1 - Math.pow(2 * t - 1, 2)) * 23;
      if (i % 2) s += '<path d="M' + f(x) + ' ' + f(yy) + 'q-8 20 0 34q8 -14 0 -34Z" fill="' + C.green + '" stroke="' + INK + '" stroke-width="1.4"/>';
      else s += '<circle cx="' + f(x) + '" cy="' + f(yy + 6) + '" r="8" fill="' + (i % 4 ? C.mustard : '#E2722A') + '" stroke="' + INK + '" stroke-width="1.4"/><circle cx="' + f(x) + '" cy="' + f(yy + 6) + '" r="2.6" fill="' + C.red + '"/>';
    }
    return s;
  };
  B.diya = function (x, y) {
    return '<circle cx="' + x + '" cy="' + (y - 16) + '" r="24" fill="#FFC45A" opacity=".22"/>' +
      '<path d="M' + (x - 20) + ' ' + y + 'q20 16 40 0q-4 -6 -20 -6q-16 0 -20 6z" fill="#A4511F" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M' + x + ' ' + (y - 30) + 'q8 14 0 26q-8 -12 0 -26z" fill="' + C.ochre + '" stroke="#C2412C" stroke-width="1.4"/>' +
      '<circle cx="' + (x - 10) + '" cy="' + (y + 2) + '" r="1.8" fill="' + C.white + '"/><circle cx="' + x + '" cy="' + (y + 4) + '" r="1.8" fill="' + C.white + '"/><circle cx="' + (x + 10) + '" cy="' + (y + 2) + '" r="1.8" fill="' + C.white + '"/>';
  };
  B.palace = function (cx, baseY, w, h, col) {
    var s = '<rect x="' + f(cx - w / 2) + '" y="' + f(baseY - h * .6) + '" width="' + w + '" height="' + f(h * .6) + '" fill="' + col + '"/>';
    [-.38, -.13, .13, .38].forEach(function (k, i) {
      var x = cx + w * k, dw = w * (i === 1 || i === 2 ? .2 : .14), by = baseY - h * .6;
      s += '<rect x="' + f(x - dw / 2) + '" y="' + f(by - h * .12) + '" width="' + f(dw) + '" height="' + f(h * .12) + '" fill="' + col + '"/>';
      s += '<path d="M' + f(x - dw * .6) + ' ' + f(by - h * .12) + 'Q' + f(x) + ' ' + f(by - h * .4) + ' ' + f(x + dw * .6) + ' ' + f(by - h * .12) + 'Z" fill="' + col + '"/>';
    });
    for (var i = 0; i < 7; i++) s += '<path d="' + B.archPath(cx - w * .4 + i * w * .133, baseY - h * .1, w * .06, baseY - h * .3, baseY - h * .4) + '" fill="#EFE5CD" opacity=".5"/>';
    return '<g>' + s + '</g>';
  };

  /* ------------------------------------------------------------ ground & border */
  B.ground = function (x0, x1, top, bottom) {
    var s = '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="' + (bottom - top + 400) + '" fill="url(#d-red)"/>';
    s += '<rect x="' + x0 + '" y="' + (top - 3) + '" width="' + (x1 - x0) + '" height="6" fill="' + INK + '"/>';
    // resist-dot vine along the ground's top edge
    var v = '';
    for (var x = x0; x < x1; x += 4) v += (x === x0 ? 'M' : 'L') + x + ' ' + f(top + 22 + Math.sin(x / 38) * 7);
    s += '<path d="' + v + '" stroke="' + C.ochre + '" stroke-width="3" fill="none"/>';
    var lv = '';
    for (x = x0 + 19; x < x1; x += 38) { var y = top + 22 + Math.sin(x / 38) * 7, k = (Math.round(x / 38) % 2) ? -1 : 1; lv += 'M' + x + ' ' + f(y) + 'q' + (k * 8) + ' ' + (k * -14) + ' ' + (k * 18) + ' ' + (k * -10) + 'q' + (k * -6) + ' ' + (k * 10) + ' ' + (k * -18) + ' ' + (k * 10) + 'Z'; }
    s += '<path d="' + lv + '" fill="' + C.green + '" stroke="' + INK + '" stroke-width="1.2"/>';
    var dy = '';
    for (x = x0 + 90; x < x1; x += 190) dy += B.diya(x, bottom - 78);
    s += dy;
    // cloth border band at the bottom of the frame
    s += '<rect x="' + x0 + '" y="' + (bottom - 52) + '" width="' + (x1 - x0) + '" height="400" fill="url(#bBorder)"/>';
    s += '<rect x="' + x0 + '" y="' + (bottom - 56) + '" width="' + (x1 - x0) + '" height="6" fill="' + C.ochre + '" stroke="' + INK + '" stroke-width="1.5"/>';
    return s;
  };

  /* ------------------------------------------------------------ the palace gate at the journey's end */
  B.gate = function (cx, groundTop, w, h) {
    var s = '', top = groundTop - h, ow = w * .52;
    // body
    s += '<rect x="' + f(cx - w / 2) + '" y="' + f(top + h * .18) + '" width="' + f(w) + '" height="' + f(h * .82 + 4) + '" fill="' + C.madder + '" stroke="' + INK + '" stroke-width="4"/>';
    s += '<rect x="' + f(cx - w / 2) + '" y="' + f(top + h * .18) + '" width="' + f(w) + '" height="' + f(h * .82 + 4) + '" fill="url(#bGrid)" opacity=".28"/>';
    // the great cusped arch opening, glowing
    s += '<path d="' + B.archPath(cx, groundTop + 2, ow, groundTop - h * .5, groundTop - h * .74) + '" fill="#FFE9B0" stroke="' + INK + '" stroke-width="5" class="gate-hole"/>';
    s += '<path d="' + B.archPath(cx, groundTop + 2, ow + 34, groundTop - h * .5 - 8, groundTop - h * .74 - 22) + '" fill="none" stroke="' + C.ochre + '" stroke-width="12"/>';
    s += '<path d="' + B.archPath(cx, groundTop + 2, ow + 34, groundTop - h * .5 - 8, groundTop - h * .74 - 22) + '" fill="none" stroke="' + C.white + '" stroke-width="4" stroke-dasharray="0.1 14" stroke-linecap="round"/>';
    // two side niches with lamps
    [-1, 1].forEach(function (k) {
      var nx = cx + k * w * .37;
      s += '<path d="' + B.archPath(nx, top + h * .7, w * .12, top + h * .5, top + h * .43) + '" fill="' + C.indigo + '" stroke="' + INK + '" stroke-width="3"/>';
      s += '<path d="M' + f(nx) + ' ' + f(top + h * .6) + 'q8 14 0 22q-8 -8 0 -22Z" fill="' + C.ochre + '"/>';
    });
    // parapet & chhatris (domed kiosks)
    s += '<rect x="' + f(cx - w / 2 - 20) + '" y="' + f(top + h * .14) + '" width="' + f(w + 40) + '" height="' + f(h * .06) + '" fill="' + C.mustard + '" stroke="' + INK + '" stroke-width="4"/>';
    s += B.dots([[cx - w / 2 - 10, top + h * .17], [cx + w / 2 + 10, top + h * .17]], 16, 3.4);
    [-.42, -.14, .14, .42].forEach(function (k, i) {
      var x = cx + w * k, big = (i === 1 || i === 2), dw = w * (big ? .18 : .13), dh = h * (big ? .14 : .1), by = top + h * .14;
      s += '<rect x="' + f(x - dw / 2) + '" y="' + f(by - dh * .55) + '" width="' + f(dw) + '" height="' + f(dh * .55) + '" fill="' + C.madder + '" stroke="' + INK + '" stroke-width="3"/>';
      s += '<path d="M' + f(x - dw * .62) + ' ' + f(by - dh * .55) + 'Q' + f(x) + ' ' + f(by - dh * 1.75) + ' ' + f(x + dw * .62) + ' ' + f(by - dh * .55) + 'Z" fill="' + C.ochre + '" stroke="' + INK + '" stroke-width="3"/>';
      s += '<path d="M' + f(x) + ' ' + f(by - dh * 1.42) + 'v-' + f(dh * .35) + '" stroke="' + INK + '" stroke-width="4"/><circle cx="' + f(x) + '" cy="' + f(by - dh * 1.8) + '" r="' + f(dh * .08) + '" fill="' + C.red + '" stroke="' + INK + '" stroke-width="2"/>';
    });
    // toran of mango leaves & marigolds across the arch
    var tor = '', ty = groundTop - h * .5 - 30;
    for (var x = cx - ow / 2 - 20; x <= cx + ow / 2 + 20; x += 26) {
      tor += '<path d="M' + f(x) + ' ' + f(ty) + 'q-9 22 0 36q9 -14 0 -36Z" fill="' + C.green + '" stroke="' + INK + '" stroke-width="1.6"/>';
      tor += '<circle cx="' + f(x + 13) + '" cy="' + f(ty + 6) + '" r="7" fill="' + C.mustard + '" stroke="' + INK + '" stroke-width="1.5"/>';
    }
    s += '<path d="M' + f(cx - ow / 2 - 30) + ' ' + f(ty) + 'H' + f(cx + ow / 2 + 30) + '" stroke="' + INK + '" stroke-width="3"/>' + tor;
    return '<g>' + s + '</g>';
  };
})();
