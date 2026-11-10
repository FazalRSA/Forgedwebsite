#!/usr/bin/env tsx
/**
 * FORGED Custom wheels — CLI Wheel & Fitment Product Generator
 *
 * Usage (CLI flags):
 *   npm run add-wheel -- \
 *     --name "TYPE 60" \
 *     --series "CARBON SERIES" \
 *     --price 75000 \
 *     --image "/assets/wheels/type-60.png" \
 *     --glb "/models/wheels/type-60.glb" \
 *     --marques "BMW,PORSCHE,FERRARI" \
 *     --make "BMW" \
 *     --model "M3" \
 *     --year "2024 ONWARDS" \
 *     --diameter '20-21"' \
 *     --finish "satin-black" \
 *     --geometry "aero-disc-f1" \
 *     --part-no "FCW-TYPE60-BLK-2021"
 *
 * Usage (Interactive prompt):
 *   npm run add-wheel
 *
 * Usage (List or remove):
 *   npm run add-wheel -- --list
 *   npm run add-wheel -- --remove type-60
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  BrandWheelItem,
  SpokeGeometryType,
  StoreProductItem,
  WheelFinishId,
  formatZAR,
} from '../src/data/catalogue';
import { createWheelAndProductEntries } from '../src/utils/wheelBuilder';

interface CustomWheelsFile {
  brandWheels: BrandWheelItem[];
  storeProducts: StoreProductItem[];
}

const DATA_FILE_PATH = path.resolve(process.cwd(), 'src/data/customWheels.json');

function readCustomWheelsFile(): CustomWheelsFile {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    return { brandWheels: [], storeProducts: [] };
  }
  try {
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<CustomWheelsFile>;
    return {
      brandWheels: Array.isArray(parsed.brandWheels) ? parsed.brandWheels : [],
      storeProducts: Array.isArray(parsed.storeProducts) ? parsed.storeProducts : [],
    };
  } catch {
    return { brandWheels: [], storeProducts: [] };
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
FORGED Custom wheels — Wheel & Store Product CLI Script
=======================================================

Usage:
  npm run add-wheel -- [options]

Options:
  --name <string>            Wheel model name (e.g. "TYPE 60", "RS-X") [Required]
  --price <number>           Price in South African Rand for a set of 4 (e.g. 75000) [Required]
  --original-price <number>  Optional previous Rand price to trigger SALE badge
  --series <string>          Series label (default: "FORGED SERIES")
  --image <url|path>         Primary wheel image URL or path (e.g. "/wheels/type-60.png")
  --gallery <urls>           Comma-separated extra gallery image URLs
  --glb <path>               Photoreal .glb rim model served from /public (e.g. "/models/wheels/type-60.glb");
                             loads in the 360° 3D studio in place of the procedural reference rim
  --marques <list>           Comma-separated marques (default: "BMW")
  --make <string>            Store fitment vehicle make (default: "BMW")
  --model <string>           Store fitment vehicle model (default: "M3")
  --year <string>            Store fitment year range (default: "2024 ONWARDS")
  --diameter <string>        Diameter badge: '20"' | '20-21"' | '22"' | '23"' (default: '20-21"')
  --finish <id>              Default finish: silver | satin-black | champagne-bronze | dark-gunmetal
  --geometry <id>            SVG fallback spoke geometry:
                             ten-spoke-ring | y-spoke-forged | split-five-rs | aero-disc-f1 |
                             multi-spoke-gt | dish-beadlock | directional-turbine | classic-horseshoe
  --front-size <string>      Front wheel spec (default: "9.5 X 20 ET18")
  --rear-size <string>       Rear wheel spec (default: "10.5 X 21 ET20")
  --bolt-pattern <string>    Bolt pattern (default: "5 X 112")
  --part-no <string>         Technical Part No (auto-generated if omitted)
  --headline <string>        Editorial headline for Brand Showcase PDP
  --description <string>     Editorial / technical description copy
  --list                     List all custom wheels in src/data/customWheels.json
  --remove <slug>            Remove a custom wheel by slug
  --help                     Show this help message

Example:
  npm run add-wheel -- --name "TYPE 60" --series "CARBON FORGED" --price 75000 --image "/images/type60.png" --marques "BMW" --make "BMW" --model "M3"
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
      console.log('No custom wheels in src/data/customWheels.json yet.');
      return;
    }
    console.log(`Custom Wheels (${currentData.brandWheels.length}):`);
    for (const w of currentData.brandWheels) {
      console.log(
        `  - [${w.slug}] ${w.model} | ${w.series} — ${formatZAR(w.priceZAR)} (${w.marques.join(', ')}) ${
          w.imageUrl ? `[Image: ${w.imageUrl}]` : '[Procedural 3D SVG]'
        } ${w.modelUrl ? `[3D: ${w.modelUrl}]` : '[3D: procedural rim]'}`
      );
    }
    return;
  }

  if (typeof args.remove === 'string') {
    const targetSlug = args.remove.toLowerCase().trim();
    const beforeCount = currentData.brandWheels.length;
    currentData.brandWheels = currentData.brandWheels.filter((w) => w.slug !== targetSlug);
    currentData.storeProducts = currentData.storeProducts.filter(
      (p) => p.wheelSlug !== targetSlug && p.slug !== targetSlug
    );
    writeCustomWheelsFile(currentData);
    console.log(
      `Removed ${beforeCount - currentData.brandWheels.length} wheel entry matching "${targetSlug}".`
    );
    return;
  }

  let name = typeof args.name === 'string' ? args.name : '';
  let priceStr = typeof args.price === 'string' ? args.price : '';
  let series = typeof args.series === 'string' ? args.series : 'FORGED SERIES';
  let imageUrl = typeof args.image === 'string' ? args.image : '';
  let marquesRaw = typeof args.marques === 'string' ? args.marques : 'BMW';
  let make = typeof args.make === 'string' ? args.make : 'BMW';
  let vehicleModel = typeof args.model === 'string' ? args.model : 'M3';
  let yearRange = typeof args.year === 'string' ? args.year : '2024 ONWARDS';
  let diameter = (typeof args.diameter === 'string' ? args.diameter : '20-21"') as
    | '20"'
    | '20-21"'
    | '22"'
    | '23"';
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
      console.log('\n--- Add or Update FORGED Custom wheels Entry ---\n');
      if (!name) {
        name = (await rl.question('1. Wheel Model Name (e.g. TYPE 60): ')).trim();
      }
      if (!priceStr) {
        priceStr = (await rl.question('2. Price in Rand for a set of 4 (e.g. 75000): ')).trim();
      }
      const seriesAns = (
        await rl.question(`3. Series [${series}]: `)
      ).trim();
      if (seriesAns) series = seriesAns;

      const imgAns = (
        await rl.question('4. Image URL or Path (leave blank for 3D Studio SVG): ')
      ).trim();
      if (imgAns) imageUrl = imgAns;

      const marquesAns = (
        await rl.question(`5. Compatible Marques comma-separated [${marquesRaw}]: `)
      ).trim();
      if (marquesAns) marquesRaw = marquesAns;

      const makeAns = (await rl.question(`6. Store Fitment Make [${make}]: `)).trim();
      if (makeAns) make = makeAns;

      const modelAns = (await rl.question(`7. Store Fitment Model [${vehicleModel}]: `)).trim();
      if (modelAns) vehicleModel = modelAns;
    } finally {
      rl.close();
    }
  }

  const priceZAR = Number(priceStr);
  const originalPriceZAR =
    typeof args['original-price'] === 'string' ? Number(args['original-price']) : undefined;
  const galleryImages =
    typeof args.gallery === 'string'
      ? args.gallery.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

  const { brandWheel, storeProduct } = createWheelAndProductEntries({
    name,
    series,
    priceZAR,
    originalPriceZAR,
    imageUrl: imageUrl || undefined,
    galleryImages,
    modelUrl: typeof args.glb === 'string' ? args.glb : undefined,
    marques: marquesRaw.split(',').map((s) => s.trim()),
    make,
    vehicleModel,
    yearRange,
    diameterBadge: diameter,
    defaultFinish: finish,
    geometry,
    frontWheelSize: typeof args['front-size'] === 'string' ? args['front-size'] : undefined,
    rearWheelSize: typeof args['rear-size'] === 'string' ? args['rear-size'] : undefined,
    boltPattern: typeof args['bolt-pattern'] === 'string' ? args['bolt-pattern'] : undefined,
    partNo: typeof args['part-no'] === 'string' ? args['part-no'] : undefined,
    headline: typeof args.headline === 'string' ? args.headline : undefined,
    description: typeof args.description === 'string' ? args.description : undefined,
  });

  // Upsert by slug
  const filteredBrand = currentData.brandWheels.filter((w) => w.slug !== brandWheel.slug);
  const filteredStore = currentData.storeProducts.filter((p) => p.slug !== storeProduct.slug);

  const updatedData: CustomWheelsFile = {
    brandWheels: [brandWheel, ...filteredBrand],
    storeProducts: [storeProduct, ...filteredStore],
  };

  writeCustomWheelsFile(updatedData);

  console.log(`✅ Successfully added wheel "${brandWheel.model}" to src/data/customWheels.json!`);
  console.log(`   • Brand Showcase Route : /wheels/${brandWheel.slug}`);
  console.log(`   • Store Technical PDP  : /store/products/${storeProduct.slug}`);
  console.log(`   • Price (Set of 4)     : ${formatZAR(brandWheel.priceZAR)}`);
  console.log(`   • Image Asset          : ${brandWheel.imageUrl || 'Procedural 3D Forged SVG (' + brandWheel.geometry + ')'}`);
  console.log(`   • 3D Model (.glb)      : ${brandWheel.modelUrl || 'none — 3D studio shows the procedural reference rim'}`);
}

main().catch((err) => {
  console.error('Error adding wheel:', err instanceof Error ? err.message : err);
  process.exit(1);
});
