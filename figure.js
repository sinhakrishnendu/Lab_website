/*
 * Fig. 1: an illustrative branch-site analysis drawn as inline SVG.
 * The data are simulated with a fixed seed so the figure is identical on every load.
 * Branch colours encode omega (dN/dS) classes; vermilion columns are sites with
 * posterior probability of omega > 1 on the foreground lineage above 0.95.
 */
(() => {
  const svg = document.querySelector("[data-selection-figure]");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const el = (name, attrs = {}, parent = svg) => {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    parent.appendChild(node);
    return node;
  };

  // Deterministic pseudo-random numbers (mulberry32).
  let seed = 20260419;
  const random = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Tree: ((((gambiae, coluzzii), arabiensis), (funestus, (stephensi, dirus))), (albimanus, darlingi));
  // cls: p = purifying, n = relaxed/neutral, s = positive (foreground)
  const tree = {
    len: 0.4, cls: "p", children: [
      { len: 1.0, cls: "p", children: [
        { len: 1.1, cls: "p", children: [
          { len: 0.8, cls: "p", children: [
            { len: 0.5, cls: "p", name: "gambiae" },
            { len: 0.55, cls: "p", name: "coluzzii" },
          ] },
          { len: 1.3, cls: "n", name: "arabiensis" },
        ] },
        { len: 0.7, cls: "p", children: [
          { len: 2.2, cls: "p", name: "funestus" },
          { len: 0.9, cls: "n", children: [
            { len: 1.3, cls: "p", name: "stephensi" },
            { len: 1.4, cls: "p", name: "dirus" },
          ] },
        ] },
      ] },
      { len: 1.5, cls: "s", children: [
        { len: 1.4, cls: "p", name: "albimanus" },
        { len: 1.2, cls: "s", name: "darlingi" },
      ] },
    ],
  };

  const layout = { top: 54, rowGap: 36, treeLeft: 16, treeWidth: 170, labelX: 196, alignX: 300, colW: 14.5, cols: 24 };
  const leaves = [];
  let maxDepth = 0;
  const walk = (node, depth) => {
    node.depth = depth + node.len;
    maxDepth = Math.max(maxDepth, node.depth);
    if (node.children) {
      node.children.forEach((child) => walk(child, node.depth));
      node.y = (node.children[0].y + node.children[node.children.length - 1].y) / 2;
    } else {
      node.y = layout.top + leaves.length * layout.rowGap;
      leaves.push(node);
    }
  };
  walk(tree, 0);
  const xOf = (node) => layout.treeLeft + (node.depth / maxDepth) * layout.treeWidth;

  // Simulated alignment.
  const alphabet = "ACDEFGHIKLMNPQRSTVWY";
  const ancestor = "MKVLTDGRNWEYQIAFSGTDLKHP".split("");
  const selectedSites = new Set([4, 9, 15, 16, 21]);
  const derived = { 4: "R", 9: "K", 15: "Y", 16: "E", 21: "R" };
  const rows = leaves.map((leaf, rowIndex) => {
    const foreground = leaf.name === "albimanus" || leaf.name === "darlingi";
    return ancestor.map((residue, site) => {
      if (selectedSites.has(site) && foreground) {
        return leaf.name === "albimanus" && site === 21 ? "K" : derived[site];
      }
      if (selectedSites.has(site)) return residue;
      const rate = leaf.cls === "n" ? 0.16 : 0.07;
      if (random() < rate + rowIndex * 0.004) return alphabet[Math.floor(random() * alphabet.length)];
      return residue;
    });
  });
  const posterior = ancestor.map((_, site) =>
    selectedSites.has(site) ? 0.955 + random() * 0.044 : 0.03 + random() * random() * 0.42,
  );

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header labels.
  el("text", { x: layout.treeLeft, y: 22, class: "fig-head" }).textContent = "Phylogeny";
  el("text", { x: layout.alignX, y: 22, class: "fig-head" }).textContent = "Alignment, sites 112–135";

  // Highlight bands for selected columns.
  const bandGroup = el("g", { class: "fig-bands" });
  selectedSites.forEach((site) => {
    el("rect", {
      x: layout.alignX + site * layout.colW - 1,
      y: layout.top - 18,
      width: layout.colW,
      height: leaves.length * layout.rowGap + 4,
      rx: 2,
      class: "band",
    }, bandGroup);
  });

  // Branches.
  const branchGroup = el("g", { class: "fig-tree" });
  let order = 0;
  const drawBranches = (node, parent) => {
    const x = xOf(node);
    const d = parent
      ? `M${xOf(parent).toFixed(1)} ${parent.y.toFixed(1)}V${node.y.toFixed(1)}H${x.toFixed(1)}`
      : `M${layout.treeLeft - 10} ${node.y.toFixed(1)}H${x.toFixed(1)}`;
    const path = el("path", { d, class: `branch omega-${node.cls}` }, branchGroup);
    path.style.setProperty("--i", order++);
    if (node.children) node.children.forEach((child) => drawBranches(child, node));
    else el("circle", { cx: x, cy: node.y, r: 2.6, class: `tip omega-${node.cls}` }, branchGroup);
  };
  drawBranches(tree, null);

  // Foreground label on the selected branch.
  const fg = tree.children[1];
  el("text", {
    x: (xOf(tree) + xOf(fg)) / 2,
    y: fg.y - 7,
    "text-anchor": "middle",
    class: "fig-annot",
  }).textContent = "ω > 1";

  // Taxon labels and residues.
  const rowGroup = el("g", { class: "fig-rows" });
  leaves.forEach((leaf, rowIndex) => {
    const row = el("g", { class: "fig-row", tabindex: "-1" }, rowGroup);
    const label = el("text", { x: layout.labelX, y: leaf.y + 4, class: "taxon" }, row);
    label.textContent = `An. ${leaf.name}`;
    rows[rowIndex].forEach((residue, site) => {
      const variable = residue !== ancestor[site];
      const text = el("text", {
        x: layout.alignX + site * layout.colW + layout.colW / 2 - 1,
        y: leaf.y + 4,
        class: `residue${variable ? " variable" : ""}${selectedSites.has(site) && variable ? " derived" : ""}`,
      }, row);
      text.style.setProperty("--c", site);
      text.textContent = residue;
    });
  });

  // Posterior probability track.
  const trackTop = layout.top + leaves.length * layout.rowGap + 8;
  const trackHeight = 54;
  const track = el("g", { class: "fig-track" });
  el("line", {
    x1: layout.alignX - 2, x2: layout.alignX + layout.cols * layout.colW,
    y1: trackTop + trackHeight, y2: trackTop + trackHeight, class: "axis",
  }, track);
  el("line", {
    x1: layout.alignX - 2, x2: layout.alignX + layout.cols * layout.colW,
    y1: trackTop + trackHeight * 0.05, y2: trackTop + trackHeight * 0.05, class: "threshold",
  }, track);
  const thresholdLabel = el("text", { x: layout.alignX - 8, y: trackTop + trackHeight * 0.05 + 3, class: "axis-label", "text-anchor": "end" }, track);
  thresholdLabel.textContent = "0.95";
  const zeroLabel = el("text", { x: layout.alignX - 8, y: trackTop + trackHeight + 3, class: "axis-label", "text-anchor": "end" }, track);
  zeroLabel.textContent = "0";
  const trackLabel = el("text", { x: layout.labelX, y: trackTop + trackHeight / 2 + 4, class: "taxon track-name" }, track);
  trackLabel.textContent = "P(ω > 1)";

  posterior.forEach((value, site) => {
    const h = value * trackHeight;
    const bar = el("rect", {
      x: layout.alignX + site * layout.colW + 2,
      y: trackTop + trackHeight - h,
      width: layout.colW - 5,
      height: h,
      class: `pp${selectedSites.has(site) ? " pp-hot" : ""}`,
    }, track);
    bar.style.setProperty("--c", site);
  });

  // Scale bar.
  const scaleUnits = 1;
  const scaleWidth = (scaleUnits / maxDepth) * layout.treeWidth;
  const scaleY = trackTop + trackHeight;
  el("line", { x1: layout.treeLeft, x2: layout.treeLeft + scaleWidth, y1: scaleY, y2: scaleY, class: "axis" });
  el("text", { x: layout.treeLeft, y: scaleY + 16, class: "axis-label" }).textContent = "0.1 substitutions / codon";

  // Hover: highlight a taxon row.
  rowGroup.querySelectorAll(".fig-row").forEach((row) => {
    row.addEventListener("mouseenter", () => {
      svg.classList.add("row-focus");
      row.classList.add("is-hot");
    });
    row.addEventListener("mouseleave", () => {
      svg.classList.remove("row-focus");
      row.classList.remove("is-hot");
    });
  });

  if (!reduceMotion) {
    svg.querySelectorAll(".branch").forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    });
    requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add("is-drawn")));
  } else {
    svg.classList.add("is-drawn", "no-motion");
  }
})();
