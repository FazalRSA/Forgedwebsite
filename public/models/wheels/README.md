# 3D Wheel Rim Models

Photoreal `.glb` rims placed here are shown in the 360° 3D studio on `/wheels/<slug>` and
`/store/products/<product-slug>` **in place of the procedural reference rim**. A wheel with no
model keeps the procedural rim.

## How a wheel gets its model

1. Export the rim as `public/models/wheels/<slug>.glb` where `<slug>` is the wheel's `slug` in
   `src/data/customWheels.json` (e.g. `fsa002-gold.glb`).
2. Add `"modelUrl": "/models/wheels/<slug>.glb"` to that wheel's record in `customWheels.json`
   (leading slash, no `public/`). A store product may also carry its own `modelUrl`; when it does
   not, the linked brand wheel's model is used.
   With the CLI: `npm run add-wheel -- --name "TYPE 60" --price 75000 --glb "/models/wheels/type-60.glb"`.
3. Rebuild and deploy. Loading failures fall back to the procedural rim and show a small notice.

`sample-reference-rim.glb` is a low-poly test asset with the correct pivot, axes and mesh names.
It is not a real product; use it only to check the pipeline (or via the studio's "Test .GLB" button).

## File specification

- **Format:** Binary glTF 2.0 (`.glb`), textures embedded, one file per wheel finish.
- **Content:** bare rim only (barrel, spokes/face, bolts, centre cap). No tyre, brake or car.
- **Pivot / axes:** axle bore centre at `(0, 0, 0)`; front face toward `+Z`; up is `+Y`; the
  wheel spins around `Z`. The studio re-centres on the bounding box and scales the larger of the
  X/Y extents to the studio diameter, so mm/cm exports still load, but correct orientation is
  required.
- **Scale:** real metres (a 20–21" rim is roughly 0.50–0.55 m across).
- **Sub-mesh names (enable finish swatches on the model):** meshes whose names start with
  `Rim_Face`, `Rim_Barrel`, `Rim_Lip` or `Rim_Spokes` are re-tinted when the visitor changes finish.
  Keep `Hardware_Bolts` and `Center_Cap` as separate meshes so they keep their own materials.
  Recommended set: `Rim_Barrel`, `Rim_Face_Spokes`, `Hardware_Bolts`, `Center_Cap`.
- **Materials:** PBR metallic-roughness only (glTF standard). No spec/gloss or Phong.
- **Textures:** 2K BaseColor, Normal (OpenGL +Y), packed ORM (occlusion / roughness / metalness).
- **Geometry:** 0.5–1 mm chamfers or baked normals on spoke edges; keep under ~150k triangles
  for fast mobile loads (the studio reports mesh and triangle counts after load).
- **Blender export:** File → Export → glTF 2.0, format "glTF Binary", apply modifiers, +Y up.
