/**
 * Runs last in the build. Writes dist/llms.txt from the catalogue data (see src/utils/llms.ts).
 * Links use the production domain from src/config/site.ts, the same address the canonical URLs
 * and the sitemap use. Render's own address is not used, so preview builds do not leak into the file.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildLlmsTxt } from '../src/utils/llms';
import { SITE_ORIGIN } from '../src/utils/seo';

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'llms.txt');
const origin = SITE_ORIGIN;
try {
  writeFileSync(out, buildLlmsTxt(origin));
  console.log(`llms: wrote ${out} with links on ${origin}`);
} catch (err) {
  console.error(`llms: could not write ${out}:`, err);
  process.exit(1);
}
