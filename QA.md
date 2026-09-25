# Publication refresh verification

Checked on September 25, 2026 against the newly supplied Camera-ready ZIP and manuscript PDF.

## Scientific content

- 194 benchmark mean/2σ pairs and 26 reported averages match both active LaTeX table source and the PDF's page 9.
- All 16 teacher diagnostic values match Table 1 in the LaTeX source and PDF page 7.
- Preserved precision such as `104.40 ± 19.66`, negative rewards such as `−3.8 ± 12.3`, and reported aggregate values.
- Best/second-best ranking includes ties; SMACv2's stronger DoF and MAC-Flow averages remain explicit.
- Five original figure PDFs are byte-identical to the newly supplied ZIP and correspond to active `includegraphics` references.
- The strict-product gap remains explicit; the shared-randomness variant is distinguished from independent local execution.

## Browser review

Visually inspected in Chrome at 1440px desktop, 768px tablet, 390px mobile, and 320px small mobile widths.

- No page-level horizontal overflow at inspected widths. Wide tables scroll inside their own region; method names remain fixed.
- Desktop and mobile headers, hero, authors, figures, result tables, diagnostics, citation, and footer inspected.
- Mobile title initially joined “Coordination” and “via” when hiding a line break. Added whitespace, reloaded, and visually confirmed the fix at 390px and 320px.
- Mobile authors use two columns; primary resource links retain distinct hit targets.
- MPE, SMACv1, and SMACv2 tabs switch correctly. All five SMACv1 scenario options plus the published average view checked.
- Arrow-key tab navigation and selected-state semantics checked.
- Figure dialog tested at desktop and mobile sizes; fit/zoom modes, scroll containment, close button, Escape, focus restoration, and background scroll unlock checked.
- Additional Figure 7 expands and loads correctly.
- Mobile navigation opens, closes on section selection, and updates `aria-expanded`.
- Citation copy reports successful Clipboard API completion; browser automation's separate virtual clipboard does not reflect the system clipboard.
- No browser warnings or errors observed during interaction checks.

## Reproducible checks

`python3 scripts/verify_content.py` validates local assets and fragment links, duplicate IDs, source hashes, and generated-table consistency. Optional source arguments also verify all numeric data and original PDFs. `node --check assets/js/main.js` passes.

## PDF release check

The final PDF replaced the anonymous submission-format PDF on September 26, 2026. It was compiled in Overleaf with `[main,final]`; page 1 was rendered and visually checked for the four authors, shared KAIST affiliation, all four emails, and corresponding-author marker. The 26-page PDF passed the same benchmark and teacher-value checks as the earlier manuscript. Research-code and archive/proceedings URLs can be added when supplied.
