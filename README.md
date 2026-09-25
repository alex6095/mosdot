# MoSDOT project page

Project page for **Multi-Agent Coordination via Support-Preserving Distillation**, accepted to NeurIPS 2026.

**Sangmin Lee, Youngju Na, Chanmi Lee, Sung-eui Yoon† · KAIST**

† Corresponding author.

Production: <https://alex6095.github.io/mosdot/>

A dependency-free HTML/CSS/JavaScript site, served directly by GitHub Pages. No framework or deployment build step is required.

## Preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/>. The figure viewer, benchmark tabs, SMACv1 scenario selector, mobile navigation, and citation copy use vanilla JavaScript. All result tables remain available without JavaScript; figure links fall back to their original PDFs.

## Content and provenance

- `index.html`: research narrative, confirmed authors, citation, and generated static tables.
- `assets/data/results.json`: exact strings from Tables 1–3, including trailing zeros, reported averages, and ±2σ uncertainties. Do not recompute published averages from displayed rounded entries.
- `assets/data/figures.json`: source filenames and SHA-256 hashes for the five figures.
- `assets/figures/original/`: unmodified figure PDFs from the user-provided Camera-ready source ZIP.
- `assets/figures/*.webp`: lossless 2400px-wide renderings of those PDFs. Figure artwork and internal labels are unchanged.
- `assets/paper/paper.pdf`: the final PDF compiled from the Camera-ready Overleaf project on September 26, 2026, with all four authors, one shared KAIST affiliation, and Sung-eui Yoon marked as corresponding author.

The source of record is `_Camera_ready__Multi_Agent_Coordination_via_Support_Preserving_Distillation.zip`, supplied on September 25, 2026. Its hash is recorded in `results.json`. Authors and acceptance status were supplied directly by the author.

| Web figure | Paper | Overleaf source |
| --- | --- | --- |
| Source-to-mode routing | Figure 1 | `figures/fig1_rrrr.pdf` |
| Framework | Figure 2 | `figures/fig2_81.pdf` |
| Landmark trajectories | Figure 3 | `figures/fig4_1r.pdf` |
| XOR diagnostic | Figure 6 | `figures/fig3_rr.pdf` |
| Joint mode-tuple support | Figure 7 | `figures/joint_mode_support_grid_v2.pdf` |

## Updating tables

Edit the canonical JSON only after checking the paper, then regenerate:

```sh
python3 scripts/build_results.py
python3 scripts/verify_content.py
node --check assets/js/main.js
```

`build_results.py` transposes the layout for readability; it does not round values or recalculate averages. Best and second-best means include ties. A highlighted MoSDOT row identifies the proposed method and does not imply it wins every column.

To also verify against the source ZIP and rendered manuscript:

```sh
pdftotext -layout /path/to/manuscript.pdf /tmp/mosdot-paper.txt
python3 scripts/verify_content.py \
  --source-zip /path/to/Camera-ready-source.zip \
  --paper-text /tmp/mosdot-paper.txt
```

## Public release status

The webpage and linked PDF show the confirmed authors and NeurIPS 2026 acceptance. The PDF uses the official `neurips_2026` style with `[main,final]`; the shared-affiliation author block was compiled in Overleaf and checked visually. `results.json` records the exact PDF hash.

The research-code URL and arXiv/proceedings URL have not been supplied. The code availability label remains “Coming soon”; the footer's “Page source” links to this website repository. Add final proceedings identifiers when available.

The GitHub Pages site serves the `main` branch. Changes to the linked PDF become public after pushing to that branch and the Pages build completes.

See [QA.md](QA.md) for the verification record.
