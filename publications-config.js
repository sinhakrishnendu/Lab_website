/*
 * Publication settings. This is the only file you need to edit to control
 * what appears in "Latest peer-reviewed papers", "Latest preprints" and on
 * the full publications page.
 *
 * How the lists are built
 *   1. Every work is read live from the public ORCID record below.
 *   2. Each DOI is looked up in OpenAlex for the author list, the
 *      corresponding-author flag, an open-access PDF and the abstract.
 *   3. A work counts as "corresponding author" when OpenAlex marks this ORCID
 *      as corresponding, when it is single-authored, or when its DOI is listed
 *      in correspondingDois below. DOIs in notCorrespondingDois are always
 *      excluded. Use these two lists to correct OpenAlex, whose
 *      corresponding-author data is sometimes missing or late for new preprints.
 *   4. A preprint that has since been published as a journal article (same or
 *      near-identical title) is hidden from the preprint list.
 */
window.PUBLICATION_CONFIG = {
  orcid: "0000-0001-9590-3875",
  authorNames: ["Krishnendu Sinha", "K. Sinha", "Sinha K"],

  correspondingDois: [
    "10.64898/2026.10.13.758758", // Asgard tRNA introns preprint (OpenAlex lists no corresponding author)
  ],
  notCorrespondingDois: [
    // "10.xxxx/example",
  ],

  // Works to hide everywhere on the site (for example duplicates or corrections).
  hiddenDois: [],

  // Optional one-sentence summaries. When a DOI is not listed here, the first
  // sentences of the abstract from OpenAlex are used instead.
  summaries: {
    "10.64898/2026.08.29.748011":
      "Tests whether ancestral gene-lineage identity predicts duplicate retention across independent whole-genome duplications, finding reproducible replay that remains shaped by lineage and event history.",
    "10.1093/bioinformatics/btag189":
      "A progressive multiple sequence alignment engine with a learned residue-level scoring function, protein-language-model embeddings, affine-gap dynamic programming and codon-aware alignment.",
    "10.1038/s41598-025-34129-6":
      "Combines phylogenomics, codon-based selection tests, ancestral reconstruction, structure calculations and molecular dynamics to examine derived residues in Arabidopsis COL5.",
    "10.1101/2025.04.27.650835":
      "A reproducible workflow for orthogroup-centred episodic selection analysis, with alternative alignment pathways and robustness-aware summaries.",
  },

  // Extra links shown under specific works.
  extraLinks: {
    "10.1093/bioinformatics/btag189": [{ label: "Code", href: "https://github.com/sinhakrishnendu/BABAPPAlign" }],
    "10.1101/2025.04.27.650835": [{ label: "Code", href: "https://github.com/sinhakrishnendu/BABAPPASnake" }],
  },

  // Preprint-server wordmarks (matched by server name, case-insensitive).
  preprintLogos: {
    biorxiv: { src: "assets/preprints/biorxiv-logo.png", width: 478, height: 166 },
    ecoevorxiv: { src: "assets/preprints/ecoevorxiv-logo.jpg", width: 400, height: 160 },
  },

  // Locally stored journal covers (matched by journal name, case-insensitive).
  journalCovers: {
    bioinformatics: { src: "assets/journals/bioinformatics-cover.jpg", width: 611, height: 792 },
    "scientific reports": { src: "assets/journals/scientific-reports-cover.jpg", width: 684, height: 900 },
  },
};
