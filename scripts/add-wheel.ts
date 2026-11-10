#!/usr/bin/env tsx
/**
 * FORGED Custom wheels — CLI wheel listing generator
 *
 * Adds (or updates) one stock listing in src/data/customWheels.json: one design in one finish.
 * A listing shows on the site only while --sets is above zero, so `--sets 0` takes it off.
 *
 * Usage (CLI flags):
 *   npm run add-wheel -- \
 *     --name "TYPE 60 BRONZE" \
 *     --price 75000 \
 *     --sets 1 \
 *     --cars "M3 Competition Sedan (G80)" \
 *     --sizes "20 inch / 21 inch" \
 *     --spec "PCD 5×112 · ET8/15 · CB66.6" \
 *     --image "/images/wheels/type-60-bronze/front.webp" \
 *     --glb "/models/wheels/type-60.glb" \
 *     --finish "champagne-bronze"
 *
 * Usage (Interactive prompt):
 *   npm run add-wheel
 *
 * Usage (List or remove):
 *   npm run add-wheel -- --list
 *   npm run add-wheel -- --remove type-60-bronze
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  BrandWheelItem,
  SpokeGeometryType,
  WheelFinishId,
  formatZAR,
  isInStock,
} from '../src/data/catalogue';
import { createWheelEntry } from '../src/utils/wheelBuilder';

/** An entry is a complete listing, or (for a stock-sheet slug) just extra photography; see catalogue.ts. */
type CustomWheelEntry = Partial<BrandWheelItem> & { slug: string };

interface CustomWheelsFile {
  brandWheels: CustomWheelEntry[];
}

const DATA_FILE_PATH = path.resolve(process.cwd(), 'src/data/customWheels.json');

function readCustomWheelsFile(): CustomWheelsFile {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    return { brandWheels: [] };
  }
  try {
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<CustomWheelsFile>;
    return { brandWheels: Array.isArray(parsed.brandWheels) ? parsed.brandWheels : [] };
  } catch {
    return { brandWheels: [] };
  }
}

function writeCustomWheelsFile(data: CustomWheelsFile): void {
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function parseCliArgs(argv: string[]): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const eqIndex = token.indexOf('=');
    if (eqIndex !== -1) {
      const key = token.slice(2, eqIndex);
      const val = token.slice(eqIndex + 1);
      result[key] = val;
    } else {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        result[key] = next;
        i++;
      } else {
        result[key] = true;
      }
    }
  }
  return result;
}

