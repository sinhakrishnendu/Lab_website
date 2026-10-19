/*
 * Hero figure: "From genomes to residues".
 * Five tabs, one per biological scale the group works at. Each panel pairs a
 * schematic with a real result from the group's own papers (numbers are quoted
 * from the abstracts; schematic elements are labelled as such).
 */
(() => {
  const svg = document.querySelector("[data-scale-figure]");
  const caption = document.querySelector("[data-scale-caption]");
  const tabs = [...document.querySelectorAll("[data-scale-tab]")];
  if (!svg || !caption || !tabs.length) return;

  const NS = "http://www.w3.org/2000/svg";
  const el = (name, attrs = {}, parent = svg, text) => {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (text !== undefined) node.textContent = text;
    parent.appendChild(node);
    return node;
  };
  const g = (cls, parent = svg) => el("g", { class: cls }, parent);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const star = (cx, cy, r, parent, cls = "sf-star") => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
    }
    return el("polygon", { points: pts.join(" "), class: cls }, parent);
  };

  /* ---------------- panels ---------------- */

  const panels = {
    genome: {
      label: "Whole-genome duplication",
      draw() {
        // Schematic: three kingdoms, each with a WGD and duplicated gene copies.
        const t = g("sf-schematic");
        el("text", { x: 14, y: 26, class: "sf-head" }, t, "7 independent WGDs, 42 genomes");
        const rows = [
          { y: 78, name: "Plants" },
          { y: 158, name: "Fungi" },
          { y: 238, name: "Animals" },
        ];
        // Bifurcating topology: (Plants, (Fungi, Animals)); fungi + animals = Opisthokonta.
        el("path", { d: "M10 138H26M26 78V198", class: "sf-line draw" }, t);
        el("path", { d: "M26 78H128", class: "sf-line draw" }, t);
        el("path", { d: "M26 198H62M62 158V238", class: "sf-line draw" }, t);
        el("circle", { cx: 62, cy: 198, r: 2.5, class: "sf-node-dot" }, t);
        el("text", { x: 66, y: 202, class: "sf-tick" }, t, "Opisthokonta");
        rows.forEach((row, i) => {
          if (i > 0) el("path", { d: `M62 ${row.y}H128`, class: "sf-line draw" }, t);
          el("text", { x: i === 0 ? 34 : 70, y: row.y - 8, class: "sf-label" }, t, row.name);
          el("path", { d: `M128 ${row.y}V${row.y - 13}H262M128 ${row.y}V${row.y + 13}H262`, class: "sf-line draw" }, t);
          star(128, row.y, 9, t);
          // retained (solid) vs returned to single copy (faded) in four example genes
          [0, 1, 2, 3].forEach((k) => {
            const x = 168 + k * 24;
            const retained = [[1, 1, 0, 1], [1, 0, 0, 1], [1, 1, 0, 0]][i][k];
            el("rect", { x: x - 7, y: row.y - 19, width: 14, height: 12, rx: 2, class: "sf-gene" }, t);
            el("rect", { x: x - 7, y: row.y + 7, width: 14, height: 12, rx: 2, class: retained ? "sf-gene" : "sf-gene lost" }, t);
          });
        });
        el("text", { x: 156, y: 284, class: "sf-note" }, t, "schematic: gene copies kept or lost");

        // Data: predictive test results quoted from the preprint.
        const d = g("sf-data");
        const x0 = 340;
        const x1 = 580;
        const scale = (v) => x0 + (v / 0.3) * (x1 - x0);
        el("text", { x: x0, y: 26, class: "sf-head" }, d, "Retention predicted from 3 angiosperm WGDs");
        el("text", { x: x0, y: 44, class: "sf-sub" }, d, "Spearman ρ, prespecified tests");
        const bars = [
          { name: "Apple–pear WGD", v: 0.169, label: "ρ = 0.169" },
          { name: "Budding-yeast WGD", v: 0.28, label: "ρ = 0.280" },
          { name: "Teleost WGD", v: null, label: "criterion not met" },
        ];
        bars.forEach((b, i) => {
          const y = 84 + i * 62;
          el("text", { x: x0, y: y - 8, class: "sf-label" }, d, b.name);
          if (b.v === null) {
            el("rect", { x: x0, y, width: x1 - x0, height: 16, class: "sf-bar-empty" }, d);
            el("text", { x: x0 + 8, y: y + 12, class: "sf-bar-text muted" }, d, b.label);
          } else {
            const bar = el("rect", { x: x0, y, width: scale(b.v) - x0, height: 16, class: "sf-bar grow" }, d);
            bar.style.setProperty("--d", `${i * 120}ms`);
            el("text", { x: scale(b.v) + 8, y: y + 12, class: "sf-bar-text" }, d, b.label);
          }
        });
        el("line", { x1: x0, x2: x1, y1: 262, y2: 262, class: "sf-axis" }, d);
        [0, 0.1, 0.2, 0.3].forEach((v) => {
          el("line", { x1: scale(v), x2: scale(v), y1: 262, y2: 266, class: "sf-axis" }, d);
          el("text", { x: scale(v), y: 280, class: "sf-tick", "text-anchor": "middle" }, d, v.toFixed(1));
        });
      },
      caption: `A gene kept in duplicate after one flowering-plant WGD is <strong>1.67–1.73 times</strong> as likely
        to be kept after another, and <strong>29%</strong> of the variation in retention is shared across events.
        Predictions recorded before the outcomes were examined held for apple–pear and budding yeast.`,
      source: { text: "Sinha & Ghosh, bioRxiv 2026", href: "https://doi.org/10.64898/2026.08.29.748011" },
      kind: "Bars show reported values; tree is schematic.",
    },

    gene: {
      label: "Gene structure",
      draw() {
        const t = g("sf-schematic");
        el("text", { x: 14, y: 26, class: "sf-head" }, t, "Intervening sequences in an Asgard tRNA gene");
        const x0 = 150;
        const x1 = 640;
        const regions = [
          ["Acceptor", 0.0, 0.1],
          ["D-arm", 0.1, 0.32],
          ["Anticodon arm", 0.32, 0.56],
          ["Variable", 0.56, 0.66],
          ["T-arm", 0.66, 0.9],
          ["Acc.", 0.9, 1.0],
        ];
        const X = (f) => x0 + f * (x1 - x0);
        regions.forEach(([name, a, b], i) => {
          el("rect", { x: X(a), y: 48, width: X(b) - X(a) - 2, height: 8, class: `sf-region r${i % 2}` }, t);
          el("text", { x: (X(a) + X(b)) / 2, y: 44, class: "sf-tick", "text-anchor": "middle" }, t, name);
        });
        const tracks = [
          { y: 128, name: "Standard annotation", sub: "tRNAscan-SE" },
          { y: 214, name: "Motif-free census", sub: "this study" },
        ];
        const introns = [
          { f: 0.17, census: true, missed: true },
          { f: 0.26, census: true, missed: true },
          { f: 0.44, census: true, missed: false },
          { f: 0.77, census: true, missed: false },
        ];
        tracks.forEach((track, ti) => {
          el("text", { x: 14, y: track.y - 2, class: "sf-label" }, t, track.name);
          el("text", { x: 14, y: track.y + 14, class: "sf-sub" }, t, track.sub);
          el("line", { x1: x0, x2: x1, y1: track.y, y2: track.y, class: "sf-gene-line" }, t);
          introns.forEach((intron) => {
            if (ti === 0 && intron.missed) {
              el("circle", { cx: X(intron.f), cy: track.y, r: 3, class: "sf-gap-mark" }, t);
              return;
            }
            const x = X(intron.f);
            el("path", {
              d: `M${x - 16} ${track.y}C${x - 16} ${track.y - 44} ${x + 16} ${track.y - 44} ${x + 16} ${track.y}`,
              class: `sf-intron draw${ti === 1 && intron.missed ? " hot" : ""}`,
            }, t);
          });
        });
        el("text", { x: X(0.215), y: 240, class: "sf-annot", "text-anchor": "middle" }, t, "missed by annotation");
        el("text", { x: 14, y: 284, class: "sf-note" }, t, "schematic positions; arcs are intervening sequences");
      },
      caption: `In 90 Asgard genomes, standard annotation missed <strong>30%</strong> of tRNA intervening sequences,
        mostly in the D-arm. A census-based reconstruction placed <strong>129 intron gains at 65 loci</strong> on
        37 branches of the species tree, sitting at splicing motifs 6–10 times more often than expected.`,
      source: { text: "Goswami, Ghosh & Sinha, bioRxiv 2026", href: "https://doi.org/10.64898/2026.10.13.758758" },
      kind: "Schematic; numbers quoted from the preprint.",
    },

    alignment: {
      label: "Sequence alignment",
      draw() {
        const t = g("sf-schematic");
        el("text", { x: 14, y: 26, class: "sf-head" }, t, "Learned residue scores inside dynamic programming");
        const seqA = "MKVLTDGRNW".split("");
        const seqB = "MKILSDGKW".split("");
        const cx = 70;
        const cy = 62;
        const s = 21;
        // deterministic score field: high near the alignment path
        const path = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [7, 8], [8, 9]];
        const onPath = new Set(path.map(([i, j]) => `${i},${j}`));
        seqB.forEach((b, i) => {
          el("text", { x: cx - 10, y: cy + i * s + s / 2 + 4, class: "sf-res", "text-anchor": "middle" }, t, b);
          seqA.forEach((a, j) => {
            const near = Math.max(0, 1 - Math.abs(i - j * 0.9) / 3.2);
            const score = a === b ? 0.95 : 0.12 + near * 0.55 * (((i * 7 + j * 3) % 5) / 5 + 0.4);
            const cell = el("rect", {
              x: cx + j * s, y: cy + i * s, width: s - 2, height: s - 2, rx: 2,
              class: "sf-cell", "fill-opacity": Math.min(0.92, score).toFixed(2),
            }, t);
            if (onPath.has(`${i},${j}`)) cell.classList.add("on-path");
          });
        });
        seqA.forEach((a, j) =>
          el("text", { x: cx + j * s + s / 2 - 1, y: cy - 8, class: "sf-res", "text-anchor": "middle" }, t, a),
        );
        const d = path
          .map(([i, j], k) => `${k ? "L" : "M"}${(cx + j * s + s / 2 - 1).toFixed(1)} ${(cy + i * s + s / 2 - 1).toFixed(1)}`)
          .join("");
        el("path", { d, class: "sf-path draw" }, t);

        const fx = 330;
        const steps = [
          "Protein-language-model embeddings (fixed)",
          "Trained residue-pair scorer",
          "Exact affine-gap dynamic programming",
          "Progressive multiple alignment, codon-aware mode",
        ];
        steps.forEach((label, k) => {
          const y = 70 + k * 52;
          el("rect", { x: fx, y: y - 18, width: 300, height: 30, rx: 5, class: k === 1 ? "sf-box hot" : "sf-box" }, t);
          el("text", { x: fx + 12, y: y + 2, class: "sf-label" }, t, label);
          if (k < steps.length - 1) el("path", { d: `M${fx + 150} ${y + 13}V${y + 31}`, class: "sf-arrow" }, t);
        });
        el("text", { x: 70, y: 284, class: "sf-note" }, t, "schematic score matrix and traceback");
      },
      caption: `BABAPPAlign replaces fixed substitution matrices with a trained scorer on protein-language-model
        embeddings. On BAliBASE it <strong>outperformed BLOSUM62 and embedding-cosine controls</strong> in the same
        engine and <strong>exceeded MAFFT</strong>.`,
      source: { text: "Sinha, Bioinformatics 2026", href: "https://doi.org/10.1093/bioinformatics/btag189" },
      kind: "Schematic.",
    },

    selection: {
      label: "Episodic selection",
      draw() {
        const t = g("sf-schematic");
        el("text", { x: 14, y: 26, class: "sf-head" }, t, "Is a selection signal robust to the analysis path?");
        const steps = ["Orthogroups", "Codon alignment", "Trimming", "Phylogeny", "Branch-site tests", "Robustness report"];
        steps.forEach((label, k) => {
          const y = 62 + k * 38;
          el("circle", { cx: 26, cy: y - 4, r: 5, class: k === steps.length - 1 ? "sf-node hot" : "sf-node" }, t);
          if (k < steps.length - 1) el("line", { x1: 26, x2: 26, y1: y + 1, y2: y + 29, class: "sf-line" }, t);
          el("text", { x: 40, y, class: "sf-label" }, t, label);
        });
        const mx = 250;
        const my = 74;
        const cw = 50;
        const rh = 40;
        const pathways = ["A·t1", "A·t2", "B·t1", "B·t2", "C·t1", "C·t2"];
        const grid = [
          [1, 1, 1, 1, 1, 1],
          [1, 0, 1, 1, 0, 1],
          [0, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
        ];
        el("text", { x: mx, y: 48, class: "sf-sub" }, t, "alignment × trimming pathway");
        pathways.forEach((p, j) =>
          el("text", { x: mx + j * cw + cw / 2 - 4, y: my - 8, class: "sf-tick", "text-anchor": "middle" }, t, p),
        );
        grid.forEach((row, i) => {
          el("text", { x: mx - 10, y: my + i * rh + 22, class: "sf-label", "text-anchor": "end" }, t, `gene ${i + 1}`);
          row.forEach((v, j) => {
            const c = el("rect", {
              x: mx + j * cw, y: my + i * rh, width: cw - 8, height: rh - 10, rx: 3,
              class: v ? "sf-hit grow" : "sf-miss",
            }, t);
            c.style.setProperty("--d", `${(i * 6 + j) * 25}ms`);
          });
          const frac = row.reduce((a, b) => a + b, 0) / row.length;
          const label = frac === 1 ? "recurrent" : frac === 0 ? "none" : "method-sensitive";
          el("text", { x: mx + 6 * cw + 6, y: my + i * rh + 20, class: `sf-tick${frac === 1 ? " strong" : ""}` }, t, label);
        });
        el("text", { x: mx, y: 284, class: "sf-note" }, t, "schematic layout, not the study's results");
      },
      caption: `BABAPPASnake runs branch-site tests through alternative alignment and trimming pathways and reports
        which signals <strong>recur</strong> and which are <strong>method-sensitive</strong>. In a four-gene mosquito
        melanization module, signals showed both components across six pathways.`,
      source: { text: "Singha et al., bioRxiv 2025", href: "https://doi.org/10.1101/2025.04.27.650835" },
      kind: "Schematic.",
    },

    protein: {
      label: "Protein structure",
      draw() {
        const t = g("sf-schematic");
        el("text", { x: 14, y: 26, class: "sf-head" }, t, "Reverse evolution of COL5");
        // tree: Brassicaceae with the selected A. thaliana lineage
        const tips = [64, 100, 136, 172, 208];
        el("path", { d: "M14 136H40M40 64V208", class: "sf-line draw" }, t);
        tips.forEach((y, i) => {
          if (i === 0) return;
          el("path", { d: `M40 ${y}H150`, class: "sf-line draw" }, t);
        });
        el("path", { d: "M40 64H78", class: "sf-line draw" }, t);
        el("path", { d: "M78 64H150", class: "sf-line hot draw" }, t);
        el("circle", { cx: 78, cy: 64, r: 6, class: "sf-anc" }, t);
        el("text", { x: 156, y: 68, class: "sf-label italic" }, t, "A. thaliana");
        el("text", { x: 156, y: 140, class: "sf-sub" }, t, "other Brassicaceae");
        el("text", { x: 58, y: 236, class: "sf-sub" }, t, "ancestor, PP = 1.0");
        el("path", { d: "M78 70V222", class: "sf-leader" }, t);

        // two replacements
        const rx = 260;
        el("text", { x: rx, y: 60, class: "sf-label" }, t, "2 derived replacements");
        ["site 1", "site 2"].forEach((site, i) => {
          const y = 92 + i * 40;
          el("rect", { x: rx, y: y - 16, width: 40, height: 24, rx: 4, class: "sf-res-box hot" }, t);
          el("text", { x: rx + 20, y: y + 1, class: "sf-res-label", "text-anchor": "middle" }, t, "der.");
          el("path", { d: `M${rx + 46} ${y - 4}H${rx + 78}`, class: "sf-arrow" }, t);
          el("rect", { x: rx + 84, y: y - 16, width: 40, height: 24, rx: 4, class: "sf-res-box anc" }, t);
          el("text", { x: rx + 104, y: y + 1, class: "sf-res-label", "text-anchor": "middle" }, t, "anc.");
          el("text", { x: rx + 134, y: y + 1, class: "sf-tick" }, t, site);
        });

        // MD trace (schematic)
        const mx = 260;
        const my = 270;
        const w = 360;
        const h = 80;
        el("text", { x: mx, y: my - h - 10, class: "sf-label" }, t, "100-ns molecular dynamics");
        el("line", { x1: mx, x2: mx + w, y1: my, y2: my, class: "sf-axis" }, t);
        el("line", { x1: mx, x2: mx, y1: my, y2: my - h, class: "sf-axis" }, t);
        el("text", { x: mx + w, y: my + 14, class: "sf-tick", "text-anchor": "end" }, t, "time");
        el("text", { x: mx - 6, y: my - h + 4, class: "sf-tick", "text-anchor": "end" }, t, "RMSD");
        const trace = (base, amp, seedShift) => {
          let d = "";
          for (let k = 0; k <= 60; k++) {
            const x = mx + (k / 60) * w;
            const rise = base * (1 - Math.exp(-k / 8));
            const wobble = Math.sin(k * 1.7 + seedShift) * amp + Math.sin(k * 0.6 + seedShift) * amp * 0.6;
            d += `${k ? "L" : "M"}${x.toFixed(1)} ${(my - 4 - rise - wobble).toFixed(1)}`;
          }
          return d;
        };
        el("path", { d: trace(26, 2.4, 0), class: "sf-trace derived draw" }, t);
        el("path", { d: trace(58, 4, 2), class: "sf-trace ancestral draw" }, t);
        el("text", { x: mx + w - 4, y: my - 34, class: "sf-tick", "text-anchor": "end" }, t, "derived (modern)");
        el("text", { x: mx + w - 4, y: my - 72, class: "sf-tick hot-text", "text-anchor": "end" }, t, "ancestral residues restored");
        el("text", { x: 14, y: 284, class: "sf-note" }, t, "schematic");
      },
      caption: `Across <strong>284 orthologs from 31 Brassicaceae genomes</strong>, one <i>A. thaliana</i> lineage
        showed episodic selection with two derived replacements. Restoring the ancestral residues
        <strong>destabilised COL5</strong> (Rosetta ΔΔG) and raised structural deviation and energy in
        100-ns simulations.`,
      source: { text: "Sinha, Scientific Reports 2026", href: "https://doi.org/10.1038/s41598-025-34129-6" },
      kind: "Schematic; findings quoted from the paper.",
    },
  };

  /* ---------------- tab control ---------------- */

  const show = (key, focus = false) => {
    const panel = panels[key];
    if (!panel) return;
    tabs.forEach((tab) => {
      const active = tab.dataset.scaleTab === key;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    svg.classList.remove("is-drawn");
    svg.replaceChildren();
    panel.draw();
    svg.setAttribute("aria-label", `${panel.label}: ${caption.textContent}`);
    caption.innerHTML = `
      <span class="sf-caption-text">${panel.caption}</span>
      <span class="sf-caption-meta">
        <a href="${panel.source.href}" target="_blank" rel="noreferrer">${panel.source.text}</a>
        <span>${panel.kind}</span>
      </span>`;
    svg.setAttribute("aria-label", `${panel.label}. ${caption.querySelector(".sf-caption-text").textContent.replace(/\s+/g, " ").trim()}`);

    if (reduceMotion) {
      svg.classList.add("is-drawn", "no-motion");
      return;
    }
    svg.querySelectorAll(".draw").forEach((path) => {
      const length = path.getTotalLength ? path.getTotalLength() : 0;
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    });
    requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add("is-drawn")));
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => show(tab.dataset.scaleTab));
    tab.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = tabs[(index + step + tabs.length) % tabs.length];
      show(next.dataset.scaleTab, true);
    });
  });

  show(tabs[0].dataset.scaleTab);
})();
