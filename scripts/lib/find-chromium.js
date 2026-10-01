const fs = require("fs");
const path = require("path");

/**
 * Locate the pre-installed Chromium binary under PLAYWRIGHT_BROWSERS_PATH.
 * Hardcoding a specific revision (e.g. "chromium-1194") would break silently
 * whenever the pre-installed browser is upgraded, so this globs for whatever
 * "chromium-*" build is actually present.
 */
function findChromiumExecutable() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!fs.existsSync(base)) return null;

  const candidates = fs.readdirSync(base).filter((name) => /^chromium-\d+$/.test(name));
  for (const dir of candidates) {
    const exe = path.join(base, dir, "chrome-linux", "chrome");
    if (fs.existsSync(exe)) return exe;
  }
  return null;
}

module.exports = { findChromiumExecutable };
