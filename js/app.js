(() => {
  "use strict";

  const canvas = document.getElementById("cardCanvas");
  const ctx = canvas.getContext("2d");

  const el = (id) => document.getElementById(id);
  const themeFilter = el("themeFilter");
  const itemPicker = el("itemPicker");
  const loadItemBtn = el("loadItemBtn");
  const cardType = el("cardType");
  const mainText = el("mainText");
  const highlightText = el("highlightText");
  const authorText = el("authorText");
  const sourceText = el("sourceText");
  const template = el("template");
  const format = el("format");
  const bgColor = el("bgColor");
  const textColor = el("textColor");
  const accentColor = el("accentColor");
  const fontFamily = el("fontFamily");
  const wordmark = el("wordmark");
  const photoGroup = el("photoGroup");
  const bgImageInput = el("bgImageInput");
  const dimSlider = el("dimSlider");
  const dimVal = el("dimVal");
  const logoInput = el("logoInput");
  const clearLogoBtn = el("clearLogoBtn");
  const downloadBtn = el("downloadBtn");
  const queueBtn = el("queueBtn");
  const downloadAllBtn = el("downloadAllBtn");
  const clearQueueBtn = el("clearQueueBtn");
  const queueGrid = el("queueGrid");
  const queueCount = el("queueCount");
  const downloadStatus = el("downloadStatus");

  let bgImage = null;
  let logoImage = null;
  const queue = []; // { name, dataUrl }

  // ---------- Library selectors ----------
  function populateThemeFilter() {
    CONTENT_LIBRARY.themes.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.label;
      themeFilter.appendChild(opt);
    });
  }

  function populateItemPicker() {
    const theme = themeFilter.value;
    itemPicker.innerHTML = "";
    CONTENT_LIBRARY.items
      .filter((i) => i.theme === theme)
      .forEach((i) => {
        const opt = document.createElement("option");
        opt.value = i.id;
        opt.textContent = i.text.slice(0, 60) + (i.text.length > 60 ? "…" : "");
        itemPicker.appendChild(opt);
      });
  }

  function campaignLabel(campaignId) {
    const campaign = (CONTENT_LIBRARY.campaigns || []).find((c) => c.id === campaignId);
    return campaign ? campaign.label : null;
  }

  function loadItemIntoEditor(overrideId) {
    const item = CONTENT_LIBRARY.items.find((i) => i.id === (overrideId || itemPicker.value));
    if (!item) return;
    cardType.value = item.type;
    mainText.value = item.text;
    const hl = Array.isArray(item.highlight) ? item.highlight.join(", ") : (item.highlight || "");
    highlightText.value = hl;
    authorText.value = item.author || "";
    sourceText.value = item.source || "";
    // The banner at the top of the card shows this item's Q4 campaign theme
    // when it has one, so a library pick always surfaces the right theme.
    const label = campaignLabel(item.campaign);
    if (label) wordmark.value = label;
    toggleAttributionFields();
    render();
  }

  // ---------- Format / template wiring ----------
  function applyFormat() {
    const [w, h] = format.value.split("x").map(Number);
    canvas.width = w;
    canvas.height = h;
    render();
  }

  function toggleAttributionFields() {
    const isFact = cardType.value === "fact";
    authorText.style.display = isFact ? "none" : "block";
    sourceText.style.display = isFact ? "block" : "none";
  }

  function togglePhotoGroup() {
    photoGroup.hidden = template.value !== "photo";
    render();
  }

  // ---------- Text layout helpers ----------
  function parseHighlights() {
    return highlightText.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Break the text into word tokens, marking which words fall inside a highlight phrase.
  function tokenize(text, highlights) {
    const words = text.split(/\s+/).filter(Boolean);
    const flags = new Array(words.length).fill(false);
    const lowerWords = words.map((w) => w.toLowerCase().replace(/[.,!?;:'"]/g, ""));

    highlights.forEach((phrase) => {
      const phraseWords = phrase
        .toLowerCase()
        .split(/\s+/)
        .map((w) => w.replace(/[.,!?;:'"]/g, ""))
        .filter(Boolean);
      if (!phraseWords.length) return;
      for (let i = 0; i <= lowerWords.length - phraseWords.length; i++) {
        let match = true;
        for (let j = 0; j < phraseWords.length; j++) {
          if (lowerWords[i + j] !== phraseWords[j]) { match = false; break; }
        }
        if (match) {
          for (let j = 0; j < phraseWords.length; j++) flags[i + j] = true;
        }
      }
    });

    return words.map((w, i) => ({ text: w, hl: flags[i] }));
  }

  function wrapTokens(tokens, maxWidth) {
    const spaceWidth = ctx.measureText(" ").width;
    const lines = [];
    let current = [];
    let currentWidth = 0;

    tokens.forEach((tok) => {
      const w = ctx.measureText(tok.text).width;
      const addWidth = current.length ? spaceWidth + w : w;
      if (currentWidth + addWidth > maxWidth && current.length) {
        lines.push(current);
        current = [tok];
        currentWidth = w;
      } else {
        current.push(tok);
        currentWidth += addWidth;
      }
    });
    if (current.length) lines.push(current);
    return lines;
  }

  function fitStyledText(tokens, maxWidth, maxHeight, family, weight, maxSize, minSize, lineHeightMult, uppercase) {
    let size = maxSize;
    let lines = [];
    const upTokens = uppercase
      ? tokens.map((t) => ({ text: t.text.toUpperCase(), hl: t.hl }))
      : tokens;

    while (size >= minSize) {
      ctx.font = `${weight} ${size}px ${family}`;
      lines = wrapTokens(upTokens, maxWidth);
      const totalHeight = lines.length * size * lineHeightMult;
      if (totalHeight <= maxHeight) break;
      size -= 2;
    }
    return { size: Math.max(size, minSize), lines };
  }

  function drawStyledLines(lines, size, lineHeightMult, centerX, startY, baseColor, accentColor, weight, family) {
    ctx.font = `${weight} ${size}px ${family}`;
    ctx.textBaseline = "alphabetic";
    const spaceWidth = ctx.measureText(" ").width;
    const lineHeight = size * lineHeightMult;

    lines.forEach((line, idx) => {
      const widths = line.map((t) => ctx.measureText(t.text).width);
      const totalWidth = widths.reduce((a, b) => a + b, 0) + spaceWidth * (line.length - 1);
      let x = centerX - totalWidth / 2;
      const y = startY + idx * lineHeight;
      line.forEach((tok, i) => {
        ctx.fillStyle = tok.hl ? accentColor : baseColor;
        ctx.fillText(tok.text, x, y);
        x += widths[i] + spaceWidth;
      });
    });

    return lines.length * lineHeight;
  }

  // ---------- Divider / theme banner ----------
  // Shows the campaign theme name at the top of every card. Auto-fits the
  // font size down so a long label ("MAKE EVERY IMPRESSION A SPACEBACK
  // IMPRESSION") still fits the card width with room for flanking lines,
  // without needing a different layout for short vs. long labels.
  function drawDivider(cx, y, label, color, canvasWidth) {
    ctx.save();
    const text = (label || "").toUpperCase();
    const maxTextWidth = canvasWidth * 0.62;
    let fontSize = Math.round(canvasWidth * 0.024);
    const minFontSize = Math.round(canvasWidth * 0.013);
    let textWidth;
    while (true) {
      ctx.font = `600 ${fontSize}px 'Poppins', sans-serif`;
      ctx.letterSpacing = fontSize >= canvasWidth * 0.02 ? "3px" : "1.5px";
      textWidth = ctx.measureText(text).width;
      if (textWidth <= maxTextWidth || fontSize <= minFontSize) break;
      fontSize -= 1;
    }
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.fillText(text, cx, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    const lineLen = Math.max(canvasWidth * 0.06, (canvasWidth * 0.86 - textWidth) / 2 - 20);
    const gap = 14;
    const lineY = y - fontSize * 0.35;
    ctx.beginPath();
    ctx.moveTo(cx - textWidth / 2 - gap - lineLen, lineY);
    ctx.lineTo(cx - textWidth / 2 - gap, lineY);
    ctx.moveTo(cx + textWidth / 2 + gap, lineY);
    ctx.lineTo(cx + textWidth / 2 + gap + lineLen, lineY);
    ctx.stroke();
    ctx.restore();
  }

  // Brand mark, centered near the bottom of every template. Fit ("contain")
  // within a maxWidthRatio x maxHeightRatio box so it works for both a
  // roughly-square mark and a wide horizontal lockup. Returns the total
  // vertical space it (plus its bottom margin) used, 0 if no logo is
  // loaded, so callers can keep body text clear of it.
  function drawBottomLogo(w, h, bottomMarginRatio, maxWidthRatio, maxHeightRatio, { backdrop = false } = {}) {
    if (!logoImage) return 0;
    let logoW = w * maxWidthRatio;
    let logoH = logoW * (logoImage.height / logoImage.width);
    if (logoH > h * maxHeightRatio) {
      logoH = h * maxHeightRatio;
      logoW = logoH * (logoImage.width / logoImage.height);
    }
    const x = w / 2 - logoW / 2;
    const bottomMargin = h * bottomMarginRatio;
    const y = h - bottomMargin - logoH;

    if (backdrop) {
      ctx.save();
      // Spaceback's mark is black ink — a dark backdrop (right for a gold
      // mark) would hide it. Use a light chip instead so it stays legible
      // over any photo.
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      const pad = logoH * 0.35;
      ctx.beginPath();
      ctx.roundRect(x - pad, y - pad, logoW + pad * 2, logoH + pad * 2, logoH * 0.3);
      ctx.fill();
      ctx.restore();
    }

    ctx.drawImage(logoImage, x, y, logoW, logoH);
    return bottomMargin + logoH;
  }

  function coverDraw(img, w, h) {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let sx, sy, sw, sh;
    if (imgRatio > canvasRatio) {
      sh = img.height;
      sw = sh * canvasRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / canvasRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  }

  // ---------- Master render ----------
  function render() {
    const w = canvas.width;
    const h = canvas.height;
    const tpl = template.value;
    const family = fontFamily.value;
    const base = textColor.value;
    const accent = accentColor.value;
    const isFact = cardType.value === "fact";
    const text = mainText.value.trim() || " ";
    const tokens = tokenize(text, parseHighlights());

    ctx.clearRect(0, 0, w, h);

    // ---- Background ----
    if (tpl === "photo" && bgImage) {
      coverDraw(bgImage, w, h);
      const grad = ctx.createLinearGradient(0, h * 0.35, 0, h);
      const dim = Number(dimSlider.value) / 100;
      grad.addColorStop(0, `rgba(0,0,0,0)`);
      grad.addColorStop(1, `rgba(0,0,0,${dim + 0.25})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = bgColor.value;
      ctx.fillRect(0, 0, w, h);
    }

    const marginX = w * 0.1;
    const maxWidth = w - marginX * 2;

    if (tpl === "statement") {
      drawDivider(w / 2, h * 0.095, wordmark.value || "SPACEBACK", accent, w);
      const areaTop = h * 0.19;
      const areaBottom = h * 0.76;
      const { size, lines } = fitStyledText(
        tokens, maxWidth, areaBottom - areaTop, family, 900, w * 0.09, w * 0.03, 1.15, true
      );
      const totalTextHeight = lines.length * size * 1.15;
      const startY = areaTop + (areaBottom - areaTop - totalTextHeight) / 2 + size * 0.85;
      ctx.textAlign = "left";
      const usedHeight = drawStyledLines(lines, size, 1.15, w / 2, startY, base, accent, 900, family);

      if (isFact && sourceText.value.trim()) {
        ctx.save();
        ctx.font = `500 ${Math.round(w * 0.02)}px 'Poppins', sans-serif`;
        ctx.fillStyle = base;
        ctx.globalAlpha = 0.6;
        ctx.textAlign = "center";
        ctx.fillText("Source: " + sourceText.value.trim(), w / 2, startY + usedHeight - size * 1.15 + size * 1.6);
        ctx.restore();
      } else if (!isFact && authorText.value.trim()) {
        ctx.save();
        ctx.font = `600 ${Math.round(w * 0.03)}px 'Poppins', sans-serif`;
        ctx.fillStyle = accent;
        ctx.textAlign = "center";
        ctx.fillText("~ " + authorText.value.trim().toUpperCase(), w / 2, startY + usedHeight - size * 1.15 + size * 1.7);
        ctx.restore();
      }

      drawBottomLogo(w, h, 0.045, 0.42, 0.065);

    } else if (tpl === "photo") {
      // A dark scrim band behind the top banner so it stays legible
      // regardless of the photo underneath (the existing bottom gradient
      // only darkens the lower half of the frame).
      const topScrim = ctx.createLinearGradient(0, 0, 0, h * 0.22);
      topScrim.addColorStop(0, "rgba(0,0,0,0.55)");
      topScrim.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topScrim;
      ctx.fillRect(0, 0, w, h * 0.22);
      drawDivider(w / 2, h * 0.095, wordmark.value || "SPACEBACK", "#ffffff", w);

      const areaTop = h * 0.55;
      const areaBottom = h * 0.92;
      const { size, lines } = fitStyledText(
        tokens, maxWidth, areaBottom - areaTop, family, 900, w * 0.075, w * 0.028, 1.12, true
      );
      ctx.textAlign = "left";
      let y = areaTop + size * 0.9;
      const usedHeight = drawStyledLines(lines, size, 1.12, w / 2, y, "#ffffff", accent, 900, family);

      if (!isFact && authorText.value.trim()) {
        ctx.save();
        ctx.font = `600 ${Math.round(w * 0.028)}px 'Poppins', sans-serif`;
        ctx.fillStyle = accent;
        ctx.textAlign = "center";
        ctx.fillText("~ " + authorText.value.trim().toUpperCase(), w / 2, y + usedHeight - size * 1.12 + size * 1.6);
        ctx.restore();
      } else if (isFact && sourceText.value.trim()) {
        ctx.save();
        ctx.font = `500 ${Math.round(w * 0.018)}px 'Poppins', sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.75;
        ctx.textAlign = "center";
        ctx.fillText("Source: " + sourceText.value.trim(), w / 2, y + usedHeight - size * 1.12 + size * 1.5);
        ctx.restore();
      }

      drawBottomLogo(w, h, 0.045, 0.4, 0.06, { backdrop: true });

    } else if (tpl === "classic") {
      drawDivider(w / 2, h * 0.11, wordmark.value || "SPACEBACK", accent, w);
      const areaTop = h * 0.2;

      const areaBottom = h * 0.74;
      const { size, lines } = fitStyledText(
        tokens, maxWidth, areaBottom - areaTop, family, 700, w * 0.07, w * 0.026, 1.25, false
      );
      const totalTextHeight = lines.length * size * 1.25;
      const startY = areaTop + (areaBottom - areaTop - totalTextHeight) / 2 + size * 0.85;
      ctx.textAlign = "left";
      const usedHeight = drawStyledLines(lines, size, 1.25, w / 2, startY, base, accent, 700, family);

      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const lineY = startY + usedHeight - size * 1.25 + size * 1.1;
      ctx.moveTo(w / 2 - w * 0.06, lineY);
      ctx.lineTo(w / 2 + w * 0.06, lineY);
      ctx.stroke();
      ctx.restore();

      const label = isFact ? sourceText.value.trim() : authorText.value.trim();
      if (label) {
        ctx.save();
        ctx.font = `600 ${Math.round(w * 0.026)}px 'Poppins', sans-serif`;
        ctx.fillStyle = base;
        ctx.globalAlpha = 0.85;
        ctx.textAlign = "center";
        ctx.fillText((isFact ? "Source: " : "") + label.toUpperCase(), w / 2, lineY + size * 0.9);
        ctx.restore();
      }

      drawBottomLogo(w, h, 0.045, 0.42, 0.065);
    }
  }

  // ---------- Image uploads ----------
  function loadImageFromInput(input, onLoaded) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { onLoaded(img); render(); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ---------- Queue ----------
  function renderQueue() {
    queueCount.textContent = `(${queue.length})`;
    queueGrid.innerHTML = "";
    if (!queue.length) {
      queueGrid.innerHTML = '<p class="queue-empty">Nothing queued yet — build a card, then "Add to batch queue".</p>';
      return;
    }
    queue.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "queue-item";
      div.innerHTML = `
        <img src="${item.dataUrl}" alt="${item.name}">
        <div class="queue-item-actions">
          <button data-action="download" data-idx="${idx}">Download</button>
          <button data-action="remove" data-idx="${idx}">Remove</button>
        </div>`;
      queueGrid.appendChild(div);
    });
  }

  queueGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const idx = Number(btn.dataset.idx);
    const item = queue[idx];
    if (btn.dataset.action === "download") {
      triggerDownload(item.dataUrl, item.name);
    } else if (btn.dataset.action === "remove") {
      queue.splice(idx, 1);
      renderQueue();
    }
  });

  // In a plain browser, saving a file is a simple <a download> click. Inside
  // the Claude Artifacts preview sandbox, that link is inert — pages there
  // must hand the file to the platform's own save prompt instead. This
  // resolves that capability once, and is a no-op (null) outside that sandbox.
  const inClaudeHost = typeof window !== "undefined" && !!window.claude && typeof window.claude.use === "function";
  let downloadsCapabilityPromise = null;
  function getDownloadsCapability() {
    if (downloadsCapabilityPromise) return downloadsCapabilityPromise;
    downloadsCapabilityPromise = inClaudeHost ? window.claude.use("downloads").catch(() => null) : Promise.resolve(null);
    return downloadsCapabilityPromise;
  }

  function anchorDownload(href, name) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function setDownloadStatus(msg, isError) {
    if (!downloadStatus) return;
    downloadStatus.textContent = msg;
    downloadStatus.classList.toggle("error", !!isError);
  }

  // Decodes a data: URL straight into a Blob with no network involved.
  // Some sandboxed hosts restrict fetch() even against same-page data:
  // URIs (a CSP connect-src gap), which is a needless dependency here —
  // base64 decoding is synchronous and local.
  function dataUrlToBlob(dataUrl) {
    const [header, base64] = dataUrl.split(",");
    const mime = (header.match(/data:(.*?);base64/) || [, "application/octet-stream"])[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  // Accepts either a data: URL (e.g. from canvas.toDataURL) or a Blob.
  async function triggerDownload(dataUrlOrBlob, name) {
    if (inClaudeHost) {
      // Only the platform's own save capability can deliver a file here —
      // a plain <a download> link is inert in this sandbox, so if the
      // capability isn't available or rejects, that's a real dead end to
      // report, not something to silently paper over with a fallback that
      // would just look like it did nothing (which is exactly the bug this
      // once was).
      setDownloadStatus("Saving…");
      try {
        const downloads = await getDownloadsCapability();
        if (!downloads) {
          setDownloadStatus("Download isn't available in this view — the platform didn't grant the save capability here. Try reloading the page, or opening it fresh from claude.ai.", true);
          return;
        }
        const blob = dataUrlOrBlob instanceof Blob ? dataUrlOrBlob : dataUrlToBlob(dataUrlOrBlob);
        const result = await downloads.save({ filename: name, data: blob });
        setDownloadStatus(result.status === "delivered" ? "Sent." : "Saved.");
      } catch (err) {
        if (err && err.code === "declined") { setDownloadStatus("Cancelled."); return; }
        const detail = (err && err.code) || (err && err.message) || String(err);
        setDownloadStatus(`Download failed: ${detail}`, true);
        console.warn("downloads.save failed:", err);
      }
      return;
    }

    // Plain browser or a local file:// page — the ordinary link-click
    // download works fine here.
    if (dataUrlOrBlob instanceof Blob) {
      const url = URL.createObjectURL(dataUrlOrBlob);
      anchorDownload(url, name);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else {
      anchorDownload(dataUrlOrBlob, name);
    }
    setDownloadStatus("Downloaded.");
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "card";
  }

  // ---------- Events ----------
  themeFilter.addEventListener("change", populateItemPicker);
  loadItemBtn.addEventListener("click", loadItemIntoEditor);

  [mainText, highlightText, authorText, sourceText, bgColor, textColor, accentColor, fontFamily, wordmark]
    .forEach((elm) => elm.addEventListener("input", render));

  cardType.addEventListener("change", () => { toggleAttributionFields(); render(); });
  template.addEventListener("change", togglePhotoGroup);
  format.addEventListener("change", applyFormat);

  dimSlider.addEventListener("input", () => {
    dimVal.textContent = dimSlider.value + "%";
    render();
  });

  bgImageInput.addEventListener("change", () => loadImageFromInput(bgImageInput, (img) => { bgImage = img; }));
  logoInput.addEventListener("change", () => loadImageFromInput(logoInput, (img) => { logoImage = img; }));
  clearLogoBtn.addEventListener("click", () => { logoImage = null; logoInput.value = ""; render(); });

  downloadBtn.addEventListener("click", () => {
    const name = `spaceback-${slugify(mainText.value)}-${Date.now()}.png`;
    triggerDownload(canvas.toDataURL("image/png"), name);
  });

  queueBtn.addEventListener("click", () => {
    queue.push({ name: `spaceback-${slugify(mainText.value)}-${queue.length + 1}.png`, dataUrl: canvas.toDataURL("image/png") });
    renderQueue();
  });

  clearQueueBtn.addEventListener("click", () => { queue.length = 0; renderQueue(); });

  downloadAllBtn.addEventListener("click", async () => {
    if (!queue.length) return;

    if (typeof JSZip === "undefined") {
      // The zip library (loaded from a CDN) didn't load — likely blocked by a
      // network policy. Fall back to downloading each PNG individually.
      queue.forEach((item) => triggerDownload(item.dataUrl, item.name));
      return;
    }

    const zip = new JSZip();
    queue.forEach((item) => {
      const base64 = item.dataUrl.split(",")[1];
      zip.file(item.name, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    triggerDownload(blob, `spaceback-batch-${Date.now()}.zip`);
  });

  // ---------- Init ----------
  function tryLoadDefaultLogo() {
    // Loaded from the embedded data: URI (assets/logo-mark-embed.js), not
    // fetched as a plain file — an <img> pointed at a local file:// path
    // taints the canvas (blocks every download) even though it renders
    // fine on screen. A data: URI never taints it. Regenerate the embed
    // with `node scripts/embed-logo.js` after replacing assets/logo-mark.png.
    if (typeof window.DEFAULT_LOGO_DATA_URL !== "string") return;
    const img = new Image();
    img.onload = () => { logoImage = img; render(); };
    img.onerror = () => {};
    img.src = window.DEFAULT_LOGO_DATA_URL;
  }

  function init() {
    populateThemeFilter();
    populateItemPicker();
    toggleAttributionFields();
    togglePhotoGroup();
    renderQueue();
    tryLoadDefaultLogo();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(render);
    }
    render();
  }

  // ---------- Headless scripting hook ----------
  // Used by scripts/generate-batch.js (Playwright) to drive the app without
  // simulating clicks — set an item/template/format, wait for fonts, then
  // pull the finished PNG straight off the canvas.
  window.QuoteCardApp = {
    loadItem: (id) => loadItemIntoEditor(id),
    setTemplate: (t) => { template.value = t; togglePhotoGroup(); },
    setFormat: (f) => { format.value = f; applyFormat(); },
    setColors: ({ bg, text, accent } = {}) => {
      if (bg) bgColor.value = bg;
      if (text) textColor.value = text;
      if (accent) accentColor.value = accent;
      render();
    },
    ready: () => (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve(),
    exportPNGDataUrl: () => canvas.toDataURL("image/png"),
  };

  init();
})();
