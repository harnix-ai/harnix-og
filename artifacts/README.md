# Vietnamese typography investigation

## Confirmed root cause

The API registered three WOFF subsets with identical family, weight and style.
Satori 0.10.14 selects a single matching face, keeping the first equal-weight
match. It does not combine these subsets via CSS `unicode-range` rules.

Be Vietnam Pro's first registered `vietnamese` subset lacks basic Latin letters.
The next selected fallback is Space Grotesk's `latin` face at weight 600.
Comparing individual Satori SVG paths confirmed:

| Character | Original output matches |
| --- | --- |
| T, i, à | Space Grotesk 600 |
| ể, ậ | Be Vietnam Pro 700 |

The title was a mixture of families and weights, despite every character being
visible. Metrics differ too: Be Vietnam Pro uses ascender/descender 1000/-265,
Space Grotesk uses 984/-292 (both 1000 units/em).

Reference implementation for the pinned renderer:
https://github.com/vercel/satori/blob/0.10.14/src/font.ts

## Fix and verification

- Register one full Be Vietnam Pro WOFF face per weight (500, 700, 800).
- Full font version 1.002, 459 cmap entries, complete Vietnamese coverage.
- Verify Vietnamese outlines and advance widths against the original Fontsource
  subsets at all three weights; no font design substitution.
- Normalize card text to NFC, after API signature verification. Satori 0.10.14
  does not reliably position decomposed combining marks as a browser does.
- All six title strings now produce exactly the same SVG geometry/metrics as
  rendering with only the complete Be Vietnam Pro 700 face available.
- Signed API requests produce identical PNG bytes for NFC and NFD title input;
  invalid signatures are still rejected.

## Browser comparison

`font-comparison.html` embeds all fonts and shows original Satori, corrected
Satori, and Chromium with the full Be Vietnam Pro 700 face at 48px.
`font-comparison.png` is the Chromium screenshot. The corrected glyph shapes,
weight and accents visually match the browser reference; raster antialiasing
and text shaping/kerning may still differ between engines. Browser measurement
of Fontsource CSS subsets differs slightly from the full font because font
subsetting also affects kerning across subset boundaries. Browser CSS understands
`unicode-range`; passing font buffers to Satori is a different mechanism.

## Artifacts and reproduction

- `vietnamese-og-test.png` / `.svg`: 1200×630, all six requested strings.
- `og-title-fixed.png`: recreated card using the supplied image's visible title,
  category and statistic. Decorative seed may differ from the CMS image.
- `font-comparison.html` / `.png`: original, corrected, browser comparison.

Run `npm ci`, `npm test`, and `npm run font:preview` from the repository root.
The preview generator requires the original Fontsource package to reproduce the
broken baseline, but the API reads full Be Vietnam Pro faces from `fonts/`.

The CMS URL points to an existing stored PNG. These local changes do not rewrite
that asset: deploy the fix and regenerate/re-upload the CMS image to replace it.
