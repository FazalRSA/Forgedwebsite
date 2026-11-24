#!/usr/bin/env python3
"""Renders the colour swatch stills: each design in each colour, face-on, in a Cycles recreation of the 3D viewer studio.
Paints come from src/data/studioFinishes.ts (fitted against the real photos). Needs `pip install bpy pillow numpy`."""
from __future__ import annotations
import json, math, os, sys
import numpy as np
import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------- the viewer's studio, as an equirectangular HDR (same panel list as studioEnvironment.ts) ----------
PANELS = [  # width, height, position (three.js coords), brightness
    (40, 14, (0, 40, 8), 7.0),
    (12, 34, (-38, 10, 6), 5.0),
    (12, 34, (38, 10, -8), 4.0),
    (46, 7, (0, 6, -42), 3.0),
    (30, 6, (0, 5, 40), 2.2),
    (26, 30, (26, 4, 30), 0.01),
    (26, 30, (-28, 2, -26), 0.01),
    (60, 10, (0, -12, 0), 0.02),
]
TOP, HORIZON, BOTTOM = (0.8, 0.8, 0.8), (0.31, 0.31, 0.31), (0.13, 0.13, 0.13)


def srgb_to_linear(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def build_env_pixels(w=2048, h=1024):
    u = (np.arange(w) + 0.5) / w
    v = (np.arange(h) + 0.5) / h
    phi = (u - 0.5) * 2 * np.pi
    theta = (v - 0.5) * np.pi
    PHI, THETA = np.meshgrid(phi, theta)
    bx = -np.cos(THETA) * np.cos(PHI)
    by = np.cos(THETA) * np.sin(PHI)
    bz = np.sin(THETA)
    # Blender (x, y, z) -> three.js (x, z, -y)
    dx, dy, dz = bx, bz, -by
    # gradient dome (the viewer's dome is lit in sRGB-ish vertex colours treated as linear; keep as given)
    hh = dy * 0.5 + 0.5
    top, hor, bot = (np.array(c) for c in (TOP, HORIZON, BOTTOM))
    up = hor[None, None, :] + (top - hor)[None, None, :] * np.clip((hh - 0.5) * 2, 0, 1)[..., None]
    dn = bot[None, None, :] + (hor - bot)[None, None, :] * np.clip(hh * 2, 0, 1)[..., None]
    img = np.where((hh > 0.5)[..., None], up, dn)
    tbest = np.full(hh.shape, np.inf)
    for pw, ph, P, bright in PANELS:
        P = np.array(P, dtype=np.float64)
        z = -P / np.linalg.norm(P)
        x = np.cross([0, 1, 0], z)
        x /= np.linalg.norm(x)
        y = np.cross(z, x)
        dotp = dx * P[0] + dy * P[1] + dz * P[2]
        with np.errstate(divide='ignore', invalid='ignore'):
            t = (P @ P) / dotp
        hx, hy, hz = t * dx - P[0], t * dy - P[1], t * dz - P[2]
        uu = hx * x[0] + hy * x[1] + hz * x[2]
        vv = hx * y[0] + hy * y[1] + hz * y[2]
        hit = (dotp > 0) & (np.abs(uu) < pw / 2) & (np.abs(vv) < ph / 2) & (t < tbest)
        img[hit] = bright
        tbest[hit] = t[hit]
    rgba = np.concatenate([img, np.ones(img.shape[:2] + (1,))], axis=2).astype(np.float32)
    return w, h, rgba


# ---------- scene ----------
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'
    sc.render.threads_mode = 'FIXED'
    sc.render.threads = 2
    cy.use_denoising = True
    cy.denoiser = 'OPENIMAGEDENOISE'
    cy.max_bounces = 8
    cy.diffuse_bounces = 2
    cy.glossy_bounces = 6
    cy.transmission_bounces = 2
    cy.sample_clamp_indirect = 10
    cy.blur_glossy = 0.2
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.color_depth = '8'
    try:
        sc.view_settings.view_transform = 'Khronos PBR Neutral'
    except TypeError as e:
        print('view transform:', e)
    sc.view_settings.look = 'None'
    return sc


def setup_world(sc):
    global BG_NODE
    w, h, rgba = build_env_pixels()
    img = bpy.data.images.new('studio_env', w, h, alpha=True, float_buffer=True)
    img.colorspace_settings.name = 'Linear Rec.709'
    img.pixels.foreach_set(rgba.ravel())
    img.pack()
    world = bpy.data.worlds.new('Studio')
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    env = nt.nodes.new('ShaderNodeTexEnvironment')
    env.image = img
    bg = nt.nodes.new('ShaderNodeBackground')
    BG_NODE = bg
    out = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(env.outputs['Color'], bg.inputs['Color'])
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])
    sc.world = world
    # the stage's key light (directional 3.8 at three (1.2, 2.2, 1.0)) -> Blender direction (1.2, -1.0, 2.2)
    sun = bpy.data.lights.new('Key', 'SUN')
    sun.energy = 3.8
    sun.angle = math.radians(2.5)
    so = bpy.data.objects.new('Key', sun)
    bpy.context.scene.collection.objects.link(so)
    so.rotation_euler = Vector((1.2, -1.0, 2.2)).to_track_quat('Z', 'Y').to_euler()