function printHelp(): void {
  console.log(`
FORGED Custom wheels — add a stock listing
==========================================

One listing is one design in one finish. It shows on the site only while it has sets in stock.

Usage:
  npm run add-wheel -- [options]

Options:
  --name <string>        Listing name (e.g. "TYPE 60 BRONZE") [Required]
  --price <number>       Price in South African Rand for a set of 4 (e.g. 75000) [Required]
  --sets <number>        Complete sets in stock (default 1). 0 takes the listing off the site
  --cars <string>        Car it fits (default: none shown), e.g. "M3 Competition Sedan (G80)"
  --sizes <string>       Diameters on offer, e.g. "20 inch / 21 inch"
  --spec <string>        Bolt pattern, offsets and centre bore, e.g. "PCD 5×112 · ET8/15 · CB66.6"
  --series <string>      Series label (default: "FORGED SERIES")
  --image <url|path>     Primary photo URL or path (e.g. "/images/wheels/type-60/front.webp")
  --gallery <urls>       Comma-separated extra photo URLs
  --glb <path>           Photoreal .glb rim model served from /public (e.g. "/models/wheels/type-60.glb");
                         loads in the 3D viewer in place of the procedural reference rim
  --marques <list>       Comma-separated marques (default: "BMW")
  --finish <id>          Finish: silver | satin-black | champagne-bronze | dark-gunmetal
  --geometry <id>        Drawn fallback spoke geometry:
                         ten-spoke-ring | y-spoke-forged | split-five-rs | aero-disc-f1 |
                         multi-spoke-gt | dish-beadlock | directional-turbine | classic-horseshoe
  --headline <string>    Headline on the wheel page
  --description <string> Short description on the wheel page
  --list                 List the entries in src/data/customWheels.json
  --remove <slug>        Remove an entry by slug
  --help                 Show this help message

Example:
  npm run add-wheel -- --name "TYPE 60 BRONZE" --price 75000 --sets 1 --cars "M3 Competition Sedan (G80)" --sizes "20 inch / 21 inch" --finish champagne-bronze
`);
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const currentData = readCustomWheelsFile();

  if (args.list) {
    if (currentData.brandWheels.length === 0) {
      console.log('No entries in src/data/customWheels.json yet.');
      return;
    }
    console.log(`Entries (${currentData.brandWheels.length}):`);
    for (const w of currentData.brandWheels) {
      if (w.model === undefined || w.priceZAR === undefined) {
        // Photography for a stock-sheet listing: the name, price and stock come from the sheet.
        console.log(`  - [${w.slug}] photos for a stock-sheet listing`);
        continue;
      }
      const listed = isInStock({
        stockStatus: w.stockStatus,
        stockQuantitySets: w.stockQuantitySets,
      });
      console.log(
        `  - [${w.slug}] ${w.model} | ${w.series} — ${formatZAR(w.priceZAR)} · ${
          listed ? `${w.stockQuantitySets} in stock` : 'NOT LISTED (no sets in stock)'
        } ${w.imageUrl ? `[Image: ${w.imageUrl}]` : '[drawn stand-in image]'} ${
          w.modelUrl ? `[3D: ${w.modelUrl}]` : '[3D: procedural rim]'
        }`
      );
    }
    return;
  }

  if (typeof args.remove === 'string') {
    const targetSlug = args.remove.toLowerCase().trim();
    const beforeCount = currentData.brandWheels.length;
    currentData.brandWheels = currentData.brandWheels.filter((w) => w.slug !== targetSlug);
    writeCustomWheelsFile(currentData);
    console.log(
      `Removed ${beforeCount - currentData.brandWheels.length} entry matching "${targetSlug}".`
    );
    return;
  }

  let name = typeof args.name === 'string' ? args.name : '';
  let priceStr = typeof args.price === 'string' ? args.price : '';
  let setsStr = typeof args.sets === 'string' ? args.sets : '1';
  let series = typeof args.series === 'string' ? args.series : 'FORGED SERIES';
  let imageUrl = typeof args.image === 'string' ? args.image : '';
  let marquesRaw = typeof args.marques === 'string' ? args.marques : 'BMW';
  let compatibleCars = typeof args.cars === 'string' ? args.cars : '';
  let sizesAvailable = typeof args.sizes === 'string' ? args.sizes : '';
  let finish = (typeof args.finish === 'string' ? args.finish : 'satin-black') as WheelFinishId;
  let geometry = (
    typeof args.geometry === 'string' ? args.geometry : 'y-spoke-forged'
  ) as SpokeGeometryType;

  // Interactive prompt fallback if --name or --price were not passed
  if (!name || !priceStr) {
    if (!input.isTTY) {
      printHelp();
      process.exit(1);
    }
    const rl = readline.createInterface({ input, output });
    try {
      console.log('\n--- Add or Update a FORGED Custom wheels Listing ---\n');
      if (!name) {
        name = (await rl.question('1. Listing name (e.g. TYPE 60 BRONZE): ')).trim();
      }
      if (!priceStr) {
        priceStr = (await rl.question('2. Price in Rand for a set of 4 (e.g. 75000): ')).trim();
      }
      const setsAns = (await rl.question(`3. Sets in stock [${setsStr}]: `)).trim();
      if (setsAns) setsStr = setsAns;

      const carsAns = (await rl.question('4. Car it fits (e.g. M3 Competition Sedan (G80)): ')).trim();
      if (carsAns) compatibleCars = carsAns;

      const sizesAns = (await rl.question('5. Sizes (e.g. 20 inch / 21 inch): ')).trim();
      if (sizesAns) sizesAvailable = sizesAns;

      const imgAns = (
        await rl.question('6. Photo URL or path (leave blank for a drawn stand-in): ')
      ).trim();
      if (imgAns) imageUrl = imgAns;

      const seriesAns = (await rl.question(`7. Series [${series}]: `)).trim();
      if (seriesAns) series = seriesAns;
    } finally {
      rl.close();
    }
  }

  const priceZAR = Number(priceStr);
  const galleryImages =
    typeof args.gallery === 'string'
      ? args.gallery.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

  const brandWheel = createWheelEntry({
    name,
    series,
    priceZAR,
    stockQuantitySets: Number(setsStr),
    imageUrl: imageUrl || undefined,
    galleryImages,
    modelUrl: typeof args.glb === 'string' ? args.glb : undefined,
    marques: marquesRaw.split(',').map((s) => s.trim()),
    compatibleCars: compatibleCars || undefined,
    sizesAvailable: sizesAvailable || undefined,
    technicalSpecSheet: typeof args.spec === 'string' ? args.spec : undefined,
    defaultFinish: finish,
    geometry,
    headline: typeof args.headline === 'string' ? args.headline : undefined,
    description: typeof args.description === 'string' ? args.description : undefined,
  });

  // Upsert by slug
  const filteredBrand = currentData.brandWheels.filter((w) => w.slug !== brandWheel.slug);
  writeCustomWheelsFile({ brandWheels: [brandWheel, ...filteredBrand] });

  const listed = isInStock(brandWheel);
  console.log(`✅ Saved "${brandWheel.model}" to src/data/customWheels.json.`);
  console.log(
    `   • Wheel page  : ${listed ? `/wheels/${brandWheel.slug}` : 'not shown on the site (no sets in stock)'}`
  );
  console.log(`   • In stock    : ${brandWheel.stockQuantitySets} ${brandWheel.stockQuantitySets === 1 ? 'set' : 'sets'}`);
  console.log(`   • Price       : ${formatZAR(brandWheel.priceZAR)} per set of 4`);
  console.log(`   • Photo       : ${brandWheel.imageUrl || 'drawn stand-in (' + brandWheel.geometry + ')'}`);
  console.log(`   • 3D (.glb)   : ${brandWheel.modelUrl || 'none — the 3D viewer shows the procedural reference rim'}`);
}

main().catch((err) => {
  console.error('Error adding wheel:', err instanceof Error ? err.message : err);
  process.exit(1);
});
