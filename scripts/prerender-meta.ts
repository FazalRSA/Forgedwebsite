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
 * dist/index.html gets no title, canonical URL or structured data of its own on purpose: it is also
 * the fallback served for every unmatched path. The one thing added to it is a preload for the home
 * page's hero wheel (the first in-stock design's cut-out, which HeroSection shows on wide screens),
 * so the largest picture on the first screen is requested before the app has even loaded. It is
 * computed from the catalogue with the same helper the hero uses, so the preloaded file is exactly
 * the one the <img> asks for. No cut-out, no preload.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getAllBrandWheels } from '../src/data/catalogue';
import { HERO_WHEEL_MEDIA, heroWheelImage } from '../src/utils/designCards';
import { isHomePath, metaForPath, renderPageHtml, sitemapPaths } from '../src/utils/seo';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const shellPath = path.join(distDir, 'index.html');

const escapeAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The <link rel="preload"> for the home page's hero wheel, or '' when no in-stock design has a cut-out. */
export function heroWheelPreload(): string {
  const image = heroWheelImage(getAllBrandWheels());
  if (!image) return '';
  const attrs = [
    'rel="preload"',
    'as="image"',
    `href="${escapeAttribute(image.src)}"`,
    image.srcSet ? `imagesrcset="${escapeAttribute(image.srcSet)}"` : '',
    image.sizes ? `imagesizes="${escapeAttribute(image.sizes)}"` : '',
    `media="${escapeAttribute(HERO_WHEEL_MEDIA)}"`,
    'fetchpriority="high"',
  ].filter(Boolean);
  return `<link ${attrs.join(' ')} />`;
}

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
  // Written last, from the untouched shell, so the per-page files above do not inherit the preload.
  const preload = heroWheelPreload();
  if (preload) {
    if (!shell.includes('</head>')) throw new Error(`${shellPath} has no </head> to add the preload to`);
    writeFileSync(shellPath, shell.replace('</head>', `    ${preload}\n  </head>`));
  }
  console.log(
    `prerender: wrote page metadata into ${written} HTML files in ${distDir}` +
      (preload ? ' and the hero wheel preload into index.html' : '')
  );
} catch (err) {
  console.error(`prerender: could not write page HTML from ${shellPath}:`, err);
  process.exit(1);
}