def principled(name, hexcol, metal, rough, coat, coat_rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    r, g, b = srgb_to_linear(hex_rgb(hexcol))
    bsdf.inputs['Base Color'].default_value = (r, g, b, 1)
    bsdf.inputs['Metallic'].default_value = metal
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Coat Weight'].default_value = coat
    bsdf.inputs['Coat Roughness'].default_value = coat_rough
    return m


def paint_numbers(paint, name):
    """The viewer's defaultPaintRenderer.apply, in Python (matte names flatten the paint)."""
    import re
    matte = paint.get('matte')
    if matte is None:
        # Split one-word names at their capitals first ("BlackMatte" -> "Black Matte"), as the viewer does.
        words = re.sub(r'([a-z])([A-Z])', r'\1 \2', name or '')
        matte = bool(re.search(r'\b(matte|matt|satin|flat)\b', words, re.I))
    metal = min(paint['metalness'], 0.2) if matte else paint['metalness']
    rough = max(paint['roughness'], 0.6) if matte else paint['roughness']
    coat = min(paint['clearcoat'], 0.05) if matte else paint['clearcoat']
    ccr = 0.6 if matte else paint.get('clearcoatRoughness', 0.08)
    return metal, rough, coat, ccr


def load_model(path, flip=False):
    for o in list(bpy.data.objects):
        if o.type == 'MESH':
            bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.import_scene.gltf(filepath=path)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    # centre on the bounding box
    mn = Vector((1e9,) * 3)
    mx = Vector((-1e9,) * 3)
    for o in meshes:
        for c in o.bound_box:
            wv = o.matrix_world @ Vector(c)
            mn = Vector(min(a, b) for a, b in zip(mn, wv))
            mx = Vector(max(a, b) for a, b in zip(mx, wv))
    ctr = (mn + mx) / 2
    for o in meshes:
        if o.parent is None:
            o.location -= ctr
    bpy.context.view_layer.update()
    return meshes, (mx - mn)


def set_camera(sc, view, diameter, size):
    cam = bpy.data.cameras.new('Cam')
    cam.lens = 85
    cam.sensor_width = 36
    co = bpy.data.objects.new('Cam', cam)
    sc.collection.objects.link(co)
    sc.camera = co
    fov = 2 * math.atan(36 / 2 / 85)
    if view == 'face':
        az, el, fill = 0.0, 0.0, 1.14
    else:
        az, el, fill = 32.0, 9.0, 1.30
    # distance so the wheel's diameter fills `fill` of the frame width... use sphere radius of the wheel
    radius = diameter / 2 * math.sqrt(1 + (0.25) ** 2 if view != 'face' else 1.0)
    dist = (radius * fill) / math.tan(fov / 2)
    a, e = math.radians(az), math.radians(el)
    d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
    co.location = d * dist
    co.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    sc.render.resolution_x = sc.render.resolution_y = size
    return co


def render(sc, path, samples):
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.02
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


def run(jobs, outdir, size, samples, views=('hero',)):
    os.makedirs(outdir, exist_ok=True)
    sc = reset_scene()
    setup_world(sc)
    bydesign = {}
    for j in jobs:
        bydesign.setdefault(j['model'], []).append(j)
    for model, js in bydesign.items():
        meshes, dims = load_model(model)
        diameter = max(dims.x, dims.z)
        for j in js:
            m, ro, co_, ccr = paint_numbers(j['paint'], j['name'])
            BG_NODE.inputs['Strength'].default_value = j['paint'].get('envMapIntensity', 1.1)
            mat = principled(j['key'], j['paint']['hex'], m, ro, co_, ccr)
            for o in meshes:
                o.data.materials.clear()
                o.data.materials.append(mat)
            for view in views:
                for o in list(bpy.data.objects):
                    if o.type == 'CAMERA':
                        bpy.data.objects.remove(o, do_unlink=True)
                set_camera(sc, view, diameter, size if view == 'hero' else j.get('face_size', size))
                path = os.path.join(outdir, f"{j['key']}_{view}.png")
                render(sc, path, samples)
                print('rendered', path, flush=True)


def plain_glb(path, tmp):
    """bpy cannot read meshopt-compressed GLBs (FSA001); decode those to a plain copy first."""
    import subprocess
    try:
        with open(path, 'rb') as fh:
            head = fh.read(200000)
    except OSError as err:
        raise SystemExit(f'Could not read model {path}: {err}')
    if b'EXT_meshopt_compression' not in head:
        return path
    out = os.path.join(tmp, os.path.basename(path))
    if not os.path.exists(out):
        try:
            subprocess.check_call(['npx', '-y', '@gltf-transform/cli@4', 'copy', path, out])
        except (subprocess.CalledProcessError, OSError) as err:
            raise SystemExit(f'Could not decode meshopt model {path}: {err}')
    return out


def build_stills(repo, size=384, samples=24, only=None):
    """Render every design x colour as a face-on studio still, convert to webp and write src/data/finishStills.json."""
    import subprocess, tempfile
    from PIL import Image
    try:
        jobs = json.loads(subprocess.check_output(['npx', 'tsx', 'scripts/finish-still-jobs.ts'], cwd=repo))
    except (subprocess.CalledProcessError, OSError, ValueError) as err:
        raise SystemExit(f'Could not read the still jobs from scripts/finish-still-jobs.ts: {err}')
    out_dir = os.path.join(repo, 'public/images/wheels/finishes')
    try:
        os.makedirs(out_dir, exist_ok=True)
        tmp = tempfile.mkdtemp()
    except OSError as err:
        raise SystemExit(f'Could not create output folders: {err}')
    todo = []
    for j in jobs:
        j['key'] = f"{j['design'].lower()}-{j['finishId']}"
        j['model'] = plain_glb(os.path.join(repo, 'public', j['model'].lstrip('/')), tmp)
        j['face_size'] = size
        if not only or j['key'] in only:
            todo.append(j)
    try:
        run(todo, tmp, size, samples, views=('face',))
    except (OSError, RuntimeError) as err:
        raise SystemExit(f'Render failed: {err}')
    manifest = {}
    for j in jobs:
        webp = f"{j['key']}.webp"
        png = os.path.join(tmp, f"{j['key']}_face.png")
        if os.path.exists(png):
            try:
                Image.open(png).save(os.path.join(out_dir, webp), 'WEBP', quality=88)
            except OSError as err:
                raise SystemExit(f'Could not write {webp}: {err}')
        elif not os.path.exists(os.path.join(out_dir, webp)):
            raise SystemExit(f"No render and no existing still for {j['key']}; manifest not written")
        manifest.setdefault(j['design'], {})[j['finishId']] = f'/images/wheels/finishes/{webp}'
    try:
        with open(os.path.join(repo, 'src/data/finishStills.json'), 'w') as fh:
            json.dump(manifest, fh, indent=2)
    except OSError as err:
        raise SystemExit(f'Could not write finishStills.json: {err}')
    print('wrote', len(jobs), 'stills')


if __name__ == '__main__':
    # Run inside Blender-as-a-module (pip install bpy pillow): python3 scripts/render-finish-stills.py [size] [samples] [key ...]
    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    a = sys.argv[1:]
    build_stills(repo, int(a[0]) if a else 384, int(a[1]) if len(a) > 1 else 24, set(a[2:]) or None)
