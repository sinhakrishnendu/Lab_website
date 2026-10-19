/*
 * Publication data engine (no page code here, so it also runs in Node for the
 * nightly snapshot in .github/workflows/update-publications.yml).
 *
 * Source of truth: the public ORCID record. Enrichment: OpenAlex (authors,
 * corresponding-author flags, open-access PDF, abstract).
 */
(function (root) {
  const PREPRINT_SERVERS = [
    { prefix: "10.1101/", name: "bioRxiv" },
    { prefix: "10.64898/", name: "bioRxiv" },
    { prefix: "10.32942/", name: "EcoEvoRxiv" },
    { prefix: "10.21203/", name: "Research Square" },
    { prefix: "10.20944/", name: "Preprints.org" },
    { prefix: "10.31219/", name: "OSF Preprints" },
    { prefix: "10.26434/", name: "ChemRxiv" },
    { prefix: "10.48550/", name: "arXiv" },
    { prefix: "10.2139/", name: "SSRN" },
  ];

  const normalizeDoi = (doi) =>
    String(doi || "")
      .trim()
      .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
      .replace(/^doi:/i, "")
      .toLowerCase();

  const stripTags = (text) => String(text || "").replace(/<[^>]+>/g, "");

  const titleTokens = (title) =>
    new Set(
      stripTags(title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .split(" ")
        .filter((word) => word.length > 2),
    );

  const titleSimilarity = (a, b) => {
    const A = titleTokens(a);
    const B = titleTokens(b);
    if (!A.size || !B.size) return 0;
    let shared = 0;
    A.forEach((word) => B.has(word) && shared++);
    return shared / (A.size + B.size - shared);
  };

  const preprintServer = (doi) => PREPRINT_SERVERS.find((server) => doi.startsWith(server.prefix));

  const cleanVenue = (name) =>
    String(name || "")
      .replace(/\s*\(Cold Spring Harbor Laboratory\)\s*/i, "")
      .trim();

  const reconstructAbstract = (index) => {
    if (!index) return "";
    const words = [];
    Object.entries(index).forEach(([word, positions]) => positions.forEach((p) => (words[p] = word)));
    return words.filter(Boolean).join(" ");
  };

  const firstSentences = (text, limit = 280) => {
    const clean = stripTags(text)
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^(abstract|background|summary|motivation|introduction|context)\b[:.]?\s+/i, "")
      .trim();
    // OpenAlex abstracts sometimes start mid-sentence; show nothing rather than a fragment.
    if (!clean || !/^[A-Z0-9“"(]/.test(clean)) return "";
    const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g) || [clean];
    let out = "";
    for (const sentence of sentences) {
      if ((out + sentence).length > limit && out) break;
      out += sentence;
    }
    out = out.trim();
    return out.length > limit + 40 ? `${out.slice(0, limit).replace(/\s+\S*$/, "")}…` : out;
  };

  const isPiName = (name, config) => {
    const n = String(name || "").toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
    return (config.authorNames || []).some((variant) => {
      const v = variant.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
      return n === v;
    }) || (/\bsinha\b/.test(n) && /^k/.test(n));
  };

  /* ---------------- ORCID ---------------- */

  const parseOrcidWorks = (json) =>
    (json.group || []).map((group) => {
      const summaries = group["work-summary"] || [];
      // Prefer the summary that carries the most complete date.
      const summary = [...summaries].sort((a, b) => datePrecision(b) - datePrecision(a))[0];
      const ids = (group["external-ids"]?.["external-id"] || []).concat(summary["external-ids"]?.["external-id"] || []);
      const doiId = ids.find((id) => id["external-id-type"] === "doi");
      const pd = summary["publication-date"] || {};
      const part = (key) => pd[key]?.value || "";
      return {
        doi: doiId ? normalizeDoi(doiId["external-id-value"]) : "",
        url: summary.url?.value || doiId?.["external-id-url"]?.value || "",
        title: stripTags(summary.title?.title?.value || ""),
        orcidType: summary.type || "",
        journal: summary["journal-title"]?.value || "",
        year: part("year"),
        month: part("month"),
        day: part("day"),
      };
    });

  function datePrecision(summary) {
    const pd = summary["publication-date"] || {};
    return ["year", "month", "day"].filter((k) => pd[k]?.value).length;
  }

  /* ---------------- OpenAlex ---------------- */

  const OPENALEX_SELECT =
    "doi,title,type,publication_date,authorships,primary_location,best_oa_location,abstract_inverted_index";

  const fetchOpenAlex = async (dois, fetchImpl) => {
    const byDoi = new Map();
    for (let i = 0; i < dois.length; i += 40) {
      const chunk = dois.slice(i, i + 40);
      const filter = chunk.map((doi) => encodeURIComponent(doi)).join("|");
      const url = `https://api.openalex.org/works?per_page=50&select=${OPENALEX_SELECT}&filter=doi:${filter}`;
      const response = await fetchImpl(url);
      if (!response.ok) throw new Error(`OpenAlex ${response.status}`);
      const data = await response.json();
      (data.results || []).forEach((work) => byDoi.set(normalizeDoi(work.doi), work));
    }
    return byDoi;
  };

  /* ---------------- Merge ---------------- */

  const buildRecord = (orcidWork, openAlex, config) => {
    const doi = orcidWork.doi;
    const server = doi ? preprintServer(doi) : null;
    let kind = "other";
    if (orcidWork.orcidType === "preprint" || server || openAlex?.type === "preprint") kind = "preprint";
    else if (orcidWork.orcidType === "journal-article") kind = "article";
    else if (orcidWork.orcidType === "book-chapter" || orcidWork.orcidType === "book") kind = "chapter";
    else if (openAlex?.type === "article" || openAlex?.type === "review") kind = "article";

    // Date: ORCID first; OpenAlex only when it is more precise and not a 1 January placeholder.
    let date = [orcidWork.year, orcidWork.month, orcidWork.day].filter(Boolean).join("-");
    let precision = [orcidWork.year, orcidWork.month, orcidWork.day].filter(Boolean).length;
    const oaDate = openAlex?.publication_date || "";
    if (oaDate && precision < 3 && !/-01-01$/.test(oaDate) && (!orcidWork.year || oaDate.startsWith(orcidWork.year))) {
      date = oaDate;
      precision = 3;
    }

    const authorships = openAlex?.authorships || [];
    const orcidUrl = `https://orcid.org/${config.orcid}`;
    const orcidLinked = authorships.some((a) => a.author?.orcid === orcidUrl);
    let nameMatched = false;
    const authors = authorships.map((a) => {
      let isPI = orcidLinked
        ? a.author?.orcid === orcidUrl
        : !nameMatched && isPiName(a.author?.display_name, config);
      if (isPI && !orcidLinked) nameMatched = true;
      return { name: a.author?.display_name || "", isPI, corresponding: a.is_corresponding === true };
    });
    const pi = authors.find((a) => a.isPI);

    let corresponding = null;
    let correspondingSource = "unknown";
    const include = (config.correspondingDois || []).map(normalizeDoi);
    const exclude = (config.notCorrespondingDois || []).map(normalizeDoi);
    if (include.includes(doi)) {
      corresponding = true;
      correspondingSource = "config";
    } else if (exclude.includes(doi)) {
      corresponding = false;
      correspondingSource = "config";
    } else if (openAlex) {
      corresponding = Boolean(pi && (pi.corresponding || authors.length === 1));
      correspondingSource = "openalex";
    }
    if (corresponding && pi) pi.corresponding = true;

    const venue =
      kind === "preprint"
        ? server?.name || cleanVenue(openAlex?.primary_location?.source?.display_name) || "Preprint"
        : orcidWork.journal || cleanVenue(openAlex?.primary_location?.source?.display_name);

    const summary =
      config.summaries?.[doi] || firstSentences(reconstructAbstract(openAlex?.abstract_inverted_index));

    return {
      doi,
      href: doi ? `https://doi.org/${doi}` : orcidWork.url,
      title: orcidWork.title || stripTags(openAlex?.title),
      kind,
      venue,
      date,
      precision,
      year: (date || "").slice(0, 4),
      authors: authors.map(({ name, isPI, corresponding: c }) => ({ name, isPI, corresponding: c })),
      corresponding,
      correspondingSource,
      pdf: openAlex?.best_oa_location?.pdf_url || "",
      summary,
      links: config.extraLinks?.[doi] || [],
      supersededBy: "",
    };
  };

  const markSuperseded = (records) => {
    const articles = records.filter((r) => r.kind === "article");
    records
      .filter((r) => r.kind === "preprint")
      .forEach((preprint) => {
        const match = articles.find((article) => titleSimilarity(article.title, preprint.title) >= 0.8);
        if (match) preprint.supersededBy = match.doi;
      });
    return records;
  };

  const sortKey = (record) => record.date || "0000";

  const fetchRecords = async (config, fetchImpl = root.fetch.bind(root)) => {
    const orcidResponse = await fetchImpl(`https://pub.orcid.org/v3.0/${config.orcid}/works`, {
      headers: { Accept: "application/json" },
    });
    if (!orcidResponse.ok) throw new Error(`ORCID ${orcidResponse.status}`);
    const orcidWorks = parseOrcidWorks(await orcidResponse.json());

    let openAlexByDoi = new Map();
    try {
      openAlexByDoi = await fetchOpenAlex(
        orcidWorks.map((w) => w.doi).filter(Boolean),
        fetchImpl,
      );
    } catch (error) {
      if (root.console) console.info("OpenAlex enrichment unavailable; using ORCID only.", error);
    }

    const hidden = (config.hiddenDois || []).map(normalizeDoi);
    const records = orcidWorks
      .filter((w) => w.title && !hidden.includes(w.doi))
      .map((w) => buildRecord(w, openAlexByDoi.get(w.doi), config));

    return markSuperseded(records).sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  };

  const selectLatest = (records, kind, count = 3) =>
    records
      .filter((r) => r.kind === kind && r.corresponding === true && !r.supersededBy)
      .sort((a, b) => sortKey(b).localeCompare(sortKey(a)))
      .slice(0, count);

  root.PublicationsCore = { fetchRecords, selectLatest, normalizeDoi, titleSimilarity };
})(typeof window !== "undefined" ? window : globalThis);
