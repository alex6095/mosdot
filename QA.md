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
- Replaced the abstract three-bar mark with an `M` monogram shared by the header and favicon. Rechecked the header at 390px and 1440px; the letter is legible and neither viewport has horizontal overflow.

## Reproducible checks

`python3 scripts/verify_content.py` validates local assets and fragment links, duplicate IDs, source hashes, and generated-table consistency. Optional source arguments also verify all numeric data and original PDFs. `node --check assets/js/main.js` passes.

## PDF release check

The final PDF replaced the anonymous submission-format PDF on September 26, 2026. It was compiled in Overleaf with `[main,final]`; page 1 was rendered and visually checked for the four authors, shared KAIST affiliation, all four emails, and corresponding-author marker. The 26-page PDF passed the same benchmark and teacher-value checks as the earlier manuscript. Research-code and archive/proceedings URLs can be added when supplied.

On September 26, 2026, the `\best` macro was updated to apply bold math fonts to table scores. The refreshed 26-page PDF's page 9 was rendered and visually checked: best scores are bold and second-best scores retain their underline. All 194 benchmark score cells and 26 average cells were checked against their row ranks, including ties; there were no ranking-label mismatches.

## Readability pass

October 2, 2026 (KST): text sizes were raised for desktop reading next to the paper; only `assets/css/styles.css` values and its cache-busting query changed. No content, data, or script changed.

- Desktop (1440px): reading text is now 15–17px (figure captions, method steps, table cells, takeaways, diagnostics, citation). Labels and metadata are 12–13px, and only `†` markers, the `Ours` tag, and `FIG.` numbers stay below 12px.
- Mobile (≤720px): text that was 8–11px is now 11–14px; the scenario `<select>` is 16px so iOS does not zoom on focus.
- Muted greys that measured under 4.5:1 (header meta, metric labels, table arrows, uncertainty, legend, source tags, "Coming soon", footer year) were darkened. An automated audit of every visible text run now finds no text under 4.5:1 except the 45px "Better routes." heading (3.7:1, above the 3:1 large-text threshold).
- Rechecked in headless Chromium at 1440, 1024, 390, and 320px: no page-level horizontal overflow; the MPE table still fits without scrolling at 1440px, and wide tables scroll inside their cards on mobile.

October 2, 2026 (KST), follow-up: body text was still small on Windows desktops, where `Inter` was not installed and the page fell back to Segoe UI.

- The page now loads Inter (text cut, `wght` 400–800) from Google Fonts, so type renders at the intended size on every platform.
- Reading text was raised one more step on desktop: body 17px, lead and section intros 18px, captions, method steps, and table cells 16px. Table headers, uncertainty, takeaways, and legends are 14–15px.
- `tabular-nums` now applies only to score cells; method names and column headers use normal figures, so hyphens no longer widen ("MAC-Flow", "Medium-Replay").
- `scripts/verify_content.py` passes; no horizontal overflow at 1440, 390, or 320px.

## Navigation and clean home URLs

October 8, 2026 (KST): checked the navigation changes in Chromium, including screenshots at desktop and mobile sizes. No manuscript, research data, figure, or video asset changed.

- The previous anchor position included the section's empty top padding. At 1440px, the content started about 123px below the header; at 390px it started about 81px below. The new content gap is 20px on desktop and 16px on mobile, with measured rounding differences below 2px at 1440, 390, and 320px. Citation stops at the document bottom when there is insufficient content below it to align its heading; no artificial footer space was added.
- All eight TOC links, the Video/Explore results buttons, and benchmark highlight links checked. Problem and the nested Rollouts gallery now have TOC entries. The current-section highlight follows their content edges and updates at the document bottom.
- Header layout checked at 1440, 1101, 1100, 1024, 960, 901, 900, 768, 390, and 320px: no page-level horizontal overflow or overlapping header links. The menu replaces the full TOC at 900px; the secondary header PDF button is hidden below 1101px to prevent wrapping. The hero's Paper button remains available.
- Mobile menu opening, section selection, and Escape/focus return checked. At 844×390 landscape, the menu scrolls vertically to all eight items without wrapping into columns or extending beyond the viewport.
- The floating Top button appears after scrolling, hides at the top and during figure dialogs, and has a 44px minimum target. Top actions return to the base URL without a page reload. Old `#top` URLs normalize to the base URL; query strings remain intact. Direct section URLs, browser Back/Forward, and reduced-motion behavior checked. The personal site's brand/footer home links passed the same clean-URL and history checks at 1440 and 390px.
- Regression checks at 1440 and 390px passed: all three benchmark tabs, all six SMACv1 views, keyboard tab navigation, table/rollout synchronization, all three carousels' next/previous/dot/keyboard controls, figure zoom/close/Escape/focus restoration, additional Figure 7, citation copy feedback, and actual overview-video playback. No JavaScript runtime exceptions recorded.
- `python3 scripts/verify_content.py`, `node --check assets/js/main.js`, and `git diff --check` pass. Local-directory home links are accepted by the asset verifier when the target contains `index.html`.
