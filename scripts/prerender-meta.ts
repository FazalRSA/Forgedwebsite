/**
 * Runs after `vite build`. Writes one HTML file per indexable page into dist/ with that page's
 * title, description, canonical URL, share image and structured data already in <head>.
 *
 * Why: link-preview bots (WhatsApp, Facebook, Slack) and some crawlers do not run JavaScript, so
 * without this every shared link shows the home page's title and picture. The page body is the
 * same app shell; the browser loads the app as usual.
 *
 * Output: dist/<path>.html for every path in the sitemap except the home page, e.g.
 * dist/wheels/fsa002-gold.html and dist/installs.html. Hosts that serve "clean URLs" return that file for
 * /wheels/fsa002-gold; hosts that do not fall back to the single-page rewrite, as before.
 *
 * dist/index.html is left untouched on purpose: it is also the fallback served for every
 * unmatched path, so it must not carry the home page's canonical URL or structured data.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { isHomePath, metaForPath, renderPageHtml, sitemapPaths } from '../src/utils/seo';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const shellPath = path.join(distDir, 'index.html');

try {
  const shell = readFileSync(shellPath, 'utf8');
  let written = 0;
  for (const pagePath of sitemapPaths()) {
    if (isHomePath(pagePath)) continue;
    const html = renderPageHtml(shell, metaForPath(pagePath));
    const target = path.join(distDir, `${pagePath.replace(/^\//, '')}.html`);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, html);
    written += 1;
  }
  console.log(`prerender: wrote page metadata into ${written} HTML files in ${distDir}`);
} catch (err) {
  console.error(`prerender: could not write page HTML from ${shellPath}:`, err);
  process.exit(1);
}
