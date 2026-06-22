const body = document.body;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const yearTarget = document.querySelector("[data-year]");
const selectedPublicationsTarget = document.querySelector("[data-selected-publications]");
const orcidWorksEndpoint = "https://pub.orcid.org/v3.0/0000-0001-9590-3875/works";

const profilePublicationHighlights = [
  {
    rank: 1,
    figure: "alignment",
    venue: "Bioinformatics",
    year: "2026",
    title: "BABAPPAlign: a multiple sequence alignment engine with a learned residue-level scoring function",
    summary:
      "Introduces a progressive MSA engine with a trained residue-level scorer, fixed protein-language-model embeddings, exact affine-gap dynamic programming, and codon-aware alignment.",
    doi: "10.1093/bioinformatics/btag189",
    href: "https://doi.org/10.1093/bioinformatics/btag189",
  },
  {
    rank: 2,
    figure: "workflow",
    venue: "bioRxiv",
    year: "2026",
    title: "BABAPPASnake: a workflow for episodic selection analysis with robustness-aware summaries",
    summary:
      "Presents a reproducible workflow for orthogroup-centered episodic selection analysis, integrating alignment pathways, phylogenetic inference, branch-site testing, and robustness summaries.",
    doi: "10.1101/2025.04.27.650835",
    href: "https://doi.org/10.1101/2025.04.27.650835",
  },
  {
    rank: 3,
    figure: "selection",
    venue: "Scientific Reports",
    year: "2026",
    title:
      "Episodic positive selection structurally stabilizes the Arabidopsis CONSTANS-like gene COL5 indicating adaptive evolution",
    summary:
      "Links episodic positive selection in a plant light-signaling gene to structural stabilization, connecting molecular evolution signals with protein-level interpretation.",
    doi: "10.1038/s41598-025-34129-6",
    href: "https://doi.org/10.1038/s41598-025-34129-6",
  },
];

const venueImpactScores = [
  ["bioinformatics", 120],
  ["scientific reports", 105],
  ["chemical research in toxicology", 96],
  ["archives of toxicology", 94],
  ["food and chemical toxicology", 92],
  ["biofactors", 88],
  ["biochimica et biophysica acta", 86],
  ["toxicology in vitro", 84],
  ["toxicology", 82],
  ["current drug metabolism", 78],
  ["translational medicine of aging", 76],
  ["biorxiv", 72],
];

