# Sinha Molecular Evolution Group

Official website repository for the Sinha Molecular Evolution Group, Department of Zoology, Siksha Bhavana, Visva-Bharati.

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
├── styles.css
├── script.js
├── .nojekyll
└── assets/
    ├── favicon.svg
    ├── journals/
    │   ├── bioinformatics-cover.jpg
    │   └── scientific-reports-cover.jpg
    ├── preprints/
    │   └── biorxiv-logo.png
    ├── molecular-evolution-hero.png
    ├── krishnendu-sinha.jpeg
    └── sinha-lab-research-background.png
```

`index.html` contains the research narrative, latest research, people, opportunities, profile links, and contact information. `styles.css` defines the visual identity and responsive layout. `script.js` fetches public ORCID works at page load, removes duplicate records, sorts them by full publication date, and displays the five newest works. A dated local fallback keeps the section available if the ORCID API cannot be reached. The script also controls the mobile navigation and active section states. `.nojekyll` ensures GitHub Pages serves the static files directly.

The active homepage background is `assets/sinha-lab-research-background.png`, a software-centered visual inspired by BABAPPAlign and BABAPPASnake: multiple sequence alignment blocks, learned residue-level scoring, workflow orchestration, and robustness-summary motifs. The site presents this artwork in a light gerua-led scientific palette aligned with the visual character of Visva-Bharati.

The browser tab favicon is `assets/favicon.svg`, an original abstract alignment/workflow mark.

The principal investigator portrait is stored at `assets/krishnendu-sinha.jpeg`.

The latest-research cards use locally stored journal-cover thumbnails and the official bioRxiv wordmark. Sources without a prepared image use a restrained source-name treatment.

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
- Keep the ORCID profile updated; the latest-research tiles refresh automatically from public ORCID works when the API is reachable.
- Add a locally stored cover or source logo when a newly listed work introduces a journal or preprint service that is not yet represented in `script.js`.
- Use original or properly licensed figures and media.
- Use institutional marks and seals only when the appropriate permission or license is available.
- Add new group members, publications, software, and datasets as the group grows.
- Check both desktop and mobile layouts after major edits.

## Content

The homepage schematic panels and background are original summaries prepared for web presentation.

The website uses a textual Visva-Bharati affiliation mark. The official Visva-Bharati seal is not bundled in this repository unless separately authorized.
