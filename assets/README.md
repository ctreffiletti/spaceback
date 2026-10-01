# Brand assets

Nothing's here yet — this app currently falls back to a text wordmark
("SPACEBACK") in a thin divider at the top of each card, and a placeholder
color palette (near-black background, off-white text, orange-red accent).
Both are easy to swap once you have real brand assets.

## Adding the real logo

1. Drop your logo file here as `logo-mark.png` — ideally a square (or
   near-square) crop with a transparent background and tight margins
   around the mark itself. (For The Social Fabric's version of this tool,
   the master file had a lot of transparent padding around a circular
   badge, which made the auto-placed logo render too small — it had to be
   cropped to the mark's actual bounding box first. Check for the same
   issue here before dropping the file in.)
2. Run `node scripts/embed-logo.js`. This regenerates
   `assets/logo-mark-embed.js`, which is what the app actually loads (as
   an embedded `data:` URI, not a plain file reference — see the comment
   at the top of that script for why: a plain `<img src="...">` pointed at
   a local file taints the canvas and silently breaks every download).
3. Reload the app — the logo should now appear centered at the top of
   every template, sized to ~20% of the card's height.

## Colors

Update the three `<input type="color">` defaults in `index.html` (search
for `bgColor`, `textColor`, `accentColor`) once you have exact brand hex
values. If you want them sampled directly from the logo file the way The
Social Fabric's accent color was (reading the dominant opaque pixel color
out of the PNG), ask and I'll do the same here.
