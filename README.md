# Spaceback — Quote Card Studio

A local web app for building branded quote/stat card graphics (same tool
built for The Social Fabric, repointed at Spaceback's content): large bold
text, a single-color background, a highlighted phrase in your accent
color. Plus a scheduled pipeline that generates two new candidate posts
every 3 days, builds a review page, and emails you a link to pick and
download one.

No build step, no server required.

## Run it

Open `index.html` in a browser. Everything runs client-side.

```
cd spaceback
python3 -m http.server 8000
# then open http://localhost:8000
```

(only needed if your browser blocks local file access for anything)

## How it works

Same as The Social Fabric's version of this tool:

1. **Pull from library** — pick a theme (Facts & Stats, Creative Is The
   New Targeting, AI for Creative Production, Why More Creative Wins,
   Social-Native Ad Formats) and an item, then "Load into editor."
2. **Content** — edit freely: text, highlight phrase(s), attribution or
   source.
3. **Template & format** — Bold Statement / Photo Background / Classic
   Centered Quote, at Feed 4:5 (recommended), Square, or Story.
4. **Brand look** — colors, font, wordmark text. See `assets/README.md`
   for dropping in the real logo once you have it.
5. **Download PNG**, or **Add to batch queue** to stack up several at once
   and download them as a `.zip`.

## Editing the content library

Everything lives in `data/quotes-data.js` as a plain array. Current themes:

- **Facts & Stats** — sourced industry data on creative effectiveness, AI
  adoption in creative production, and creative fatigue. Several entries
  are marked `verify: true` — these are numbers widely cited across
  ad-tech marketing blogs that I could not trace back to a primary report.
  **Check the primary source before using a `verify: true` stat anywhere
  with real stakes** (a client deck, a paid placement) — secondary blogs
  in this space reword and round survey numbers a lot. The ones *not*
  flagged (Nielsen Catalina Solutions' sales-lift breakdown, the WARC/Kantar
  creative-ROI research, the Gartner-cited AI adoption figure) came from
  sources I'd call reasonably solid, but "reasonably solid secondary
  reporting" is still not the same as pulling the number from NCS's or
  WARC's own report directly — worth doing that pull yourself before
  anything high-stakes.
- **Creative Is The New Targeting** — verified quotes from Ogilvy,
  Bernbach, and Leo Burnett (all long-established, safely attributed ad
  history, not recent/uncertain attributions).
  **How you can use AI to create more creative**, **Why more creative
  drives better performance**, and **Social-Native Ad Formats** mostly use
  Spaceback-original lines (`author: "Spaceback"`) rather than borrowed
  quotes, since there isn't an equivalent canon of safely-attributable
  historical quotes on those newer topics the way there is for classic ad
  creative. Swap in real client quotes, your own research, or quotes from
  people at Spaceback as you get them — there's a placeholder item showing
  the format.

## The scheduled batch pipeline

Q4's content rotates between two fixed campaign themes (`campaigns` in
`data/quotes-data.js`): **Creative Is The New Targeting** and **Make Every
Impression A Spaceback Impression**. Every batch generates exactly one post
per theme — never two of the same — so the reviewer always has a choice of
which theme to post that cycle. Each item in the library carries a
`campaign` field tagging which of the two it belongs to.

`scripts/generate-batch.js` picks the least-recently-used item from each
campaign's pool, renders both to PNG (banner with the campaign name at the
top of the card, Spaceback logo centered at the bottom), and records the
pick in `data/post-history.json`. `scripts/build-review-page.js` turns that
batch into a standalone review page (`review/template.html`) meant to be
published as a Claude Artifact with the `downloads` capability, so there's
a working download button without exposing any secrets client-side.

This mirrors The Social Fabric's setup exactly — same self-rescheduling
trigger, every 3 days, emailing the two picks and a link to the review
page. The email never mentions The Social Fabric by name — this is a
separate project with its own recipient.

## Known gaps vs. the Social Fabric setup

- **No LinkedIn/Instagram API connection** — same situation as The Social
  Fabric: downloading and posting manually is the whole flow for now.
- **No dark-mode variant** — the real logo is black ink, so only the
  light-background palette is available until there's an inverted/white
  version of it. See `assets/README.md`.
