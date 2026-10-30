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

  // Review articles. Reviews never appear in the homepage tiles, which show
  // original research only; on the full list they carry a "Review" label.
  // OpenAlex-labelled reviews and titles containing "review" are also detected
  // automatically, so new reviews need adding here only if both checks miss them.
  reviewDois: [
    "10.1016/j.tma.2025.02.002", // Curli protein and α-synucleopathy (Transl. Med. Aging 2025)
    "10.2174/1389200224666221227094144", // Machine learning in drug metabolism (Curr. Drug Metab. 2022)
    "10.2174/1389200215666141125121659", // Cytochrome P450s (Curr. Drug Metab. 2014)
    "10.1021/acs.chemrestox.4c00057", // Pesticides and the gut microbiota (Chem. Res. Toxicol. 2024)
    "10.1021/acs.chemrestox.2c00375", // Deep learning in predictive toxicology (Chem. Res. Toxicol. 2023)
    "10.1016/j.fct.2013.09.026", // Oxidative stress-mediated organ pathophysiology (Food Chem. Toxicol. 2013)
    "10.1007/s00204-013-1034-4", // Oxidative stress and apoptosis pathways (Arch. Toxicol. 2013)
  ],
  // Original research that would otherwise be mistaken for a review.
  notReviewDois: [],

  // Preprints whose published version has a different title. Preprints with the
  // same title as a journal article are detected automatically.
  supersededDois: {
    "10.21203/rs.3.rs-4429582/v1": "10.1038/s41598-024-77156-5", // soybean WRKY codon usage
  },

  // Terms set in italics wherever they appear in titles and summaries.
  italicTerms: [
    "Anopheles gambiae", "Anopheles darlingi", "Anopheles",
    "Plasmodium falciparum", "Plasmodium",
    "Arabidopsis thaliana", "Arabidopsis",
    "Glycine max", "Escherichia coli", "Enterobacter ludwigii", "Enterobacter", "Cirrhinus mrigala", "Saccharomyces cerevisiae", "Drosophila melanogaster",
    "in vitro", "in vivo", "in silico",
  ],

  // Optional one-sentence summaries. When a DOI is not listed here, the first
  // sentences of the abstract from OpenAlex are used instead.
  summaries: {
    "10.64898/2026.10.13.758761":
      "A transcriptomic clock applied to 115 RNA-seq libraries shows that warmth shifts Anopheles gambiae to an older transcriptional state early in adult life, without speeding up the pace of ageing.",
    "10.64898/2026.10.13.758758":
      "A motif-free census of tRNA genes in 90 Asgard archaeal genomes recovers introns missed by standard annotation and shows that they were gained repeatedly, preferentially at sites compatible with splicing.",
    "10.1038/s41598-024-77156-5":
      "Codon-usage and selection analyses of 179 soybean WRKY coding sequences show that selection outweighs mutation in shaping codon usage, with pervasive purifying selection and episodic positive selection in particular clades.",
    "10.1016/j.tma.2025.02.002":
      "Reviews evidence that bacterial curli amyloids from Escherichia coli can cross-seed α-synuclein aggregation, and discusses therapeutic strategies that target curli–α-synuclein interactions in Parkinson's disease.",
    "10.64898/2026.08.29.748011":
      "Following ancestral genes through seven independent whole-genome duplications in plants, fungi and animals shows that duplicate retention is partly repeatable, while deletions and lineage history decide where losses fall.",
    "10.1093/bioinformatics/btag189":
      "A progressive multiple sequence alignment engine with a learned residue-level scoring function, protein-language-model embeddings, affine-gap dynamic programming and codon-aware alignment.",
    "10.1038/s41598-025-34129-6":
      "Reverse-evolution analysis shows that two residues gained under episodic positive selection stabilise the modern Arabidopsis COL5 fold, whereas restoring the ancestral states destabilises it.",
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