const figureMarkup = {
  alignment: `
    <figure class="paper-figure alignment-figure" aria-label="Schematic sequence alignment figure">
      <span></span><span></span><span></span><span></span>
      <span></span><span></span><span></span><span></span>
    </figure>
  `,
  workflow: `
    <figure class="paper-figure workflow-figure" aria-label="Schematic reproducible workflow figure">
      <span class="workflow-node node-input"></span>
      <span class="workflow-node node-align-a"></span>
      <span class="workflow-node node-align-b"></span>
      <span class="workflow-node node-model"></span>
      <span class="workflow-node node-summary"></span>
      <span class="workflow-edge edge-one"></span>
      <span class="workflow-edge edge-two"></span>
      <span class="workflow-edge edge-three"></span>
      <span class="workflow-edge edge-four"></span>
    </figure>
  `,
  selection: `
    <figure class="paper-figure selection-figure" aria-label="Schematic adaptive-selection signal figure">
      <span class="selection-track track-one"></span>
      <span class="selection-track track-two"></span>
      <span class="selection-track track-three"></span>
      <span class="pulse pulse-one"></span>
      <span class="pulse pulse-two"></span>
    </figure>
  `,
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

const getVenueImpactScore = (venue) => {
  const normalizedVenue = String(venue || "").toLowerCase();
  return venueImpactScores.find(([name]) => normalizedVenue.includes(name))?.[1] || 0;
};

const getDoiPreferenceScore = (doi) => {
  const normalizedDoi = normalizeDoi(doi);
  if (normalizedDoi.startsWith("10.1093/")) return 10;
  if (normalizedDoi.startsWith("10.1038/")) return 9;
  if (normalizedDoi.startsWith("10.1021/")) return 7;
  if (normalizedDoi.startsWith("10.1101/")) return 4;
  return 0;
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
  return profilePublicationHighlights.find((work) => {
    return (
      normalizeDoi(work.doi) === normalizedDoi ||
      normalizedTitle.includes(work.title.toLowerCase().slice(0, 32))
    );
  });
};

const inferPublicationFigure = (title) => {
  const normalizedTitle = title.toLowerCase();
  if (normalizedTitle.includes("workflow") || normalizedTitle.includes("pipeline") || normalizedTitle.includes("babappasnake")) {
    return "workflow";
  }
  if (normalizedTitle.includes("alignment") || normalizedTitle.includes("babappalign")) {
    return "alignment";
  }
  return "selection";
};

const inferPublicationSummary = (work) => {
  const curatedWork = getCuratedPublication(work.doi, work.title);
  if (curatedWork) return curatedWork.summary;

  const normalizedTitle = work.title.toLowerCase();
  if (normalizedTitle.includes("workflow") || normalizedTitle.includes("pipeline")) {
    return "Profile-listed workflow contribution for reproducible molecular evolution analysis and robustness-aware reporting.";
  }
  if (normalizedTitle.includes("alignment")) {
    return "Profile-listed sequence-analysis work connected to alignment, scoring, and computational molecular biology.";
  }
  if (normalizedTitle.includes("selection") || normalizedTitle.includes("codon") || normalizedTitle.includes("adaptive")) {
    return "Profile-listed molecular evolution study connecting sequence-level signals with biological interpretation.";
  }
  return "Profile-listed publication. See the DOI record and scholarly profiles for full bibliographic details.";
};

const scorePublicationImpact = (work) => {
  const title = work.title.toLowerCase();
  const doi = work.doi.toLowerCase();
  const venueScore = getVenueImpactScore(work.venue);
  const recencyScore = Math.max(0, Math.min(20, (getPublicationYear(work) - 2020) * 3));
  let topicScore = 0;

  if (title.includes("babappalign")) topicScore += 70;
  if (title.includes("babappasnake") || title.includes("babappa")) topicScore += 66;
  if (title.includes("positive selection") || title.includes("adaptive evolution")) topicScore += 32;
  if (title.includes("codon") || title.includes("alignment") || title.includes("phylogen")) topicScore += 24;
  if (title.includes("molecular") || title.includes("evolution")) topicScore += 10;

  let doiScore = 0;
  doiScore += getDoiPreferenceScore(doi);
  if (doi.startsWith("10.1101/") && title.includes("babappa")) doiScore += 8;

  return venueScore + recencyScore + topicScore + doiScore;
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
  const venueDifference = getVenueImpactScore(candidate.venue) - getVenueImpactScore(current.venue);
  if (venueDifference !== 0) return venueDifference;

  const doiDifference = getDoiPreferenceScore(candidate.doi) - getDoiPreferenceScore(current.doi);
  if (doiDifference !== 0) return doiDifference;

  return (candidate.score ?? 0) - (current.score ?? 0);
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
  const venue = summary["journal-title"]?.value || (doi.startsWith("10.1101/") ? "bioRxiv" : "Profile publication");
  const curatedWork = getCuratedPublication(doi, title);
  const work = {
    figure: curatedWork?.figure || inferPublicationFigure(title),
    venue: curatedWork?.venue || venue,
    year: curatedWork?.year || year,
    title: curatedWork?.title || title,
    doi: curatedWork?.doi || doi,
    href: curatedWork?.href || `https://doi.org/${doi}`,
  };

  work.summary = inferPublicationSummary(work);
  work.score = scorePublicationImpact(work);
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

const renderSelectedPublications = (publications = profilePublicationHighlights) => {
  if (!selectedPublicationsTarget) return;

  const selectedWorks = [...publications]
    .sort((a, b) => {
      const aRank = Number.isFinite(a.rank) ? a.rank : null;
      const bRank = Number.isFinite(b.rank) ? b.rank : null;
      if (aRank !== null || bRank !== null) return (aRank ?? 999) - (bRank ?? 999);
      return (b.score ?? 0) - (a.score ?? 0) || getPublicationYear(b) - getPublicationYear(a);
    })
    .slice(0, 3);

  selectedPublicationsTarget.innerHTML = selectedWorks
    .map(
      (work, index) => `
        <article class="publication-card${index === 0 ? " feature-publication" : ""}">
          ${figureMarkup[work.figure] || figureMarkup.alignment}
          <div class="publication-body">
            <p class="journal">${escapeHtml(work.venue)} · ${escapeHtml(work.year)}</p>
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

renderSelectedPublications();

const loadOrcidPublicationHighlights = async () => {
  if (!selectedPublicationsTarget || typeof fetch !== "function") return;

  try {
    const response = await fetch(orcidWorksEndpoint, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`ORCID request failed with ${response.status}`);

    const data = await response.json();
    const profileWorks = deduplicateProfileWorks(extractOrcidWorks(data)).sort(
      (a, b) => (b.score ?? 0) - (a.score ?? 0) || getPublicationYear(b) - getPublicationYear(a),
    );

    if (profileWorks.length >= 3) {
      renderSelectedPublications(profileWorks);
    }
  } catch (error) {
    console.info("Using curated selected-publication fallback.", error);
  }
};

loadOrcidPublicationHighlights();

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
