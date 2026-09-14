const body = document.body;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const yearTarget = document.querySelector("[data-year]");
const latestResearchTarget = document.querySelector("[data-latest-research]");
const orcidWorksEndpoint = "https://pub.orcid.org/v3.0/0000-0001-9590-3875/works";

const latestResearchFallback = [
  {
    venue: "bioRxiv",
    year: "2026",
    title: "Evolutionary replay of duplicate-gene retention is structured by lineage and event",
    summary:
      "Tests whether ancestral gene-lineage identity predicts duplicate retention across independent whole-genome duplications, finding reproducible replay that remains shaped by lineage and event history.",
    doi: "10.64898/2026.08.29.748011",
    href: "https://doi.org/10.64898/2026.08.29.748011",
    type: "preprint",
    publishedAt: Date.UTC(2026, 8, 3),
  },
  {
    venue: "bioRxiv",
    year: "2026",
    title:
      "Curli Carrier Burden: a quantitative trait-level microbiome index for amyloidogenic bacterial signals in Parkinson's disease gut metagenomes",
    summary:
      "Introduces a transparent, taxon-informed index for comparing amyloidogenic curli-carrier bacterial burden across Parkinson's disease gut metagenomic cohorts.",
    doi: "10.64898/2026.05.25.727557",
    href: "https://doi.org/10.64898/2026.05.25.727557",
    type: "preprint",
    publishedAt: Date.UTC(2026, 4, 28),
  },
  {
    venue: "bioRxiv",
    year: "2026",
    title:
      "NeuroFate: endpoint-locked transcriptomic axis scoring for neurodegeneration risk research",
    summary:
      "Provides endpoint-locked transcriptomic axis scoring with curated neurodegeneration gene sets, evidence grading, and explicit claim-safety rules.",
    doi: "10.64898/2026.05.23.727380",
    href: "https://doi.org/10.64898/2026.05.23.727380",
    type: "preprint",
    publishedAt: Date.UTC(2026, 4, 27),
  },
  {
    venue: "Bioinformatics",
    year: "2026",
    title: "BABAPPAlign: a multiple sequence alignment engine with a learned residue-level scoring function",
    summary:
      "Introduces a progressive multiple sequence alignment engine with learned residue-level scoring, protein-language-model embeddings, affine-gap dynamic programming, and codon-aware alignment.",
    doi: "10.1093/bioinformatics/btag189",
    href: "https://doi.org/10.1093/bioinformatics/btag189",
    type: "journal-article",
    publishedAt: Date.UTC(2026, 4, 3),
  },
  {
    venue: "Scientific Reports",
    year: "2026",
    title:
      "Episodic positive selection structurally stabilizes the Arabidopsis CONSTANS-like gene COL5 indicating adaptive evolution",
    summary:
      "Combines phylogenomics, codon-based selection tests, ancestral reconstruction, structure calculations, and molecular dynamics to examine derived COL5 residues.",
    doi: "10.1038/s41598-025-34129-6",
    href: "https://doi.org/10.1038/s41598-025-34129-6",
    type: "journal-article",
    publishedAt: Date.UTC(2026, 0, 3),
  },
];

const journalCovers = {
  bioinformatics: {
    src: "assets/journals/bioinformatics-cover.jpg",
    alt: "Cover of the journal Bioinformatics",
    width: 611,
    height: 792,
  },
  "scientific reports": {
    src: "assets/journals/scientific-reports-cover.jpg",
    alt: "Cover of the journal Scientific Reports",
    width: 684,
    height: 900,
  },
};

const preprintServices = {
  biorxiv: {
    label: "bioRxiv",
    src: "assets/preprints/biorxiv-logo.png",
    alt: "bioRxiv preprint server",
    width: 478,
    height: 166,
  },
  medrxiv: { label: "medRxiv" },
  ecoevorxiv: { label: "EcoEvoRxiv" },
  arxiv: { label: "arXiv" },
  chemrxiv: { label: "ChemRxiv" },
};

const getJournalCover = (venue) => {
  const normalizedVenue = String(venue || "").toLowerCase();
  const key = Object.keys(journalCovers).find((name) => normalizedVenue.includes(name));
  return key ? journalCovers[key] : null;
};

const getPreprintService = (work) => {
  const venue = String(work.venue || "").toLowerCase();
  const doi = normalizeDoi(work.doi);

  if (venue.includes("medrxiv")) return preprintServices.medrxiv;
  if (venue.includes("ecoevorxiv") || doi.startsWith("10.32942/")) return preprintServices.ecoevorxiv;
  if (venue.includes("chemrxiv")) return preprintServices.chemrxiv;
  if (venue.includes("arxiv") || doi.startsWith("10.48550/arxiv")) return preprintServices.arxiv;
  if (venue.includes("biorxiv") || doi.startsWith("10.1101/") || doi.startsWith("10.64898/")) {
    return preprintServices.biorxiv;
  }

  return null;
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return replacements[character];
  });

