# 3D Wheel Rim Models

Photoreal `.glb` rims placed here are shown in the 3D wheel studio on `/wheels/<slug>`. A wheel
with no model has no 3D stage; its page shows photography instead.

A wheel with a model opens in the **wheel studio** (`WheelStudio.tsx`): paint finishes, fixed
camera views, exploded view, optional brake check and an optional Front / Rear switch.

`stf399-front.glb` and `stf399-rear.glb` are the FSA001 2-piece wheel (19×9.5 front, 20×11 rear),
shown on `/wheels/fsa001-black-matte` and at the unlisted preview page `/studio/stf399`. Their brake
meshes use assumed G80/G82 M3/M4 brake dimensions, not a measured caliper.

`fsa002-forked.glb` is the forked-spoke FSA002, shared by its Hyper Black and Polished Face listings (it is the design's model in `MODEL_URL_BY_CODE`). The 15-spoke gold wheel that used to be listed as FSA002 is the FSA003 and uses `fsa003.glb`; the old `fsa002.glb` was removed. It was made from an AI-generated (Tripo) 3D file supplied by the owner: the brake and stray fragments were removed, it was cut to 150k triangles, scaled to a 0.53 m rim, and its baked texture dropped so the studio paints it. It is one mesh, so the exploded view is off for it. Its shape is close to the photographed wheel, not CAD: replace it with the maker's file when one exists.

`ff-3-sixnine.glb` is the Sixnine FF-3 (two-piece, bolt ring on the lip), shared by all FF-3 finishes. It was made from an owner-supplied AI-generated (Tripo) file in the same way as `fsa002-forked.glb`, with its width squashed to 0.27 m because the AI mesh came out about 14 inches deep; that width is an estimate, not a catalogue figure. It matches the FF-3 photos (spoke pattern, bolt ring, centre cap). The bolts take the finish colour, since the file is one mesh.

`fsa003-v2.glb` (the 15-spoke FSA003, shared by Gold, Silver and Hyper Black) and `ff-1-sixnine.glb` (the Sixnine FF-1, Y-spokes with a bolt ring, shared by its finishes) were made the same way as `fsa002-forked.glb`, from owner-supplied AI-generated (Tripo) files, and each matches its real photos (spoke pattern, rim, centre cap). Neither needed its width changed. They replace the older traced `fsa003.glb` and `ff-1.glb`, which were removed. As with the others, a few thin streaks from the AI mesh may show at some angles.

`fsa004.glb` is one model per design, shared
by every finish of that design (see `MODEL_URL_BY_CODE` in `src/data/catalogue.ts`). It was traced
from face-on product photos and ship without baked textures, because the studio applies its own paint.
On a wheel page the studio offers the listing's own finish and the design's to-order colours
(`getToOrderFinishes` in `src/data/catalogue.ts`); the page shows the 3-month lead-time notice while a
to-order colour is selected.

A listing whose record names no `modelUrl` still opens in 3D when its design has a model in `MODEL_URL_BY_CODE`
(`modelUrlForDesign` in `src/data/catalogue.ts`); a test fails if any in-stock listing ends up without one.

## How a wheel gets its model

1. Export the rim as `public/models/wheels/<slug>.glb` where `<slug>` is the wheel's `slug` in
   `src/data/customWheels.json` (e.g. `fsa002-gold.glb`).
2. Add `"modelUrl": "/models/wheels/<slug>.glb"` to that wheel's record in `customWheels.json`
   (leading slash, no `public/`).
   With the CLI: `npm run add-wheel -- --name "TYPE 60" --price 75000 --glb "/models/wheels/type-60.glb"`.
3. Rebuild and deploy. If the model fails to load, the studio shows a message with a retry button.

## File specification

- **Format:** Binary glTF 2.0 (`.glb`), textures embedded, one file per wheel finish.
- **Content:** the rim (barrel, spokes/face, bolts, centre cap). No tyre or car. Brake meshes are
  optional: name them `Brake_Rotor` and `Brake_Caliper` and the studio offers a brake check;
  they are hidden otherwise.
- **Staggered sets:** add the rear size as a second file and set `"rearModelUrl"` on the wheel record.
- **Pivot / axes:** axle bore centre at `(0, 0, 0)`; front face toward `+Z`; up is `+Y`; the
  wheel spins around `Z`. The studio re-centres on the bounding box and scales the larger of the
  X/Y extents to the studio diameter, so mm/cm exports still load, but correct orientation is
  required.
- **Scale:** real metres (a 20–21" rim is roughly 0.50–0.55 m across).
- **Sub-mesh names:** the studio reads the part from the mesh name. `Rim_Barrel` (or any name
  containing `barrel` or `lip`), `Rim_Face_Spokes` and `Center_Cap` take the selected finish;
  `Hardware_Bolts` keeps its own material. Unrecognised meshes are treated as part of the face.
  Recommended set: `Rim_Barrel`, `Rim_Face_Spokes`, `Hardware_Bolts`, `Center_Cap`.
- **Materials:** PBR metallic-roughness only (glTF standard). No spec/gloss or Phong.
- **Textures:** 2K BaseColor, Normal (OpenGL +Y), packed ORM (occlusion / roughness / metalness).
- **Geometry:** 0.5–1 mm chamfers or baked normals on spoke edges; keep under ~150k triangles
  for fast mobile loads (the studio reports mesh and triangle counts after load).
- **Blender export:** File → Export → glTF 2.0, format "glTF Binary", apply modifiers, +Y up.
