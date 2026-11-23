# Adding or replacing a wheel's 3D model

For the owner: this is the whole job.

1. In Tripo3D, add the rim photo, generate the multi-view, then generate the 3D model.
2. Export the `.glb` and upload it to Google Drive. Turn link sharing on.
3. Paste the Drive link to Claude. Claude downloads it, checks it against the real wheel photos, cleans it, wires it to the right listings, runs the checks, and opens a draft pull request with a preview page. Nothing goes live until you say so.

## Is this the best way?

It is the fastest way, and the only one that needs no CAD. It is not the most accurate.

- **Best:** the maker's own CAD or 3D file (STEP, GLB or FBX). It is the real wheel. Claude converts and cleans it the same way.
- **Good:** Tripo3D from a clear, face-on photo of the real rim. Close to the wheel, but the spokes and rim details are the AI's guess.
- **Not usable:** a model made from a text prompt. It will not match any wheel you sell, and the site must not show a wheel you do not sell.

## What Claude does to the file

Keeps the wheel and removes the brake and stray fragments the AI welds on; drops the baked colour (the site paints each finish itself); sets the axle and centre; cuts about 2 million triangles to about 150k so phones load it; removes the spikes cutting does between spokes; scales to a 0.53 m (21 inch) rim; writes `public/models/wheels/<name>.glb`. The scripts are in `.claude/skills/add-wheel-model/scripts/`, and the `add-wheel-model` skill holds the full procedure.

## Limits

- AI models are close to the photos, not exact. Say so, and replace them when the maker's file exists.
- One mesh means the exploded view is off for that wheel.
- Files are 2 to 4 MB, loaded only when someone taps "View in 3D".
- If a design's photos show two different wheels, one is probably listed under the wrong design code (the FSA003 gold once was). Claude will ask you before giving a listing its own model.


## Doing all the wheels at once

When you have the files for every design, put them in one folder (for example `~/wheel-sources`) and let the scripts do the rest:

1. **Rebuild every model:** `npm run build-wheel-models -- --src-dir ~/wheel-sources`. The list of designs, file names and cleanup options is `scripts/wheel-models.json`. Add `--only FSA003 FF-3` to rebuild some, or `--dry-run` to see the commands. Designs are built one after another (each needs a few GB of memory), and the slow first half is cached, so a second run with other options is quick.
2. **Bump the file version** (`-v5` to `-v6`) in `scripts/wheel-models.json` and `MODEL_URL_BY_CODE` in `src/data/catalogue.ts` when a file changes, so browsers never serve an old copy.
3. **Check every listing at phone width:** run `npm run dev`, then `npm run qa-wheels` in another terminal. It opens all listings in 3D, takes four views of each, and reports console errors, failed requests and sideways scroll. The pictures and a contact sheet are written to `qa-wheels/index.html`. It needs Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`).
4. **Colours** need no new files: a finish is one row in `src/data/studioFinishes.ts`. Compare its swatch with a real photo of that colour and adjust the numbers.
