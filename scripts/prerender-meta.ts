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
 * the fallback served for every unmatched path. Two things are added to it: the Google Search
 * Console ownership tag, when SITE.searchConsoleToken is set (Google reads it from the home page's
 * raw HTML; every page file below carries it too, since they are made from the same shell), and a
 * preload for the home page hero's poster (the brand film's first frame, which HeroSection shows
 * under the film), so the largest picture on the first screen is requested before the app has even
 * loaded. Its srcset and sizes come from src/utils/heroVideo.ts, the same constants the hero's <img>
 * uses, so the preloaded file is exactly the one the <img> asks for.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { HERO_POSTER_SIZES, HERO_POSTER_SRCSET, HERO_VIDEO } from '../src/utils/heroVideo';
import { isHomePath, metaForPath, renderPageHtml, sitemapPaths, withSearchConsoleTag } from '../src/utils/seo';
import { blogStaticHtml } from '../src/components/blog/blogStatic';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const shellPath = path.join(distDir, 'index.html');

const ROOT_MARKER = '<div id="root"></div>';

const escapeAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The <link rel="preload"> for the home page hero's poster, the first frame of the brand film. */
export function heroPosterPreload(): string {
  const attrs = [
    'rel="preload"',
    'as="image"',
    `href="${escapeAttribute(HERO_VIDEO.large.poster)}"`,
    `imagesrcset="${escapeAttribute(HERO_POSTER_SRCSET)}"`,
    `imagesizes="${escapeAttribute(HERO_POSTER_SIZES)}"`,
    'fetchpriority="high"',
  ];
  return `<link ${attrs.join(' ')} />`;
}

try {
  const rawShell = readFileSync(shellPath, 'utf8');
  if (!rawShell.includes('</head>')) throw new Error(`${shellPath} has no </head> to add tags to`);
  // The ownership tag goes into the shell first, so the home page and every page file made from it carry it.
  const shell = withSearchConsoleTag(rawShell);
  const verification = shell !== rawShell;
  let written = 0;
  for (const pagePath of sitemapPaths()) {
    if (isHomePath(pagePath)) continue;
    let html = renderPageHtml(shell, metaForPath(pagePath));
    // Blog pages also get their full text in the HTML, for crawlers that read it before running any
    // JavaScript. The app replaces it on load (see src/components/blog/blogStatic.tsx).
    const blogHtml = blogStaticHtml(pagePath);
    if (blogHtml) {
      if (!html.includes(ROOT_MARKER)) throw new Error(`${shellPath} has no ${ROOT_MARKER} to put the blog text into`);
      html = html.replace(ROOT_MARKER, () => `<div id="root">${blogHtml}</div>`);
    }
    const target = path.join(distDir, `${pagePath.replace(/^\//, '')}.html`);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, html);
    written += 1;
    // The blog hub and each pillar share their name with a folder (/blog and /blog/<pillar> also hold
    // pages). Hosts disagree on whether /blog means blog.html or blog/index.html, so write both and
    // either way the visitor gets this page, never an empty one.
    if (blogHtml && (pagePath === '/blog' || pagePath.split('/').length === 3)) {
      const folderIndex = path.join(distDir, pagePath.replace(/^\//, ''), 'index.html');
      mkdirSync(path.dirname(folderIndex), { recursive: true });
      writeFileSync(folderIndex, html);
    }
  }
  // Written last, so the per-page files above do not inherit the preload.
  const preload = heroPosterPreload();
  const homeHtml = preload && !shell.includes(preload) ? shell.replace('</head>', `    ${preload}\n  </head>`) : shell;
  if (homeHtml !== rawShell) writeFileSync(shellPath, homeHtml);
  console.log(
    `prerender: wrote page metadata into ${written} HTML files in ${distDir}` +
      (preload ? ' and the hero poster preload into index.html' : '') +
      (verification ? ' and the Search Console ownership tag into every page' : '')
  );
} catch (err) {
  console.error(`prerender: could not write page HTML from ${shellPath}:`, err);
  process.exit(1);
}