const normalizeDoi = (doi) =>
  String(doi || "")
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .toLowerCase();

const getPublicationYear = (work) => {
  const year = Number(work.year);
  return Number.isFinite(year) ? year : 0;
};

const isPreprint = (work) => {
  const publicationType = String(work.type || "").toLowerCase();
  const venue = String(work.venue || "").toLowerCase();
  const doi = normalizeDoi(work.doi);
  return (
    publicationType.includes("preprint") ||
    venue.includes("biorxiv") ||
    venue.includes("medrxiv") ||
    venue.includes("ecoevorxiv") ||
    venue.includes("arxiv") ||
    venue.includes("chemrxiv") ||
    doi.startsWith("10.1101/") ||
    doi.startsWith("10.64898/") ||
    doi.startsWith("10.32942/") ||
    doi.startsWith("10.48550/arxiv")
  );
};

const getOrcidDateValue = (summary) => {
  const date = summary["publication-date"] || {};
  const year = Number(date.year?.value || 0);
  const month = Number(date.month?.value || 1);
  const day = Number(date.day?.value || 1);
  return year ? Date.UTC(year, month - 1, day) : 0;
};

const getOrcidDoi = (summary) => {
  const externalIds = summary["external-ids"]?.["external-id"] || [];
  const doiRecord = externalIds.find((record) => record["external-id-type"] === "doi");
  return normalizeDoi(doiRecord?.["external-id-value"]);
};

const getCuratedPublication = (doi, title) => {
  const normalizedDoi = normalizeDoi(doi);
  const normalizedTitle = String(title || "").toLowerCase();
  return latestResearchFallback.find((work) => {
    return (
      normalizeDoi(work.doi) === normalizedDoi ||
      normalizedTitle.includes(work.title.toLowerCase().slice(0, 32))
    );
  });
};

const inferPublicationSummary = (work) => {
  const curatedWork = getCuratedPublication(work.doi, work.title);
  if (curatedWork) return curatedWork.summary;

  const normalizedTitle = work.title.toLowerCase();
  if (normalizedTitle.includes("workflow") || normalizedTitle.includes("pipeline")) {
    return "Develops a reproducible molecular evolution workflow with robustness-aware analysis and reporting.";
  }
  if (normalizedTitle.includes("alignment")) {
    return "Develops sequence-analysis methods for alignment, scoring, and computational molecular biology.";
  }
  if (normalizedTitle.includes("selection") || normalizedTitle.includes("codon") || normalizedTitle.includes("adaptive")) {
    return "Connects sequence-level evidence for molecular evolution with biological interpretation.";
  }
  if (normalizedTitle.includes("duplicate") || normalizedTitle.includes("genome evolution")) {
    return "Examines the retention and loss of duplicated genes across evolutionary lineages.";
  }
  if (normalizedTitle.includes("transcriptom") || normalizedTitle.includes("metagenom") || normalizedTitle.includes("microbiome")) {
    return "Uses explicit, reproducible biological summaries to investigate transcriptomic or metagenomic data.";
  }
  return "Advances research in molecular evolution and computational biology.";
};

const canonicalPublicationTitle = (title) =>
  String(title || "")
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(a|an|the)\b/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const compareDuplicateWorks = (candidate, current) => {
  const candidateIsArticle = !isPreprint(candidate);
  const currentIsArticle = !isPreprint(current);
  if (candidateIsArticle !== currentIsArticle) return candidateIsArticle ? 1 : -1;
  return (candidate.publishedAt ?? 0) - (current.publishedAt ?? 0);
};

const deduplicateProfileWorks = (works) => {
  const worksByTitle = new Map();

  works.forEach((work) => {
    const key = canonicalPublicationTitle(work.title);
    const currentWork = worksByTitle.get(key);
    if (!currentWork || compareDuplicateWorks(work, currentWork) > 0) {
      worksByTitle.set(key, work);
    }
  });

  return [...worksByTitle.values()];
};

