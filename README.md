# Sinha Molecular Evolution Group

Official website repository for the Sinha Molecular Evolution Group, Department of Zoology, Siksha Bhavana, Visva-Bharati University.

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
    ├── molecular-evolution-hero.png
    ├── krishnendu-sinha.jpeg
    └── sinha-lab-research-background.png
```

`index.html` contains the page content, publication highlights, profile links, and contact information. `styles.css` defines the visual identity and responsive layout. `script.js` controls the mobile navigation and active section states. `.nojekyll` ensures GitHub Pages serves the static files directly.

The active homepage background is `assets/sinha-lab-research-background.png`, an original visual composed around sequence alignment, branch-site selection, protein-interface evolution, Arabidopsis COL5, mosquito FBN30, and computational molecular evolution themes.

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
- Use original or properly licensed figures and media.
- Use university marks, seals, and logos only when the appropriate institutional permission or license is available.
- Add new group members, publications, software, and datasets as the group grows.
- Check both desktop and mobile layouts after major edits.

## Content

The publication figure panels used on the homepage are original schematic summaries prepared for web presentation. They are not reproductions of published journal figures.

The website uses a textual Visva-Bharati University affiliation mark. The official university seal or logo is not bundled in this repository unless separately authorized.
