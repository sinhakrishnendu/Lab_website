# Sinha Molecular Evolution Group

Official website repository for the Sinha Molecular Evolution Group, Department of Zoology, Siksha Bhavana, Visva-Bharati.

The website presents the group's research program in molecular evolution, adaptive selection, protein evolution, phylogenetics, and computational bioinformatics. It is maintained as a lightweight static site for reliable publication through GitHub Pages.

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
    ├── molecular-evolution-hero.png
    ├── krishnendu-sinha.jpeg
    └── sinha-lab-research-background.png
```

`index.html` contains the page content, publication area, profile links, and contact information. `styles.css` defines the visual identity and responsive layout. `script.js` fetches public ORCID works at page load, ranks the selected-publication tiles by venue strength, topical relevance, and recency, and falls back to a curated data list if the profile API is unavailable. It also controls the mobile navigation and active section states. `.nojekyll` ensures GitHub Pages serves the static files directly.

The active homepage background is `assets/sinha-lab-research-background.png`, an original software-centered visual inspired by BABAPPAlign and BABAPPASnake: multiple sequence alignment blocks, learned residue-level scoring, workflow orchestration, and robustness-summary motifs.

The browser tab favicon is `assets/favicon.svg`, an original abstract alignment/workflow mark.

The principal investigator portrait is stored at `assets/krishnendu-sinha.jpeg`.

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
- Keep the ORCID profile updated; the selected-publication tiles refresh automatically from public ORCID works when the API is reachable.
- Use original or properly licensed figures and media.
- Use institutional marks and seals only when the appropriate permission or license is available.
- Add new group members, publications, software, and datasets as the group grows.
- Check both desktop and mobile layouts after major edits.

## Content

The homepage schematic panels and background are original summaries prepared for web presentation.

The website uses a textual Visva-Bharati affiliation mark. The official Visva-Bharati seal is not bundled in this repository unless separately authorized.
