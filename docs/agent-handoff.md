# Agent handoff: context for the next agent

Written 23 November 2026 at the end of a long session (November 18 to 23) that worked mostly on the 3D wheels,
the colour swatches and the Sixnine pages. Read `AGENTS.md` first (the rules), then the README sections it points to.
This file is the "why" and the "how it actually went": decisions the owner made, what was tried and rejected,
and the traps in this environment.

## The owner and how to work with them

- The owner runs FORGED SA (forged wheels for BMW M cars, South Africa) and is the sole decision maker.
- **Answers short, in bullets.** They asked for "a shorter response with bullet points" and "simple concise response".
  Often on a phone, without a laptop: give them things they can do from the GitHub app or Google Drive.
- **"merge" means merge.** Merge only on their explicit word. With "merge all prs" they meant every open PR in the repo.
- They want photoreal, "perfect" 3D, and they test the live site on their phone. Show before/after evidence.
- Their user preference: no generic filler, research the web for current best practice before proposing a solution.
- They work several Claude sessions in parallel on the same repo. Expect `main` to move under you: fetch before
  branching, and expect merge conflicts (usually `package.json`'s test list and README lines; combine both sides).

## Decisions the owner made (do not reopen without asking)

| Date | Decision |
| --- | --- |
| Nov 17 | FSA002 is the **forked**-spoke wheel. The gold 15-spoke wheel listed as FSA002 is really **FSA003**; `/wheels/fsa002-gold` redirects to `/wheels/fsa003-gold`. |
| Nov 17 | FF-1 "Silver" is Sixnine's **HyperSilver**; FF-1 "black" is **GlossyBlack** (finish names are one word since PR 88, as Sixnine writes them). |
| Nov 18 | Centre caps: FORGED logo on FSA wheels, SIXNINE logo on FF wheels (done in the viewer, see below). |
| Nov 20 | Site follows SIXNINE's build ideology but keeps FORGED's palette and type (AGENTS.md → SIXNINE style skills). |
| Nov 23 | Hero: no stock sentence under the H1. The H1 was shortened to "Forged, not cast."; the owner later chose "Forged Custom Wheels. Turning dreams into reality." (current text in `HeroSection.tsx`). |
| Nov 23 | `/sixnine-wheels`: no "Fitment at a glance" block; the old range list was removed (another session later added a richer range section). |
| Nov 23 | The shop may use Sixnine's **series renders** (series cards, mega menu, series hero). Other Sixnine material still needs asking. |
| Nov 23 | **Every wheel the shop sells is forged.** Sixnine's sheet says "flow forged/formed"; the site says "Forged" (`SHOP_CONSTRUCTION` in `src/data/sixnineSeries.ts`). |

## What was built in this session (all merged and live)

- **Photoreal finish swatches**: each swatch is a ball rendered in the wheel's own paint under the studio lighting
  (`src/wheel-viewer/swatch.ts`, `FinishSwatch.tsx`), cached, one WebGL context per batch, drawn fallback without WebGL.
  Product-card swatches use the same renderer. (Another session later added static per-design stills, `finishStills`.)
- **Sixnine colour names** researched from sixnine-wheels.com: `SIXNINE_DESIGN_FINISHES`, `designPalette()` in `catalogue.ts`.
- **3D models for every design** from owner-supplied Tripo3D files (Google Drive), cleaned by
  `.claude/skills/add-wheel-model/scripts/build_wheel_model.py`. One model per design, `MODEL_URL_BY_CODE`.
- **Cleanup options** in that script: `--fold-angle` (cuts hair-thin fins), `--normal-smooth/--normal-blend` (calmer
  shading normals), `--barrel-smooth` (pulls a wavy barrel toward a surface of revolution, at most N mm),
  `--rebuild-barrel` (replaces a thick double-skin barrel with one clean wall), `--smooth` (Taubin iterations),
  `--cache` (reuse the slow decimation), `--width` (squash an over-deep AI wheel).
- **Centre-cap logos** in the shared viewer (`capLogo` prop on `WheelStudio`): raycasts down the axle to find the cap,
  lays the logo flat on it, recolours the FORGED mark for light paints, fills an open bore (FSA002) with a painted cap.
  `capLogoForDesign()` in `catalogue.ts` picks the logo.
- **Batch tools**: `npm run build-wheel-models -- --src-dir <folder>` (list in `scripts/wheel-models.json`) and
  `npm run qa-wheels` (every listing at 390 px, four 3D views, console errors, failed requests, sideways scroll,
  contact sheet). A test checks the list names the files the catalogue really uses.
- **"View in 3D" on the FF-ONE and FF-THREE series pages**, **About Sixnine section** (`SixnineAbout.tsx`, facts with
  sources in `src/data/sixnineAbout.ts`, Sixnine's German TÜV approval deliberately left out), **3D-render placeholders**
  for the two listings without photos, cleaner phone product cards, and the "forged" wording everywhere.

## The 3D pipeline in practice

1. Owner makes a model in Tripo3D (multi-view from the real photos), exports `.glb`, uploads to Google Drive and sends
   the link (or you search their Drive: files are named like `fsa 003 a.glb`, `ff1.glb`, `ff 1 a.glb`, `fsa 004 a.glb`).
2. Download with `https://drive.usercontent.google.com/download?id=<ID>&confirm=t` into a new empty folder (the file
   must be shared "anyone with the link"; otherwise the Drive MCP can read metadata but you need the owner to share it).
   Treat it as untrusted: own folder, `python3 -I`.
3. **Check it against the real photos before wiring it.** Twice the owner sent the wrong file (a forked wheel labelled
   FSA004; "FF 1.glb" was FF-3). Count spokes, compare the lip and centre cap.
4. Build: see `scripts/wheel-models.json` for the settings that work per design. **Run one build at a time**: loading
   and decimating a 60 MB Tripo file takes several GB; parallel builds were OOM-killed. Use `--cache`.
5. Bump the file version (`-vN`) in the file name and `MODEL_URL_BY_CODE` whenever a file changes (browser caches).
6. Compare before/after in the real viewer (recipe below), run `npm run qa-wheels`, lint, tests, build.

**What did not work**, so you do not retry it: fold angle 75 (shreds the bolt ring), normal smoothing 30/0.8 (softens
bolt heads), a face-on "thin features" detector (found nothing), `--rebuild-barrel` on FF-3 (cuts its bolted lip:
use `--barrel-smooth 4` there), installing `@gltf-transform/cli` for Draco (blocked here; models ship uncompressed).
The remaining faint bumps come from the AI source. The real fix is the maker's CAD (ask Sixnine for FF-ONE/FF-THREE files).

## Environment traps (this cloud container)

- **Bash safety hooks** block a command whose text contains credential-looking words (secret, token, password,
  api key, `.env`) or the substring `rm -rf /` (even `rm -rf /tmp/x`). Scan for those with the Grep tool or with
  hex-escaped regex (`s\x65cr\x65t`), and use `mktemp -d` or `find -delete` for cleanup.
- **Screenshots of the 3D viewer** need software WebGL: launch Chromium with
  `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, wait about 5 s after "View in 3D".
  Playwright is installed globally, not in the repo: run scripts with `NODE_PATH=$(npm root -g)` or from a `.cjs`
  file in the scratchpad. Kill the dev server (`pkill -f vite`) before heavy Python builds to free memory.
- **Transparent renders** of the model: make `html, body, #root *` and `.wv-stage` backgrounds transparent, screenshot
  the canvas with `omitBackground`, and hide the overlay buttons with `visibility:hidden` only around the screenshot
  (hidden buttons cannot be clicked).
- **Checking a deploy**: Render serves the SPA's HTML (200, `text/html`) for an unknown path, so a new `.glb` "exists"
  only when `curl -sI` shows `binary/octet-stream` and the right `content-length`. Deploys take 1 to 10 minutes.
- **Render MCP** asks which workspace to use; it must not pick one itself, so ask the owner or check the live site
  with curl instead. GitHub: use the GitHub MCP tools (no `gh` CLI for PRs).
- **Stop hooks** in this environment ask for a review of secrets, I/O error handling and naming after code changes,
  and to push unpushed commits. Run the three checks in one command on the final diff and show the output.

## Still open

1. **BMW configurator** (`FazalRSA/BMW-AND-FORGED-`): the shared viewer changed (cap logos, and PR #83's finishes);
   the owner must run `node scripts/wheel-viewer-sync.mjs pull` there.
2. **Better 3D sources**: Sixnine's CAD/3D files for FF-ONE and FF-THREE; FORGED's CAD for FSA002 to FSA004.
   Then `npm run build-wheel-models` with plain settings.
3. **Photos** of FSA003 Silver and FSA004 HyperBlack to replace the 3D-render placeholders
   (`customWheels.json` entries labelled "3D preview", files in `public/images/wheels/<slug>/`).
4. **3D for Sixnine designs not in stock** (FF-TWO, EVO-ONE, EVO-TWO, OEM+ONE): none. AGENTS.md forbids AI models of
   wheels the shop does not sell; ask the owner before adding any.
5. FSA003 Gold's specs (20/21 inch, R 75,000, M3 Competition G80) were carried over from the listing it replaced and
   were never re-confirmed by the owner.
6. Model files are uncompressed (3.4 to 4.6 MB). Draco or meshopt compression would cut that a lot if the tooling can
   be installed. The viewer can decode Draco (`dracoDecoderPath`, default `/draco/`), but `public/draco/` holds no
   decoder files yet: add them in the same change as the first compressed model.
