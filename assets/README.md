# Brand assets

- `logo-mark.png` — the real Spaceback by Rembrand lockup (astronaut mark +
  wordmark + "by REMBRAND" badge), black ink, already tightly cropped (no
  padding to trim). It's a wide horizontal lockup (~4:1), not square —
  `drawTopLogo` in `js/app.js` fits it within a width AND height box
  ("contain" sizing), not just a height ratio, which is what a square
  logo like The Social Fabric's could get away with.
- `logo-mark-embed.js` — **this is what the app actually auto-loads**, not
  `logo-mark.png` directly. It's `logo-mark.png` re-encoded as a `data:`
  URI. An `<img>` pointed straight at a local `file://` image taints the
  canvas it's drawn onto (blocks every download, even though it still
  renders fine on screen) — a `data:` URI never does. **After replacing
  `logo-mark.png`, regenerate this file** with `node scripts/embed-logo.js`
  — nothing updates automatically otherwise.

## Colors

Because the logo is black ink (meant for a light background), the default
palette is light-mode: white background, near-black text, a purple-pink
accent — this was the first of the two directions given ("light background
with purple and pink or black copy, or black background with white copy");
the black-background option isn't available without a separate
white/inverted version of the logo, which doesn't exist yet.

| Role | Default hex |
|---|---|
| Background | `#ffffff` |
| Text | `#111111` |
| Accent | `#c026d3` |

If you want a dark-mode variant later, I'd need an inverted (white) copy
of the logo — either a separate file you provide, or I can generate one by
inverting the black pixels in `logo-mark.png` programmatically (a direct
color transform of your own asset, not a redesign).

Update the three `<input type="color">` defaults in `index.html` (search
for `bgColor`, `textColor`, `accentColor`) if you want different exact
hex values.
