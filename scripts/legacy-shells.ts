/**
 * Runs after `prerender-meta.ts`. Writes a small redirect page for every address that an earlier
 * deploy published and this one no longer has (the old store, collections, products, dealer and
 * fitments pages).
 *
 * Why: the host may still carry rewrite rules from the old render.yaml, such as /store ->
 * /store.html. If that file is gone the host answers 200 with an empty body, so anyone with an old
 * link or bookmark sees a blank page. With these files in place the old rule finds a page that
 * sends the visitor to the right new address. The browser follows the meta refresh at once, and
 * search engines read it as a redirect.
 *
 * The targets come from src/utils/redirects.ts, so the app and these files cannot disagree. The
 * list of old addresses is scripts/legacy-pages.json.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { redirectFor } from '../src/utils/redirects';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(scriptsDir, '..', 'dist');
const listPath = path.join(scriptsDir, 'legacy-pages.json');
const shellPath = path.join(distDir, 'index.html');

/** Keeps a redirect target safe to place inside an HTML attribute. */
function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

try {
  const legacyPaths: string[] = JSON.parse(readFileSync(listPath, 'utf8'));
  const shell = readFileSync(shellPath, 'utf8');
  if (!shell.includes('</head>')) throw new Error(`${shellPath} has no </head> to add the redirect to`);

  for (const legacyPath of legacyPaths) {
    const destination = redirectFor(legacyPath);
    if (!destination) {
      throw new Error(`${legacyPath} is in legacy-pages.json but src/utils/redirects.ts has no redirect for it`);
    }
    const head =
      `<meta name="robots" content="noindex">\n` +
      `    <meta http-equiv="refresh" content="0; url=${escapeAttribute(destination)}">\n  </head>`;
    const outFile = path.join(distDir, `${legacyPath.replace(/^\//, '')}.html`);
    mkdirSync(path.dirname(outFile), { recursive: true });
    writeFileSync(outFile, shell.replace('</head>', head));
  }
  console.log(`legacy: wrote ${legacyPaths.length} redirect pages into ${distDir}`);
} catch (err) {
  console.error(`legacy: could not write redirect pages from ${listPath}:`, err);
  process.exit(1);
}
