#!/usr/bin/env node
/**
 * Opens every in-stock wheel listing at phone width (390 px), opens its 3D view, takes a picture from
 * each camera view, and checks: no console errors, no failed requests, no sideways scroll, and that the
 * 3D stage showed a wheel. Writes the pictures and a contact sheet (index.html) to --out.
 *
 *   npm run dev                       # in one terminal
 *   npm run qa-wheels                 # in another
 *   npm run qa-wheels -- --base http://localhost:3000 --out qa-wheels
 *
 * Needs Playwright with Chromium (not a dependency of the site: `npx playwright install chromium`).
 * Exit code 1 if any listing has a problem.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const base = opt('base', 'http://localhost:3000').replace(/\/$/, '');
const out = opt('out', 'qa-wheels');
const VIEWS = ['Face', '3/4', 'Side', 'Back'];

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    // a global install is found through NODE_PATH, which only require() reads
    ({ chromium } = createRequire(import.meta.url)('playwright'));
  } catch {
    chromium = undefined;
  }
}
if (!chromium) {
  console.error('ERROR: Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

try {
  await mkdir(out, { recursive: true });
} catch (err) {
  console.error(`ERROR: cannot create ${out}: ${err.message}`);
  process.exit(1);
}
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5 });
let problems = [];
page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text().slice(0, 140)}`));
page.on('pageerror', (e) => problems.push(`page error: ${e.message.slice(0, 140)}`));
page.on('response', (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));

const results = [];
try {
  // Every listing, not only the design cards: the sitemap lists each one.
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text().catch(() => '');
  const slugs = [...new Set([...sitemap.matchAll(/\/wheels\/([a-z0-9-]+)</g)].map((m) => m[1]))];
  if (!slugs.length) throw new Error(`no wheel listings found in ${base}/sitemap.xml (is the dev server running?)`);

  for (const slug of slugs) {
    problems = [];
    const shots = [];
    let note = '';
    await page.goto(`${base}/wheels/${slug}`, { waitUntil: 'networkidle' });
    const open3d = page.getByRole('button', { name: /3d/i }).first();
    if (!(await open3d.count())) {
      note = 'no 3D view';
    } else {
      await open3d.click();
      await page.waitForTimeout(4500);
      for (const view of VIEWS) {
        await page.getByRole('button', { name: view, exact: true }).click();
        await page.waitForTimeout(1400);
        const file = `${slug}-${view.replace('/', '')}.png`;
        await page.locator('canvas').first().screenshot({ path: join(out, file) });
        shots.push(file);
      }
    }
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) problems.push('sideways scroll');
    results.push({ slug, shots, note, problems: [...problems] });
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${slug}${note ? ` (${note})` : ''}${problems.length ? `: ${problems.join('; ')}` : ''}`);
  }
} catch (err) {
  console.error(`ERROR: ${err.message}${err.cause ? ` (${err.cause.code || err.cause.message})` : ''}. Is the dev server running at ${base}?`);
  await browser.close();
  process.exit(1);
}
await browser.close();

const html = `<!doctype html><meta charset="utf-8"><title>Wheel QA</title>
<style>body{font:14px system-ui;background:#111;color:#eee;margin:16px}h2{margin:24px 0 4px}.bad{color:#f66}
.row{display:flex;gap:8px;flex-wrap:wrap}img{height:300px;border-radius:8px}</style>
<h1>Wheel QA, 390 px</h1>${results.map((r) => `<h2>${r.slug}${r.problems.length ? ' <span class="bad">FAIL</span>' : ''}</h2>
${r.problems.map((p) => `<div class="bad">${p.replace(/</g, '&lt;')}</div>`).join('')}
<div class="row">${r.shots.map((s) => `<img src="${s}" alt="${r.slug} ${s}">`).join('')}</div>`).join('')}`;
try {
  await writeFile(join(out, 'index.html'), html);
} catch (err) {
  console.error(`ERROR: cannot write the contact sheet: ${err.message}`);
  process.exit(1);
}
const failed = results.filter((r) => r.problems.length);
console.log(`\n${results.length} listings, ${failed.length} with problems. Contact sheet: ${join(out, 'index.html')}`);
process.exit(failed.length ? 1 : 0);
