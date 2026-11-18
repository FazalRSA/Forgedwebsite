"""Blender pass for a site wheel model (optional, for inspection and a before/after studio render).

Needs Blender as a Python module in its own venv: python3 -m venv v && v/bin/pip install bpy
Tried on the FF-3 and FSA002 models (2026-11-18): it changed them very little, and the hair streaks from the
AI source mesh stayed. The source file, not this pass, limits the quality. Do not ship its output without
checking it in the site viewer and seeing a clear improvement.

usage: python blender_pass.py IN.glb OUT.glb RENDER_BEFORE.png RENDER_AFTER.png PAINT(black|silver|bronze) [--angle 32]
Steps: import -> weld -> remove hair/fin faces and loose bits -> consistent normals ->
sharp-edge shading by angle (crisp spoke/bolt edges, smooth surfaces) -> studio render -> export GLB."""
import os, sys, math, bpy, bmesh
from mathutils import Vector

if len(sys.argv) < 6:
    sys.exit('usage: python blender_pass.py IN.glb OUT.glb RENDER_BEFORE.png RENDER_AFTER.png black|silver|bronze [--angle 32]')
src, dst, r_before, r_after, paint = sys.argv[1:6]
if paint not in ('black', 'silver', 'bronze'):
    sys.exit(f'paint must be black, silver or bronze (got {paint!r})')
try:
    angle = float(sys.argv[sys.argv.index('--angle') + 1]) if '--angle' in sys.argv else 32.0
except (ValueError, IndexError):
    sys.exit('--angle needs a number of degrees, e.g. --angle 32')
if not 0 < angle < 180:
    sys.exit(f'--angle must be between 0 and 180 degrees (got {angle})')
if not os.path.isfile(src) or os.path.getsize(src) < 20 or open(src, 'rb').read(4) != b'glTF':
    sys.exit(f'ERROR: {src} is missing or is not a GLB (a failed download is often an HTML page)')
for out in (dst, r_before, r_after):
    folder = os.path.dirname(os.path.abspath(out))
    try:
        os.makedirs(folder, exist_ok=True)
    except OSError as err:
        sys.exit(f'ERROR: cannot create the output folder {folder}: {err}')


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not meshes:
        sys.exit(f'ERROR: {path} has no mesh in it')
    return meshes[0]

def studio(obj, out_png, kind):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
    sc.cycles.samples = 48; sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 900, 700
    sc.view_settings.view_transform = 'AgX'
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs[0].default_value = (0.5, 0.52, 0.55, 1)
    w.node_tree.nodes['Background'].inputs[1].default_value = 0.12
    # paint
    mat = bpy.data.materials.new('paint'); mat.use_nodes = True
    b = mat.node_tree.nodes['Principled BSDF']
    cfg = {'black': ((0.01, 0.01, 0.012, 1), 0.35, 0.3), 'silver': ((0.83, 0.85, 0.88, 1), 1.0, 0.12),
           'bronze': ((0.45, 0.28, 0.12, 1), 1.0, 0.3)}[kind]
    b.inputs['Base Color'].default_value = cfg[0]; b.inputs['Metallic'].default_value = cfg[1]
    b.inputs['Roughness'].default_value = cfg[2]
    b.inputs['Coat Weight'].default_value = 1.0; b.inputs['Coat Roughness'].default_value = 0.03
    obj.data.materials.clear(); obj.data.materials.append(mat)
    # floor + lights (reflections are the point: a big overhead strip and two side strips)
    bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, -0.265))
    fl = bpy.context.object; fm = bpy.data.materials.new('floor'); fm.use_nodes = True
    fm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.5, 0.5, 0.52, 1)
    fm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.5
    fl.data.materials.append(fm)
    def area(loc, size, energy, rot):
        bpy.ops.object.light_add(type='AREA', location=loc); l = bpy.context.object
        l.data.shape = 'RECTANGLE'; l.data.size, l.data.size_y = size; l.data.energy = energy
        l.rotation_euler = rot; return l
    area((0, 0.4, 2.4), (3.0, 1.2), 900, (0, 0, 0))
    area((-1.9, 0.6, 0.6), (2.2, 0.35), 500, (math.radians(90), 0, math.radians(-70)))
    area((1.9, 0.9, 0.6), (2.2, 0.35), 500, (math.radians(90), 0, math.radians(70)))
    # camera: 3/4 view of the face (face is +Y in Blender after glTF import)
    bpy.ops.object.camera_add(location=(1.15, -1.3, 0.5)); cam = bpy.context.object
    cam.data.lens = 85; sc.camera = cam
    d = (Vector((0, 0, 0)) - cam.location).normalized()
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = out_png; bpy.ops.render.render(write_still=True)
    # remove studio so the export contains only the wheel
    for o in list(bpy.context.scene.objects):
        if o is not obj: bpy.data.objects.remove(o, do_unlink=True)
    obj.data.materials.clear()

def clean(obj):
    me = obj.data; bm = bmesh.new(); bm.from_mesh(me)
    n0 = len(bm.faces)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.00005)
    bmesh.ops.dissolve_degenerate(bm, dist=0.00002, edges=bm.edges)
    # hair / fin faces: very thin and long relative to the wheel
    dia = max(v.co.length for v in bm.verts) * 2
    thin = []
    for f in bm.faces:
        es = [e.calc_length() for e in f.edges]
        lo, hi = min(es), max(es)
        if hi > 0.012 * dia and (f.calc_area() / (hi * hi + 1e-12)) < 0.012:
            thin.append(f)
    bmesh.ops.delete(bm, geom=thin, context='FACES')
    # loose verts/edges and tiny floating islands
    loose = [v for v in bm.verts if not v.link_faces]; bmesh.ops.delete(bm, geom=loose, context='VERTS')
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free(); me.update()
    print(f'faces {n0} -> {len(me.polygons)} (removed {len(thin)} thin)')

def shade(obj):
    bpy.context.view_layer.objects.active = obj; obj.select_set(True)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle), keep_sharp_edges=True)

reset(); obj = import_glb(src); studio(obj, r_before, paint)
reset(); obj = import_glb(src); clean(obj); shade(obj); studio(obj, r_after, paint)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_materials='NONE', export_normals=True,
                          export_apply=True, use_selection=False)
print('wrote', dst)
