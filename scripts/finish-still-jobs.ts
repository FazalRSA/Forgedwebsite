/**
 * Lists the pictures `render-finish-stills.py` has to draw: every design in every colour it comes in, with the
 * 3D model and the paint numbers the 3D view gives that colour. The catalogue is the one source for the designs,
 * their colours and names; this only reads it.
 *
 *   npx tsx scripts/finish-still-jobs.ts > /tmp/finish-still-jobs.json
 */
import { getAllBrandWheels, designPalette, WHEEL_FINISHES } from '../src/data/catalogue';
import { getStudioFinish } from '../src/data/studioFinishes';

interface Job {
  design: string;
  finishId: string;
  /** The name the 3D view paints this colour under: a listing's own name ("Black Matte") reads matte, "Gloss Black" gloss. */
  name: string;
  /** Served path of the design's model. */
  model: string;
  paint: ReturnType<typeof getStudioFinish>;
}

const wheels = getAllBrandWheels();
const designs = [...new Set(wheels.map((w) => w.modelCode).filter((c): c is string => !!c))];
const jobs: Job[] = [];
for (const design of designs) {
  const listings = wheels.filter((w) => w.modelCode === design);
  const model = listings.find((w) => w.modelUrl)?.modelUrl;
  if (!model) continue; // no 3D model, nothing to render
  for (const finishId of designPalette(design)) {
    // The listing's own name when the design is stocked in this colour (that is what the 3D view uses), else the palette's.
    const own = listings.find((w) => w.defaultFinish === finishId)?.finishName;
    jobs.push({
      design,
      finishId,
      name: own ?? WHEEL_FINISHES[finishId].name,
      model,
      paint: getStudioFinish(finishId, design),
    });
  }
}
process.stdout.write(JSON.stringify(jobs, null, 1) + '\n');
