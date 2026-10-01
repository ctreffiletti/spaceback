# Brand assets

- `logo-mark.png` — the real Spaceback by Rembrand lockup (astronaut mark +
  wordmark + "by REMBRAND" badge), black ink, already tightly cropped (no
  padding to trim). It's a wide horizontal lockup (~4:1), not square —
  `drawBottomLogo` in `js/app.js` fits it within a width AND height box
  ("contain" sizing), not just a height ratio, which is what a square
  logo like The Social Fabric's could get away with. It's anchored near the
  bottom of every card; the campaign theme name is the banner at the top.
- `logo-mark-embed.js` — **this is what the app actually auto-loads**, not
  `logo-mark.png` directly. It's `logo-mark.png` re-encoded as a `data:`
  URI. An `<img>` pointed straight at a local `file://` image taints the
  canvas it's drawn onto (blocks every download, even though it still
  renders fine on screen) — a `data:` URI never does. **After replacing
  `logo-mark.png`, regenerate this file** with `node scripts/embed-logo.js`
  — nothing updates automatically otherwise.

## Colors

The default palette is the light one: white background, near-black text, a
purple-pink accent.

| Role | Default hex |
|---|---|
| Background | `#ffffff` |
| Text | `#111111` |
| Accent | `#c026d3` |

The scheduled batch pipeline also renders a dark variant of every pick
(black background `#000000`, white text, same accent). Since the logo is
black ink, it can't just sit on a black background — `drawBottomLogo` in
`js/app.js` checks the background's luminance and automatically draws a
white backdrop chip behind the logo whenever the background is dark, so the
dark-mode cards don't need a separate inverted/white copy of the logo at
all; this applies to manual edits in the Studio too (pick a dark background
color and the chip appears automatically).

Update the three `<input type="color">` defaults in `index.html` (search
for `bgColor`, `textColor`, `accentColor`) if you want different exact
hex values.
