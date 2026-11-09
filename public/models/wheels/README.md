# 3D Wheel Rim Models

Photoreal `.glb` rims placed here are shown in the 3D wheel studio on `/wheels/<slug>` and
`/store/products/<product-slug>`. A wheel with no model has no 3D stage; its pages show
photography instead.

A wheel with a model opens in the **wheel studio** (`WheelStudio.tsx`): paint finishes, fixed
camera views, exploded view, optional brake check and an optional Front / Rear switch.

`stf399-front.glb` and `stf399-rear.glb` are the STF399 prototype (19×9.5 and 20×11). STF399 is
not in the catalogue yet; it is viewable at the unlisted page `/studio/stf399`. Its brake meshes
use assumed G80/G82 M3/M4 brake dimensions, not a measured caliper.

## How a wheel gets its model

1. Export the rim as `public/models/wheels/<slug>.glb` where `<slug>` is the wheel's `slug` in
   `src/data/customWheels.json` (e.g. `fsa002-gold.glb`).
2. Add `"modelUrl": "/models/wheels/<slug>.glb"` to that wheel's record in `customWheels.json`
   (leading slash, no `public/`). A store product may also carry its own `modelUrl`; when it does
   not, the linked brand wheel's model is used.
   With the CLI: `npm run add-wheel -- --name "TYPE 60" --price 75000 --glb "/models/wheels/type-60.glb"`.
3. Rebuild and deploy. If the model fails to load, the studio shows a message with a retry button.

`sample-reference-rim.glb` is a low-poly test asset with the correct pivot, axes and mesh names.
It is not a real product; use it only to check the pipeline.

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
