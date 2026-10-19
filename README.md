# Evolutionary Bioinformatics Group

Official website repository for the Evolutionary Bioinformatics Group, Department of Zoology, Siksha Bhavana, Visva-Bharati.

The website presents the group's current research identity across evolutionary genomics, duplicate-gene retention, molecular adaptation, statistical phylogenetics, context-aware sequence alignment, evidence-aware omics, and reproducible scientific software. It is maintained as a lightweight static site for reliable publication through GitHub Pages.

## Website

Primary deployment:

```text
https://sinhakrishnendu.github.io/Lab_website/
```

Scholarly profiles:

- ORCID: <https://orcid.org/0000-0001-9590-3875>
- Google Scholar: <https://scholar.google.com/citations?user=ZEI-IzMAAAAJ&hl=en&authuser=1>

## Repository Structure

```text
.
├── index.html
├── publications.html
├── styles.css
├── figure.js
├── script.js
├── publications-config.js
├── publications-core.js
├── publications-ui.js
├── data/publications-snapshot.js
├── scripts/update-publications.mjs
├── .github/workflows/update-publications.yml
├── .nojekyll
└── assets/
    ├── favicon.svg
    ├── journals/
    │   ├── bioinformatics-cover.jpg
    │   └── scientific-reports-cover.jpg
    ├── preprints/
    │   ├── biorxiv-logo.png
    │   └── ecoevorxiv-logo.jpg
    ├── molecular-evolution-hero.png
    ├── krishnendu-sinha.jpeg
    ├── nabanita-ghosh.jpeg
    ├── sutapa-sanyal.jpeg
    ├── satwato-goswami-profile.jpeg
    ├── visva-bharati-logo.png
    └── sinha-lab-research-background.png
```

`index.html` is the group homepage. `publications.html` is the complete, filterable publication list. `styles.css` holds the visual identity, `figure.js` draws Fig. 1, and `script.js` handles navigation.

## Publications (automatic)

The homepage shows the three newest **peer-reviewed journal articles** and the three newest **preprints** for which Dr. Sinha is corresponding author. `publications.html` lists every work, grouped by year, with filters, search, author lists, open-access PDF links and a BibTeX "Cite" button.

How it works:

1. `publications-core.js` reads the public ORCID record (`0000-0001-9590-3875`) every time a page loads.
2. Each DOI is looked up in OpenAlex for authors, the corresponding-author flag, an open-access PDF and the abstract.
3. A work counts as corresponding-author when OpenAlex marks the ORCID as corresponding, when it is single-authored, or when its DOI is listed in `correspondingDois` in `publications-config.js`. `notCorrespondingDois` overrides OpenAlex the other way.
4. A preprint later published as a journal article (near-identical title) is hidden from the preprint list and linked to the published version on the full list.
5. `data/publications-snapshot.js` is shown instantly and used if ORCID cannot be reached. A GitHub Action (`.github/workflows/update-publications.yml`) rebuilds it every night from ORCID and commits it when something changed. It can also be run by hand from the repository's Actions tab, or locally with `node scripts/update-publications.mjs`.

To keep the lists current, add new papers and preprints to ORCID. A very new preprint may take a few days to appear in OpenAlex; until then its corresponding-author status is unknown, so add its DOI to `correspondingDois` if it should appear immediately. Short curated summaries and extra links (for example code) are set per DOI in `publications-config.js`.

The homepage opens with a decorative circular phylogeny drawn by `figure.js`: a strictly bifurcating tree generated with a fixed random seed, with an outer ring of sequence-alignment columns. It is deliberately generic, so it is not tied to any dataset or paper and never needs updating. It draws once on load and is static for visitors who prefer reduced motion.

Colour on the site follows the dN/dS (ω) classes used in selection analyses: teal for purifying selection (ω < 1, structure and links), ochre for relaxed constraint (ω ≈ 1), and Visva-Bharati vermilion for positive selection (ω > 1, highlights and calls to action). Type is Source Serif 4 for headings and figure captions, Public Sans for body text, and JetBrains Mono only for sequence data, all loaded from Google Fonts.

Page sections: research questions, research themes (four broad, publication-independent areas plus study systems), latest peer-reviewed papers, software (BABAPPAlign, BABAPPASnake), latest preprints, people and collaborators, joining the group, and contact. The page also carries Open Graph metadata and schema.org `ResearchOrganization` structured data for search engines.

`assets/sinha-lab-research-background.png` is no longer shown on the page but is kept as the social-sharing preview image.

The browser tab favicon is `assets/favicon.svg`, an original abstract alignment/workflow mark.

The principal investigator portrait is stored at `assets/krishnendu-sinha.jpeg`.

The latest-research cards use locally stored journal-cover thumbnails and preprint-service wordmarks for bioRxiv and EcoEvoRxiv. Sources without a prepared image use a restrained source-name treatment.

## Local Preview

The site can be opened directly from `index.html`. For a browser preview that matches normal web hosting more closely, run:

```bash
python3 -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## Deployment

The site is designed for GitHub Pages deployment from the repository root.

Recommended GitHub Pages settings:

- Source: `Deploy from a branch`
- Branch: `master`
- Folder: `/root`

After changes are pushed to the publishing branch, GitHub Pages may take several minutes to update.

## Maintenance Notes

When updating the website:

- Keep `index.html` in the repository root.
- Keep publication links DOI-based where possible.
- Keep the ORCID identifier and OpenAlex authorship records accurate; the latest-research tiles refresh automatically when corresponding-author metadata is available.
- Add a locally stored cover or source logo when a newly listed work introduces a journal or preprint service that is not yet represented in `script.js`.
- Use original or properly licensed figures and media.
- Use institutional marks and seals only when the appropriate permission or license is available.
- Add new group members, publications, software, and datasets as the group grows.
- Check both desktop and mobile layouts after major edits.

## Content

The homepage schematic panels and background are original summaries prepared for web presentation.

The website displays the supplied Visva-Bharati emblem in the institutional header and links it to the official Visva-Bharati website. Its use should remain consistent with institutional permissions and identity guidance.
