/*
 * Hero image: a circular phylogeny with an alignment ring.
 * Decorative and generic by design (not tied to any dataset or paper), so it
 * never goes out of date. The tree is generated with a fixed seed and is
 * strictly bifurcating; the outer ring shows sequence columns at each tip.
 */
(() => {
  const svg = document.querySelector("[data-tree-figure]");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const el = (name, attrs = {}, parent = svg) => {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    parent.appendChild(node);
    return node;
  };

  // Seeded random numbers (mulberry32) so the image is identical on every load.
  let seed = 1729;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ---------- build a strictly bifurcating tree ---------- */
  const TIPS = 72;
  const split = (n, depth) => {
    const node = { len: depth === 0 ? 0.02 : 0.04 + rand() * 0.12 };
    if (n === 1) {
      node.len += 0.08 + rand() * 0.1;
      return node;
    }
    // uneven splits look like real trees
    const left = Math.max(1, Math.min(n - 1, Math.round(n * (0.25 + rand() * 0.5))));
    node.children = [split(left, depth + 1), split(n - left, depth + 1)];
    return node;
  };
  const root = split(TIPS, 0);

  // Depths and tip order.
  const tips = [];
  let maxDepth = 0;
  const walk = (node, parentDepth) => {
    node.depth = parentDepth + node.len;
    if (node.children) node.children.forEach((c) => walk(c, node.depth));
    else {
      tips.push(node);
      maxDepth = Math.max(maxDepth, node.depth);
    }
  };
  walk(root, 0);

  // Ultrametric-ish: stretch tips to the rim, as in a time tree.
  tips.forEach((t) => (t.depth = maxDepth));

  /* ---------- radial layout ---------- */
  const C = 300; // centre
  const R0 = 18; // root radius
  const R1 = 196; // tip radius
  const GAP = 0.18; // radians left open at the top, gives the circle a start and end
  const start = -Math.PI / 2 + GAP / 2;
  const span = Math.PI * 2 - GAP;
  tips.forEach((t, i) => (t.angle = start + (span * (i + 0.5)) / TIPS));
  const setAngles = (node) => {
    if (!node.children) return node.angle;
    const a = node.children.map(setAngles);
    node.angle = (a[0] + a[a.length - 1]) / 2;
    node.minA = Math.min(...a);
    node.maxA = Math.max(...a);
    return node.angle;
  };
  setAngles(root);
  const rOf = (node) => R0 + (node.depth / maxDepth) * (R1 - R0);
  const pt = (r, a) => [C + r * Math.cos(a), C + r * Math.sin(a)];

  /* ---------- clade colouring ---------- */
  // Colour the two deepest clades on each side, and one small lineage in the accent.
  const clades = [];
  const collect = (node, level) => {
    if (level === 2 || !node.children) {
      clades.push(node);
      return;
    }
    node.children.forEach((c) => collect(c, level + 1));
  };
  collect(root, 0);
  const palette = ["c-teal", "c-ink", "c-ochre", "c-teal-2"];
  clades.forEach((node, i) => {
    const mark = (n) => {
      n.cls = palette[i % palette.length];
      if (n.children) n.children.forEach(mark);
    };
    mark(node);
  });
  // accent: a small terminal clade
  const small = [];
  const findSmall = (node) => {
    if (!node.children) return 1;
    const size = node.children.reduce((s, c) => s + findSmall(c), 0);
    if (size >= 3 && size <= 4) small.push(node);
    return size;
  };
  findSmall(root);
  const accent = small[Math.floor(small.length * 0.62)];
  if (accent) {
    const mark = (n) => {
      n.cls = "c-hot";
      if (n.children) n.children.forEach(mark);
    };
    mark(accent);
  }

  /* ---------- draw ---------- */
  const branches = el("g", { class: "tf-branches" });
  let order = 0;
  const draw = (node, parent) => {
    const r = rOf(node);
    if (parent) {
      const rp = rOf(parent);
      const [x1, y1] = pt(rp, node.angle);
      const [x2, y2] = pt(r, node.angle);
      const p = el("path", { d: `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`, class: `tf-b ${node.cls || "c-ink"}` }, branches);
      p.style.setProperty("--i", order++);
    }
    if (node.children) {
      const [ax, ay] = pt(r, node.minA);
      const [bx, by] = pt(r, node.maxA);
      const large = node.maxA - node.minA > Math.PI ? 1 : 0;
      const arc = el("path", {
        d: `M${ax.toFixed(2)} ${ay.toFixed(2)}A${r.toFixed(2)} ${r.toFixed(2)} 0 ${large} 1 ${bx.toFixed(2)} ${by.toFixed(2)}`,
        class: `tf-b ${node.cls || "c-ink"}`,
      }, branches);
      arc.style.setProperty("--i", order++);
      node.children.forEach((c) => draw(c, node));
    }
  };
  draw(root, null);
  const [rx, ry] = pt(R0, root.angle);
  el("circle", { cx: rx, cy: ry, r: 3.2, class: "tf-root" });

  // Alignment ring: concentric columns of residues at each tip.
  const ring = el("g", { class: "tf-ring" });
  const COLS = 14;
  const ringStart = R1 + 10;
  const cellDepth = 5.6;
  const angStep = span / TIPS;
  // Per-column conservation and a few lineage-specific columns.
  const conserved = Array.from({ length: COLS }, () => rand());
  tips.forEach((tip, i) => {
    for (let c = 0; c < COLS; c++) {
      const r0 = ringStart + c * cellDepth;
      const r1 = r0 + cellDepth - 1.1;
      const a0 = tip.angle - angStep / 2 + 0.004;
      const a1 = tip.angle + angStep / 2 - 0.004;
      let state = "s0";
      if (rand() > conserved[c] * 0.55 + 0.42) state = rand() < 0.5 ? "s1" : "s2";
      if (tip.cls === "c-hot" && (c === 4 || c === 9)) state = "s3";
      const [p0x, p0y] = pt(r0, a0);
      const [p1x, p1y] = pt(r1, a0);
      const [p2x, p2y] = pt(r1, a1);
      const [p3x, p3y] = pt(r0, a1);
      const cell = el("path", {
        d: `M${p0x.toFixed(2)} ${p0y.toFixed(2)}L${p1x.toFixed(2)} ${p1y.toFixed(2)}A${r1} ${r1} 0 0 1 ${p2x.toFixed(2)} ${p2y.toFixed(2)}L${p3x.toFixed(2)} ${p3y.toFixed(2)}A${r0} ${r0} 0 0 0 ${p0x.toFixed(2)} ${p0y.toFixed(2)}Z`,
        class: `tf-cell ${state}`,
      }, ring);
      cell.style.setProperty("--a", i);
    }
  });

  /* ---------- one-time reveal ---------- */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    svg.classList.add("is-drawn", "no-motion");
    return;
  }
  svg.querySelectorAll(".tf-b").forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  });
  requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add("is-drawn")));
})();
