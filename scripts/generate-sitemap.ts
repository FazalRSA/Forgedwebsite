/**
 * Writes public/sitemap.xml from the catalogue data, for the domain in src/config/site.ts.
 * Runs before every production build (see "build" in package.json), so the sitemap always
 * lists the home page, one page per wheel that is in stock, /installs, /contact and /privacy-policy.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildSitemapXml, sitemapPaths, withRenderPageRoutes } from '../src/utils/seo';

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml');
try {
  writeFileSync(out, buildSitemapXml());
  console.log(`sitemap: wrote ${sitemapPaths().length} URLs to ${out}`);
} catch (err) {
  console.error(`sitemap: could not write ${out}:`, err);
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