const normalizeOrcidWork = (summary) => {
  const title = summary.title?.title?.value || "";
  const doi = getOrcidDoi(summary);
  if (!title || !doi) return null;

  const date = summary["publication-date"] || {};
  const year = date.year?.value || "";
  const type = summary.type || "";
  const inferredPreprintVenue = doi.startsWith("10.32942/")
    ? "EcoEvoRxiv"
    : doi.startsWith("10.48550/arxiv")
      ? "arXiv"
      : "bioRxiv";
  const venue =
    summary["journal-title"]?.value ||
    (String(type).toLowerCase().includes("preprint") ||
    doi.startsWith("10.1101/") ||
    doi.startsWith("10.64898/") ||
    doi.startsWith("10.32942/") ||
    doi.startsWith("10.48550/arxiv")
      ? inferredPreprintVenue
      : "Scholarly output");
  const curatedWork = getCuratedPublication(doi, title);
  const work = {
    venue: curatedWork?.venue || venue,
    year: curatedWork?.year || year,
    title: curatedWork?.title || title,
    doi: curatedWork?.doi || doi,
    href: curatedWork?.href || `https://doi.org/${doi}`,
    type: curatedWork?.type || type,
    publishedAt: getOrcidDateValue(summary),
  };

  work.summary = inferPublicationSummary(work);
  return work;
};

const extractOrcidWorks = (data) => {
  const works = [];
  const groups = data.group || [];

  groups.forEach((group) => {
    const summaries = [...(group["work-summary"] || [])].sort(
      (a, b) => getOrcidDateValue(b) - getOrcidDateValue(a),
    );
    const work = normalizeOrcidWork(summaries[0] || {});
    if (work) works.push(work);
  });

  return works;
};

const renderPublicationCover = (work) => {
  const preprintService = getPreprintService(work);
  const cover = getJournalCover(work.venue);

  if (isPreprint(work) && preprintService?.src) {
    return `
      <a class="publication-cover publication-cover-preprint" href="${escapeHtml(work.href)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(work.title)}">
        <img
          src="${escapeHtml(preprintService.src)}"
          alt="${escapeHtml(preprintService.alt)}"
          width="${preprintService.width}"
          height="${preprintService.height}"
          loading="lazy"
        >
        <small>Preprint</small>
      </a>
    `;
  }

  if (!cover) {
    return `
      <figure class="publication-cover publication-cover-fallback">
        <span>${escapeHtml(preprintService?.label || work.venue)}</span>
        <small>${isPreprint(work) ? "Preprint" : "Publication"}</small>
      </figure>
    `;
  }

  return `
    <a class="publication-cover" href="${escapeHtml(work.href)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(work.title)}">
      <img
        src="${escapeHtml(cover.src)}"
        alt="${escapeHtml(cover.alt)}"
        width="${cover.width}"
        height="${cover.height}"
        loading="lazy"
      >
    </a>
  `;
};

const getPublicationDateValue = (work) =>
  work.publishedAt || Date.UTC(getPublicationYear(work), 0, 1);

const selectLatestResearch = (publications) =>
  [...publications]
    .sort(
      (a, b) =>
        getPublicationDateValue(b) - getPublicationDateValue(a) ||
        a.title.localeCompare(b.title),
    )
    .slice(0, 5);

const formatPublicationDate = (work) => {
  const dateValue = getPublicationDateValue(work);
  if (!dateValue) return work.year;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateValue));
};

const getPublicationMeta = (work) => {
  if (isPreprint(work)) {
    const service = getPreprintService(work);
    return `Preprint · ${service?.label || work.venue} · ${formatPublicationDate(work)}`;
  }
  return `${work.venue} · ${formatPublicationDate(work)}`;
};

const renderLatestResearch = (publications = latestResearchFallback) => {
  if (!latestResearchTarget) return;

  const selectedWorks = selectLatestResearch(publications);

  latestResearchTarget.innerHTML = selectedWorks
    .map(
      (work) => `
        <article class="publication-card">
          ${renderPublicationCover(work)}
          <div class="publication-body">
            <p class="journal">${escapeHtml(getPublicationMeta(work))}</p>
            <h3>${escapeHtml(work.title)}</h3>
            <p>${escapeHtml(work.summary)}</p>
            <a class="text-link" href="${escapeHtml(work.href)}" target="_blank" rel="noreferrer">
              DOI: ${escapeHtml(work.doi)}
            </a>
          </div>
        </article>
      `,
    )
    .join("");
};

renderLatestResearch();

const loadLatestResearchFromOrcid = async () => {
  if (!latestResearchTarget || typeof fetch !== "function") return;

  try {
    const response = await fetch(orcidWorksEndpoint, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`ORCID request failed with ${response.status}`);

    const data = await response.json();
    const profileWorks = deduplicateProfileWorks(extractOrcidWorks(data));

    if (profileWorks.length > 0) {
      renderLatestResearch(profileWorks);
    }
  } catch (error) {
    console.info("Using the latest-research fallback.", error);
  }
};

loadLatestResearchFromOrcid();

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    header?.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    header?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const sections = [...document.querySelectorAll("main section[id]")];

if ("IntersectionObserver" in window && sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const active = entry.target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          link.classList.toggle("is-active", href === `#${active}`);
        });
      });
    },
    { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}
