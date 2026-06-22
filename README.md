# Sinha Molecular Evolution Lab

Official website repository for the Sinha Molecular Evolution Lab, Department of Zoology, Siksha Bhavana, Visva-Bharati University.

The website presents the laboratory's research program in molecular evolution, adaptive selection, protein evolution, phylogenetics, and computational bioinformatics. It is maintained as a lightweight static site for reliable publication through GitHub Pages.

## Website

Primary deployment:

```text
https://sinhakrishnendu.github.io/Lab_website/
```

Scholarly profiles:

- ORCID: <https://orcid.org/0000-0001-9590-3875>
- Google Scholar: <https://scholar.google.com/citations?user=ZEI-IzMAAAAJ&hl=en&authuser=1>
- Personal website: <https://sinhakrishnendu.github.io/>

## Repository Structure

```text
.
├── index.html
├── styles.css
├── script.js
├── .nojekyll
└── assets/
    └── molecular-evolution-hero.png
```

`index.html` contains the page content, publication highlights, profile links, and contact information. `styles.css` defines the visual identity and responsive layout. `script.js` controls the mobile navigation and active section states. `.nojekyll` ensures GitHub Pages serves the static files directly.

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
- Use original or properly licensed figures and media.
- Add new lab members, publications, software, and datasets as the group grows.
- Check both desktop and mobile layouts after major edits.

## Content

The publication figure panels used on the homepage are original schematic summaries prepared for web presentation. They are not reproductions of published journal figures.
