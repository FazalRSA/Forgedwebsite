# 3D Wheel Rim Models Directory

Place your photorealistic `.glb` 3D rim assets in this directory (e.g. `/public/models/wheels/type-52-forged.glb`).

## File Specifications
- **Format:** Binary glTF 2.0 (`.glb`) with embedded buffers and PBR textures.
- **Pivot:** Axle center at `(0, 0, 0)` with wheel face oriented along `+Z` (axle rotates on Z-axis).
- **Scale:** Real-world dimensions in meters (e.g. 20" - 22" rim diameter = ~0.50m - 0.56m). Note: The 3D viewer also includes an auto-normalizer so mm or cm scale exports are automatically adapted.
- **Parts/Meshes:** Rim only (no tires). For exploded view and finish variations, separate into sub-meshes:
  - `Rim_Barrel`
  - `Rim_Face_Spokes`
  - `Hardware_Bolts`
  - `Center_Cap`
- **PBR Standard:** Metallic-Roughness workflow with 2K textures (BaseColor, OpenGL Normal map, ORM packed ambient occlusion / roughness / metalness).
