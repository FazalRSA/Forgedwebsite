/**
 * Runs last in the build. Writes dist/llms.txt from the catalogue data (see src/utils/llms.ts).
 * Links use the address the build is published at: Render's own URL when Render provides it,
 * otherwise the domain in src/config/site.ts.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildLlmsTxt } from '../src/utils/llms';
import { SITE_ORIGIN } from '../src/utils/seo';

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'llms.txt');
const origin = (process.env.RENDER_EXTERNAL_URL || SITE_ORIGIN).replace(/\/$/, '');
try {
  writeFileSync(out, buildLlmsTxt(origin));
  console.log(`llms: wrote ${out} with links on ${origin}`);
} catch (err) {
  console.error(`llms: could not write ${out}:`, err);
  process.exit(1);
}
