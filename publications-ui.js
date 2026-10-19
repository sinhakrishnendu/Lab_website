/*
 * Renders publication lists from PublicationsCore.
 *   [data-pub-latest="article"]   latest peer-reviewed papers, corresponding author
 *   [data-pub-latest="preprint"]  latest preprints, corresponding author
 *   [data-pub-all]                full list (publications.html)
 *   [data-pub-status]             "updated from ORCID" line
 * The saved snapshot (data/publications-snapshot.js) renders first, so the page
 * never shows an empty list; live ORCID data then replaces it.
 */
(() => {
  const config = window.PUBLICATION_CONFIG;
  const core = window.PublicationsCore;
  if (!config || !core) return;

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const formatDate = (record) => {
    if (!record.date) return "";
    const [y, m, d] = record.date.split("-").map(Number);
    if (!m) return String(y);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(y, m - 1, d || 1)));
  };

  const authorList = (record, max = 8) => {
    if (!record.authors?.length) return "";
    const names = record.authors.map((a) => {
      const name = a.isPI ? `<strong>${esc(a.name)}</strong>` : esc(a.name);
      return a.corresponding ? `${name}<span class="corr" title="Corresponding author">*</span>` : name;
    });
    if (names.length > max) {
      const piIndex = record.authors.findIndex((a) => a.isPI);
      const head = names.slice(0, max - 2);
      if (piIndex >= max - 2) head.push("…", names[piIndex]);
      else head.push("…", names[names.length - 1]);
      return head.join(", ");
    }
    return names.join(", ");
  };

  const cover = (record) => {
    const venue = String(record.venue || "").toLowerCase();
    if (record.kind === "preprint") {
      const logo = Object.entries(config.preprintLogos || {}).find(([name]) => venue === name);
      return logo ? { ...logo[1], logo: true } : null;
    }
    const key = Object.keys(config.journalCovers || {}).find((name) => venue === name || venue.startsWith(name));
    return key ? config.journalCovers[key] : null;
  };

  const linkRow = (record) => {
    const links = [];
    if (record.doi) links.push(`<a href="${esc(record.href)}" target="_blank" rel="noreferrer">DOI</a>`);
    if (record.pdf) links.push(`<a href="${esc(record.pdf)}" target="_blank" rel="noreferrer">PDF</a>`);
    (record.links || []).forEach((l) => links.push(`<a href="${esc(l.href)}" target="_blank" rel="noreferrer">${esc(l.label)}</a>`));
    if (record.doi) links.push(`<button type="button" class="cite-button" data-cite="${esc(record.doi)}">Cite</button>`);
    return links.join("");
  };

  const kindLabel = { article: "Journal article", preprint: "Preprint", chapter: "Book chapter", other: "Other" };

  const card = (record) => {
    const c = cover(record);
    const visual = c
      ? `<img${c.logo ? ' class="pub-logo"' : ""} src="${esc(c.src)}" alt="" width="${c.width}" height="${c.height}" loading="lazy">`
      : `<span class="pub-venue-mark">${esc(record.venue || kindLabel[record.kind])}</span>`;
    return `
      <article class="pub-card${c && !c.logo ? " has-cover" : ""}">
        <a class="pub-visual" href="${esc(record.href)}" target="_blank" rel="noreferrer" tabindex="-1" aria-hidden="true">${visual}</a>
        <div class="pub-body">
          <p class="pub-meta"><em>${esc(record.venue)}</em>, ${esc(formatDate(record))}</p>
          <h3><a href="${esc(record.href)}" target="_blank" rel="noreferrer">${esc(record.title)}</a></h3>
          ${record.authors?.length ? `<p class="pub-authors">${authorList(record)}</p>` : ""}
          ${record.summary ? `<p class="pub-summary">${esc(record.summary)}</p>` : ""}
          <p class="pub-links">${linkRow(record)}</p>
        </div>
      </article>`;
  };

  const entry = (record) => `
    <li class="pub-entry" data-kind="${esc(record.kind)}" data-corr="${record.corresponding ? "1" : "0"}">
      <p class="pub-entry-title"><a href="${esc(record.href)}" target="_blank" rel="noreferrer">${esc(record.title)}</a></p>
      ${record.authors?.length ? `<p class="pub-authors">${authorList(record, 14)}</p>` : ""}
      <p class="pub-meta">
        ${record.kind !== "article" ? `<span class="pub-kind">${esc(kindLabel[record.kind])}</span>` : ""}
        <em>${esc(record.venue)}</em>${record.date ? `, ${esc(formatDate(record))}` : ""}
        ${record.supersededBy ? `<span class="pub-note">Published version: <a href="https://doi.org/${esc(record.supersededBy)}" target="_blank" rel="noreferrer">${esc(record.supersededBy)}</a></span>` : ""}
      </p>
      <p class="pub-links">${linkRow(record)}</p>
    </li>`;

  /* ---------- rendering ---------- */

  const renderLatest = (records) => {
    document.querySelectorAll("[data-pub-latest]").forEach((target) => {
      const kind = target.getAttribute("data-pub-latest");
      const count = Number(target.getAttribute("data-count") || 3);
      const selected = core.selectLatest(records, kind, count);
      target.innerHTML = selected.length
        ? selected.map(card).join("")
        : `<p class="pub-empty">No records found yet. See the full list on <a href="https://orcid.org/${esc(config.orcid)}">ORCID</a>.</p>`;
    });
  };

  let allRecords = [];
  const renderAll = () => {
    const target = document.querySelector("[data-pub-all]");
    if (!target) return;
    const kind = document.querySelector("[data-pub-filter].is-active")?.getAttribute("data-pub-filter") || "all";
    const corrOnly = document.querySelector("[data-pub-corr]")?.checked;
    const query = (document.querySelector("[data-pub-search]")?.value || "").trim().toLowerCase();

    const visible = allRecords.filter((r) => {
      if (kind === "preprint" && r.kind !== "preprint") return false;
      if (kind === "article" && r.kind !== "article") return false;
      if (kind === "chapter" && r.kind !== "chapter") return false;
      if (corrOnly && !r.corresponding) return false;
      if (query) {
        const hay = `${r.title} ${r.venue} ${r.year} ${(r.authors || []).map((a) => a.name).join(" ")}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    const byYear = new Map();
    visible.forEach((r) => {
      const year = r.year || "Undated";
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year).push(r);
    });

    target.innerHTML = visible.length
      ? [...byYear.entries()]
          .map(
            ([year, list]) => `
              <section class="pub-year" aria-labelledby="y-${esc(year)}">
                <h2 id="y-${esc(year)}">${esc(year)}</h2>
                <ol class="pub-entries">${list.map(entry).join("")}</ol>
              </section>`,
          )
          .join("")
      : `<p class="pub-empty">No publications match these filters.</p>`;

    const counter = document.querySelector("[data-pub-count]");
    if (counter) counter.textContent = `${visible.length} of ${allRecords.length} works`;
  };

  const renderStats = () => {
    const target = document.querySelector("[data-pub-stats]");
    if (!target || !allRecords.length) return;
    const n = (kind) => allRecords.filter((r) => r.kind === kind && !r.supersededBy).length;
    const corr = allRecords.filter((r) => r.corresponding && !r.supersededBy).length;
    target.innerHTML = `
      <div><dt>Journal articles</dt><dd>${n("article")}</dd></div>
      <div><dt>Preprints</dt><dd>${n("preprint")}</dd></div>
      <div><dt>Book chapters</dt><dd>${n("chapter")}</dd></div>
      <div><dt>As corresponding author</dt><dd>${corr}</dd></div>`;
  };

  const setStatus = (text) => {
    document.querySelectorAll("[data-pub-status]").forEach((el) => (el.textContent = text));
  };

  const formatStamp = (iso) =>
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

  const render = (records) => {
    allRecords = records;
    renderLatest(records);
    renderStats();
    renderAll();
  };

  /* ---------- citation export (BibTeX built from the record) ---------- */

  const bibtex = (record) => {
    const latex = (text) => String(text || "").replace(/([&%$#_{}])/g, "\\$1");
    const lastName = (name) => String(name || "").trim().split(/\s+/).pop() || "";
    const firstWord = (record.title.match(/[A-Za-z]{4,}/) || ["work"])[0].toLowerCase();
    const key = `${lastName(record.authors?.[0]?.name || "sinha").toLowerCase().replace(/[^a-z]/g, "")}${record.year}${firstWord}`;
    const authors = (record.authors || []).map((a) => {
      const parts = a.name.trim().split(/\s+/);
      const last = parts.pop();
      return `${last}, ${parts.join(" ")}`.trim();
    });
    const type = record.kind === "article" ? "article" : record.kind === "chapter" ? "incollection" : "misc";
    const fields = [
      ["title", `{${latex(record.title)}}`],
      authors.length ? ["author", authors.join(" and ")] : null,
      record.kind === "article" ? ["journal", latex(record.venue)] : null,
      record.kind === "chapter" ? ["booktitle", latex(record.venue)] : null,
      record.kind === "preprint" ? ["howpublished", latex(record.venue)] : null,
      record.kind === "preprint" ? ["note", "Preprint"] : null,
      ["year", record.year],
      record.doi ? ["doi", record.doi] : null,
      record.href ? ["url", record.href] : null,
    ].filter(Boolean);
    return `@${type}{${key},\n${fields.map(([k, v]) => `  ${k} = {${v}}`).join(",\n")}\n}`;
  };

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-cite]");
    if (!button) return;
    const record = allRecords.find((r) => r.doi === button.getAttribute("data-cite"));
    if (!record) return;
    const text = bibtex(record);
    const original = "Cite";
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "BibTeX copied";
    } catch (error) {
      window.prompt("Copy this BibTeX entry:", text);
      return;
    }
    setTimeout(() => (button.textContent = original), 2200);
  });

  /* ---------- filters (publications page) ---------- */

  document.querySelectorAll("[data-pub-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-pub-filter]").forEach((b) => {
        b.classList.toggle("is-active", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });
      renderAll();
    }),
  );
  document.querySelector("[data-pub-corr]")?.addEventListener("change", renderAll);
  document.querySelector("[data-pub-search]")?.addEventListener("input", renderAll);

  /* ---------- load ---------- */

  const snapshot = window.PUBLICATION_SNAPSHOT;
  if (snapshot?.records?.length) {
    render(snapshot.records);
    setStatus(`Saved list from ${formatStamp(snapshot.generatedAt)}. Checking ORCID for newer work…`);
  }

  core
    .fetchRecords(config)
    .then((records) => {
      if (!records.length) throw new Error("empty ORCID record");
      render(records);
      setStatus(`Updated live from ORCID on ${formatStamp(new Date().toISOString())}.`);
    })
    .catch((error) => {
      console.info("Live ORCID update unavailable; showing saved list.", error);
      if (snapshot?.generatedAt) setStatus(`Saved list from ${formatStamp(snapshot.generatedAt)}.`);
    });
})();
