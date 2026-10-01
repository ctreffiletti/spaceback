#!/usr/bin/env node
/*
 * Builds review/index.html (gitignored — it embeds the batch's images as
 * base64) from review/template.html and the most recent batch in
 * data/post-history.json. Publish the resulting file as a Claude Artifact
 * (capabilities: { downloads: true }) to give the reviewer a working
 * download button — see README.md for the full cycle.
 *
 * Usage: node scripts/build-review-page.js [batchId]
 *   (defaults to the most recent batch in history)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HISTORY_PATH = path.join(ROOT, "data", "post-history.json");
const CONTENT_LIBRARY = require(path.join(ROOT, "data", "quotes-data.js"));

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function campaignLabel(campaignId) {
  const campaign = (CONTENT_LIBRARY.campaigns || []).find((c) => c.id === campaignId);
  return campaign ? campaign.label : campaignId;
}

function main() {
  const history = JSON.parse(fs.readFileSync(HISTORY_PATH, "utf8"));
  const requestedId = process.argv[2];
  const batch = requestedId
    ? history.batches.find((b) => b.batchId === requestedId)
    : history.batches[history.batches.length - 1];

  if (!batch) throw new Error("No batch found in data/post-history.json.");

  const cards = batch.items.map((item) => {
    const imgPath = path.join(ROOT, item.file);
    const imageDataUrl = "data:image/png;base64," + fs.readFileSync(imgPath).toString("base64");
    return {
      type: item.type,
      campaignLabel: campaignLabel(item.campaign),
      variant: item.variant,
      caption: escapeHtml(item.suggestedCaption),
      plainCaption: item.suggestedCaption,
      sourceUrl: item.sourceUrl || null,
      filename: `spaceback-${batch.batchId.slice(0, 10)}-${item.itemId}-${item.variant}.png`,
      imageDataUrl,
    };
  });

  const template = fs.readFileSync(path.join(__dirname, "..", "review", "template.html"), "utf8");
  const html = template
    .replace("__BATCH_ID__", escapeHtml(batch.batchId.slice(0, 10)))
    .replace("__BATCH_DATE__", escapeHtml(new Date(batch.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })))
    .replace("__CARDS_JSON__", JSON.stringify(cards));

  const outPath = path.join(ROOT, "review", "index.html");
  fs.writeFileSync(outPath, html);
  console.log(outPath);
}

main();
