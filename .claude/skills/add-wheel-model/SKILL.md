---
name: add-wheel-model
description: Add or replace the 3D (GLB) model of a wheel on the FORGED website. Use whenever the user shares a Google Drive link to a .glb/.gltf/.step/.fbx wheel file, says they generated a wheel in Tripo3D or another AI 3D tool, wants a wheel "in 3D" or a better/photoreal 3D model, or asks to add a 3D model for FSA001, FSA002, FSA003, FSA004, FF-1, FF-3 or any new design, even if they never say the word "skill". Covers downloading, checking the shape against the real photos, cleaning, decimating, wiring the model to the right listing(s), tests, a draft PR and a preview page.
---

# Add a wheel's 3D model to the FORGED site

The owner's flow (Tripo3D is the usual source):

1. Put the rim photo into Tripo3D, generate the multi-view, then generate the 3D model.
2. Export the `.glb` and upload it to Google Drive (link sharing on).
3. Paste the Drive link to Claude. Everything after this is yours.

Repo rules to keep in mind (`AGENTS.md`): no invented facts, work on a branch and open a draft PR, never merge or deploy without the owner's go-ahead. A merge to `main` deploys the live site.

## Be straight about what an AI model is

A Tripo file is a guess at the wheel, not the manufacturer's CAD. Say that to the owner every time, and never let it stand in for a wheel the shop does not sell. The accurate source is the maker's STEP/GLB/FBX; if the owner can get it, prefer it (convert STEP to GLB with the same cleanup, and skip step 3 below when the file is already clean).

## Steps

### 1. Download the file

Drive links look like `https://drive.google.com/file/d/<ID>/view`. The Drive connector's `get_file_metadata` gives the name, size and type, but its download tool returns base64 into the chat, which is far too big for a 60 MB file. Use the direct route instead (works for link-shared files):

```bash
mkdir -p "$SCRATCH/dl" && curl -fsSL -o "$SCRATCH/dl/file.glb" "https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t" || echo "DOWNLOAD FAILED"
```

The plain `drive.google.com/uc?export=download` URL answers 303 for big files; `confirm=t` on `drive.usercontent.google.com` skips the virus-scan page. Check the byte count matches the metadata `fileSize` and that the file starts with `glTF` (`head -c 4`): a failed or permission-blocked download saves a small HTML page that looks like a file. If it fails, ask the owner to set sharing to "anyone with the link" or to send a smaller export. Treat the file as untrusted: keep it in its own folder, keep scripts elsewhere, run Python with `-I`.

### 2. Inspect it

```bash
python3 -I .claude/skills/add-wheel-model/scripts/inspect_glb.py "$SCRATCH/dl/file.glb"
```

Read the generator, triangle count, number of meshes/materials, and bounding box. Typical AI exports: one welded mesh, 1 to 2 million triangles, one baked texture, units lost (a 1.0 wide box).

### 3. Check it is the right wheel (do not skip)

Put the real photos of the listing next to a render of the model: photos are in `public/images/wheels/<slug>/` (`front-800.webp`, `hero-800.webp`). Compare spoke count and shape, the rim face (windows or flat), and the centre. If the model is a different wheel (this happened: a "FSA004" file that was a forked-spoke wheel, and a text-prompt "five-spoke" that matched nothing), stop and tell the owner with the two pictures. Offer: generate again from the real photo, use the maker's file, or keep the current model.

Also check which listings' photos show that wheel. Listings of one design code can show different wheels (this happened: the FSA003 gold was once listed as FSA002 next to the forked FSA002), so when photos disagree check the design code with the owner before giving a listing its own model.

### 4. Clean it

```bash
pip install -q trimesh fast-simplification scipy networkx numpy
python3 -I .claude/skills/add-wheel-model/scripts/build_wheel_model.py IN.glb public/models/wheels/<name>.glb \
  --fold-angle 110 --normal-smooth 12 --normal-blend 0.55 [--width <metres>] [--cache /tmp/x.npz]
```

