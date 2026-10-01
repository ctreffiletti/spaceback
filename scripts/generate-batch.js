#!/usr/bin/env node
/*
 * Selects 2 items from data/quotes-data.js that haven't been used recently
 * (one Fact/Stat + one from the next theme in rotation), renders each to a
 * PNG via a headless browser, and records the batch in data/post-history.json.
 *
 * Usage: node scripts/generate-batch.js [--format 1080x1350]
 *
 * This script only produces files on disk — it does not send email or
 * publish anything. That's the calling agent's job (see README.md).
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { findChromiumExecutable } = require("./lib/find-chromium");

const ROOT = path.resolve(__dirname, "..");
const HISTORY_PATH = path.join(ROOT, "data", "post-history.json");
const CONTENT_LIBRARY = require(path.join(ROOT, "data", "quotes-data.js"));

const QUOTE_THEME_ROTATION = ["creative-performance", "ai-creative", "creative-fatigue", "format-innovation"];

function loadHistory() {
  if (!fs.existsSync(HISTORY_PATH)) {
    return { usedLog: [], lastQuoteThemeIndex: -1, lastQuoteTemplateWasClassic: false, batches: [] };
  }
  return JSON.parse(fs.readFileSync(HISTORY_PATH, "utf8"));
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2) + "\n");
}

function lastUsedDate(history, id) {
  let last = null;
  for (const entry of history.usedLog) {
    if (entry.id === id && (!last || entry.date > last)) last = entry.date;
  }
  return last;
}

function pickLeastRecentlyUsed(history, candidates) {
  return candidates
    .slice()
    .sort((a, b) => {
      const da = lastUsedDate(history, a.id);
      const db = lastUsedDate(history, b.id);
      if (da === db) return a.id.localeCompare(b.id);
      if (!da) return -1; // never used comes first
      if (!db) return 1;
      return da.localeCompare(db); // older date first
    })[0];
}

function selectBatch(history) {
  const items = CONTENT_LIBRARY.items.filter((i) => i.theme !== "brand");
  const facts = items.filter((i) => i.theme === "facts");
  const nextThemeIndex = (history.lastQuoteThemeIndex + 1) % QUOTE_THEME_ROTATION.length;
  const nextTheme = QUOTE_THEME_ROTATION[nextThemeIndex];
  const themedQuotes = items.filter((i) => i.theme === nextTheme);

  const factPick = pickLeastRecentlyUsed(history, facts);
  const quotePick = pickLeastRecentlyUsed(history, themedQuotes);

  return { factPick, quotePick, nextThemeIndex };
}

function templateForItem(item, history, isSecondPick) {
  if (item.type === "fact") return "statement";
  // Alternate quote template each batch so the feed doesn't feel repetitive.
  return history.lastQuoteTemplateWasClassic ? "statement" : "classic";
}

async function renderItem(page, item, template, format, outPath) {
  await page.evaluate((id) => window.QuoteCardApp.loadItem(id), item.id);
  await page.evaluate((t) => window.QuoteCardApp.setTemplate(t), template);
  await page.evaluate((f) => window.QuoteCardApp.setFormat(f), format);
  await page.evaluate(() => window.QuoteCardApp.ready());
  await page.waitForTimeout(150); // let the font-swap repaint settle
  const dataUrl = await page.evaluate(() => window.QuoteCardApp.exportPNGDataUrl());
  const base64 = dataUrl.split(",")[1];
  fs.writeFileSync(outPath, Buffer.from(base64, "base64"));
}

function suggestedCaption(item) {
  if (item.type === "fact") {
    return `${item.text} (Source: ${item.source})`;
  }
  return `"${item.text}" — ${item.author}`;
}

async function main() {
  const formatArgIdx = process.argv.indexOf("--format");
  const format = formatArgIdx !== -1 ? process.argv[formatArgIdx + 1] : "1080x1350";

  const history = loadHistory();
  const { factPick, quotePick, nextThemeIndex } = selectBatch(history);

  if (!factPick || !quotePick) {
    throw new Error("Could not select two items — check data/quotes-data.js has fact and themed quote entries.");
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  // Include the time, not just the date, so a same-day rerun (manual testing,
  // a retry) gets its own folder instead of silently overwriting a prior
  // batch's PNGs out from under its history record.
  const batchId = now.toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(ROOT, "generated", batchId);
  fs.mkdirSync(outDir, { recursive: true });

  const chromiumPath = findChromiumExecutable();
  const browser = await chromium.launch({
    executablePath: chromiumPath || undefined,
    args: ["--no-sandbox", "--headless=new"],
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto("file://" + path.join(ROOT, "index.html"));
  await page.waitForTimeout(300);

  const picks = [factPick, quotePick];
  const templates = picks.map((item) => templateForItem(item, history));
  const files = [];

  for (let i = 0; i < picks.length; i++) {
    const outPath = path.join(outDir, `card-${i + 1}.png`);
    await renderItem(page, picks[i], templates[i], format, outPath);
    files.push(path.relative(ROOT, outPath));
  }

  await browser.close();

  history.usedLog.push({ id: factPick.id, date: today }, { id: quotePick.id, date: today });
  if (history.usedLog.length > 60) history.usedLog = history.usedLog.slice(-60);
  history.lastQuoteThemeIndex = nextThemeIndex;
  history.lastQuoteTemplateWasClassic = templates[1] === "classic";

  const batchRecord = {
    batchId,
    createdAt: new Date().toISOString(),
    format,
    status: "pending",
    items: picks.map((item, i) => ({
      itemId: item.id,
      theme: item.theme,
      type: item.type,
      template: templates[i],
      text: item.text,
      author: item.author || null,
      source: item.source || null,
      sourceUrl: item.sourceUrl || null,
      file: files[i],
      suggestedCaption: suggestedCaption(item),
    })),
  };
  history.batches.push(batchRecord);
  if (history.batches.length > 100) history.batches = history.batches.slice(-100);

  saveHistory(history);

  // Emit the batch as JSON on stdout so the calling agent can read it
  // directly without re-parsing post-history.json.
  console.log(JSON.stringify(batchRecord, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
