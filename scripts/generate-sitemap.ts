/**
 * Writes public/sitemap.xml from the catalogue data, for the domain in src/config/site.ts.
 * Runs before every production build (see "build" in package.json), so the sitemap always
 * matches the wheels, products and car collections that are actually in the catalogue.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildSitemapXml, sitemapPaths } from '../src/utils/seo';

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml');
try {
  writeFileSync(out, buildSitemapXml());
  console.log(`sitemap: wrote ${sitemapPaths().length} URLs to ${out}`);
} catch (err) {
  console.error(`sitemap: could not write ${out}:`, err);
  process.exit(1);
}