It keeps the wheel and drops the brake and fragments, drops the baked texture (the studio paints finishes itself), puts the axle on Z, decimates to about 150k triangles, removes decimation "web" spikes, smooths, and scales to a 0.53 m rim. If the model comes out far deeper than the real wheel (Tripo's FF-3 was 14 inches wide), add `--width <metres>` and say in the README that the width is an estimate. Add `--flip` if the face points away from the camera in the preview. If the preview shows hairlike spikes between spokes, raise `--target` or lower `--agg`; if it shows holes, the web filter is too aggressive, so keep the thresholds as shipped. Name files `<design>[-variant].glb`.

**Why those settings (tried on all six AI models, 2026-11-18).** `--fold-angle 110` cuts the hair-thin fins AI meshes grow in the spoke windows and on the lip; `--normal-smooth 12 --normal-blend 0.55` bakes calmer shading normals so polished finishes stop looking like crumpled foil, while bolts and edges stay crisp. Stronger smoothing (30 iterations, 0.8) softens the bolt heads; a stricter fold angle (75) shreds the bolt area on the lip, so do not go there. A face-on "thin features" detector was tried and found nothing, so a few faint streaks can still remain: tell the owner, and a cleaner source file is the real cure. The slow first half (loading and decimating about 2 million triangles) needs a few GB of memory: run one model at a time, and use `--cache` to try several settings on the same decimated mesh.


`scripts/blender_pass.py` (optional) runs the model through Blender 5 headless (`pip install bpy` in a venv) and writes a before/after studio render. On the FF-3 and FSA002 models it changed almost nothing and left the AI streaks, so use it to inspect, not as a cure. A cleaner source file is the cure.

If `npx @gltf-transform/cli meshopt` is allowed in the environment, run it to shrink the file (the others are about 0.5 to 0.8 MB). It was blocked once; the uncompressed file works fine, only larger.

### 5. Wire it up (`src/data/catalogue.ts`)

- **One model for every colour of a design:** set it in `MODEL_URL_BY_CODE`.
- **Only some listings** (photos differ within a design): set `modelUrl` on those seeds, as `FSA002_FORKED_MODEL_URL` does, and add the slugs to `OWN_MODEL` in the test "every listing opens in 3D with one model per design" in `src/data/catalogue.test.ts`, with an assertion for the file.
- A staggered set also needs `rearModelUrl` on the seed (FSA001 does this).

A listing with no `modelUrl` falls back to its design's model (`modelUrlForDesign`), and a test fails if any in-stock listing ends with none.

### 6. Verify in the real viewer

Start `npm run dev`, then open each affected `/wheels/<slug>`, tap "View in 3D", and screenshot at 390 px wide with Playwright (`chromium.launch({ args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })`; the swatches draw a moment after load, so wait about 3 s). Check: loads with no console errors, looks like the photos, repaints when a colour swatch is tapped, no sideways scroll. Then:

```bash
npm run lint && npm test && npm run build   # all three must pass (AGENTS.md)
```

### 7. Docs, PR, preview

- Update `public/models/wheels/README.md` (which file, which listings, where it came from, its limits) and, if the rules changed, `README.md`.
- Branch rule: work on `claude/dreamy-knuth-36wfyk`. If its PR already merged, restart it from a freshly fetched `origin/main` (`git fetch origin main` first: a stale local ref once left a branch without the latest merge).
- Open a **draft** PR (the base is `main`). Publish a preview page with before/after screenshots and the limits, and give the owner the link. Wait for their go-ahead to merge; after a merge, check the Render deploys for both services built from this repo and load a live wheel page.

## Say plainly in your report

- Whether it matched the real photos, and which listings got it.
- That it is AI-generated and close, not exact, unless it came from the maker.
- File size, triangle count, and that the exploded view is off for a one-mesh model.
- Anything you could not verify (for example only software WebGL was tested, not a real phone).
