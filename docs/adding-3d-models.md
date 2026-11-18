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
- A design code can cover more than one wheel shape (FSA002 does), so a model is set per design or, where the photos differ, per listing.
