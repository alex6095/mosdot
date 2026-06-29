# MoSDOT Project Page

Static project page for **Multi-Agent Coordination via Support-Preserving Distillation**.
It is plain HTML/CSS/JavaScript, so it can be deployed directly with GitHub Pages without a build step.

## Files

```text
.
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/main.js
│   ├── paper/paper.pdf
│   ├── figures/*.png
│   └── icons/favicon.svg
├── .nojekyll
├── robots.txt
├── LICENSE
└── README.md
```

## Local Preview

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages Deployment

1. Create a new GitHub repository, for example `mosdot-project-page`.
2. Upload all files in this folder so that `index.html` is at the repository root.
3. Commit the files to `main`.
4. Go to **Settings > Pages**.
5. Set **Source** to `Deploy from a branch`.
6. Set **Branch** to `main` and **Folder** to `/ (root)`.
7. Save and wait for GitHub Pages to publish.

The site URL will usually be:

```text
https://<github-id>.github.io/<repository-name>/
```

## Terminal Deployment

```bash
git init
git add .
git commit -m "Initial MoSDOT project page"
git branch -M main
git remote add origin https://github.com/<github-id>/<repository-name>.git
git push -u origin main
```

Then enable GitHub Pages from **Settings > Pages > Deploy from a branch > main / root**.

## Before Public Release

- Replace `Anonymous Author(s)` with the real author list when allowed.
- Replace the venue line if the paper status changes.
- Replace the disabled code button with the public repository URL.
- Replace the BibTeX block with the final citation.
- The bundled PDF includes a "Do not distribute" notice. Replace `assets/paper/paper.pdf` with a public version, or remove the PDF link before public deployment.
