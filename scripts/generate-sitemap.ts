/**
 * Writes public/sitemap.xml from the catalogue data, for the host in src/config/site.ts, and
 * public/robots.txt (which names that sitemap).
 * Runs before every production build (see "build" in package.json), so the sitemap always
 * lists the home page, one page per wheel that is in stock, the blog (hub, pillars, articles), /installs, /contact and /privacy-policy.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE_ORIGIN, buildRobotsTxt, buildSitemapXml, sitemapPaths, withRenderPageRoutes } from '../src/utils/seo';
import { buildBlogFeedXml } from '../src/utils/blogSeo';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const out = path.join(publicDir, 'sitemap.xml');
try {
  writeFileSync(out, buildSitemapXml());
  console.log(`sitemap: wrote ${sitemapPaths().length} URLs to ${out}`);
} catch (err) {
  console.error(`sitemap: could not write ${out}:`, err);
  process.exit(1);
}

const robotsOut = path.join(publicDir, 'robots.txt');
try {
  writeFileSync(robotsOut, buildRobotsTxt());
  console.log(`sitemap: wrote ${robotsOut}`);
} catch (err) {
  console.error(`sitemap: could not write ${robotsOut}:`, err);
  process.exit(1);
}

// The blog's RSS feed, at /blog/feed.xml.
const feedOut = path.join(publicDir, 'blog', 'feed.xml');
try {
  mkdirSync(path.dirname(feedOut), { recursive: true });
  writeFileSync(feedOut, buildBlogFeedXml(SITE_ORIGIN));
  console.log(`sitemap: wrote ${feedOut}`);
} catch (err) {
  console.error(`sitemap: could not write ${feedOut}:`, err);
  process.exit(1);
}

// Keep render.yaml's per-page rewrite rules in step with the same list of pages.
const renderYamlPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'render.yaml');
try {
  const current = readFileSync(renderYamlPath, 'utf8');
  const updated = withRenderPageRoutes(current);
  if (updated !== current) writeFileSync(renderYamlPath, updated);
  console.log(`sitemap: render.yaml page routes ${updated === current ? 'already up to date' : 'updated'}`);
} catch (err) {
  console.error(`sitemap: could not update ${renderYamlPath}:`, err);
  process.exit(1);
}
