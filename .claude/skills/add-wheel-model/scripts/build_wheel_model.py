#!/usr/bin/env python3
"""Turn a raw 3D wheel file (e.g. a Tripo export) into a site-ready .glb for the FORGED 3D studio.

    python3 -I build_wheel_model.py INPUT.glb OUTPUT.glb [--target 150000] [--agg 2] [--smooth 4]
                                    [--diameter 0.53] [--flip]

Needs: pip install trimesh fast-simplification scipy networkx numpy

What it does, in order (each step exists because skipping it broke something):
 1. keeps only the biggest connected piece: AI exports weld a brake caliper/rotor and stray fragments
    behind the barrel, and the studio would paint them like the wheel;
 2. drops the baked texture/UVs: the studio paints the wheel with its own finishes, so a baked colour
    would fight the swatches;
 3. puts the axle on Z (the thinnest side of the bounding box) and centres the bore on the origin;
 4. quadric-decimates to --target triangles (phones; the repo's budget is about 150k);
 5. removes only long, thin "web" triangles that decimation drags across the open gaps between spokes
    (too aggressive a filter leaves holes in the barrel, so the thresholds are deliberately loose);
 6. (--fold-angle) removes the thin "fins" AI meshes grow in spoke windows and on the lip: small clusters of
    faces that fold back on their neighbours by more than the angle are cut away, along with what they
    were holding up. Long sharp edges (the rim lip) are big clusters and stay;
 7. light Taubin smoothing, which hides the faceting AI meshes have without shrinking the wheel;
 8. scales to --diameter metres (0.53 = a 21 inch rim);
 9. (--normal-smooth) bakes smoother shading normals into the file: they come from a heavily smoothed copy of
    the wheel and are blended with the real ones, so a polished finish reflects calmly instead of showing every
    bump of the AI surface, while the silhouette and edges stay exactly as they are;
10. (--barrel-smooth) straightens the barrel: a real barrel is a smooth shape of revolution, an AI barrel is
    rippled. Each barrel vertex is pulled toward the median radius of its height along the axle, by at most a
    few millimetres, so ripples go and real steps, grooves, bolts and spokes stay;
11. writes one mesh named Rim_Face_Spokes.
"""
import argparse
import sys

import numpy as np
import trimesh
from trimesh import smoothing


def remove_fins(mesh: trimesh.Trimesh, fold_deg: float, max_faces: int) -> trimesh.Trimesh:
    """Cut away the thin fins AI meshes grow: small clusters of faces that fold back on their neighbours."""
    for round_no in range(3):
        adj = mesh.face_adjacency
        sharp = mesh.face_adjacency_angles > np.radians(fold_deg)
        fold_faces = np.unique(adj[sharp].ravel())
        if len(fold_faces) == 0:
            break
        # connected clusters among the fold faces
        idx = {int(f): i for i, f in enumerate(fold_faces)}
        parent = list(range(len(fold_faces)))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for a_, b_ in adj[sharp]:
            ra, rb = find(idx[int(a_)]), find(idx[int(b_)])
            if ra != rb:
                parent[ra] = rb
        sizes = {}
        for f, i in idx.items():
            sizes[find(i)] = sizes.get(find(i), 0) + 1
        kill = np.array([f for f, i in idx.items() if sizes[find(i)] <= max_faces], dtype=int)
        if len(kill) == 0:
            break
        keep = np.ones(len(mesh.faces), dtype=bool)
        keep[kill] = False
        mesh.update_faces(keep)
        mesh.remove_unreferenced_vertices()
        pieces = sorted(mesh.split(only_watertight=False), key=lambda p: -len(p.faces))
        mesh = trimesh.util.concatenate([p for p in pieces if len(p.faces) >= 0.002 * len(pieces[0].faces)])
        print(f'fin removal round {round_no + 1}: cut {len(kill)} faces, {len(pieces) - 1} loose pieces checked')
    return mesh


def rebuild_barrel(mesh: trimesh.Trimesh, wall_mm: float) -> trimesh.Trimesh:
    """Replace the barrel walls with a clean shape of revolution and return the new mesh (axle is Z).

    Some AI meshes model the barrel as a thick double skin (an outer wall and an inner wall about 30 mm
    apart) where a real forged barrel is one thin wall. Faces of the barrel zone (between the back lip
    and the face side) are removed and rebuilt from the median outer radius at each height, with an inner
    wall `wall_mm` inside it, blended to the old inner wall where the zone meets the lip and the face."""
    v = mesh.vertices
    centre = (v[:, :2].min(axis=0) + v[:, :2].max(axis=0)) / 2
    d = v[:, :2] - centre
    r = np.linalg.norm(d, axis=1)
    rmax = r.max()
    mm = rmax / 265.0
    z = v[:, 2]
    zlo, zhi = z.min(), z.max()
    face_up = (z[r < 0.5 * rmax].mean() > (zlo + zhi) / 2) if (r < 0.5 * rmax).any() else True
    depth = (z - zlo) / (zhi - zlo) if face_up else (zhi - z) / (zhi - zlo)  # 0 = back, 1 = face
    rhat = d / (r[:, None] + 1e-12)
    n_r = (mesh.vertex_normals[:, :2] * rhat).sum(axis=1)

    D0, D1 = 0.13, 0.78  # the zone that is rebuilt
    edges = np.linspace(D0 - 0.02, D1 + 0.02, 90)
    which = np.digitize(depth, edges)

    def profile(sel):
        vals, keys = [], []
        for b in range(1, len(edges)):
            m = sel & (which == b)
            if m.sum() >= 5:
                keys.append((edges[b - 1] + edges[b]) / 2)
                vals.append(np.median(r[m]))
        if len(keys) < 10:
            raise ValueError('could not read the barrel profile (is the axle Z?)')
        vals = np.array(vals)
        sm = np.array([vals[max(0, i - 3): i + 4].mean() for i in range(len(vals))])
        return np.array(keys), sm

    outer_sel = (n_r > 0.7) & (r > 0.8 * rmax)
    inner_sel = (n_r < -0.7) & (r > 0.7 * rmax) & (r < 0.97 * rmax)
    ko, vo = profile(outer_sel)
    ki, vi = profile(inner_sel)

    OVER = 0.05  # the new walls run this far into the lips, so no seam shows
    ds = np.linspace(D0 - OVER, D1 + OVER, 90)
    r_out = np.interp(ds, ko, vo)
    r_old_in = np.interp(ds, ki, vi)
    # inner wall: wall_mm inside the outer, blended to the old inner wall within 0.08 of each end
    r_thin = r_out - wall_mm * mm
    k = np.clip(np.minimum(ds - (D0 - OVER), (D1 + OVER) - ds) / 0.08, 0, 1)
    k = 0.5 - 0.5 * np.cos(np.pi * k)
    r_in = (1 - k) * np.minimum(r_old_in, r_thin) + k * r_thin

    # drop the old barrel faces
    f = mesh.faces
    cen_depth = depth[f].mean(axis=1)
    cen_r = r[f].mean(axis=1)
    drop = (cen_depth > D0) & (cen_depth < D1) & (cen_r > 0.7 * rmax)
    kept = trimesh.Trimesh(vertices=v.copy(), faces=f[~drop], process=False)
    kept.remove_unreferenced_vertices()

    steps = 192
    th = np.linspace(0, 2 * np.pi, steps, endpoint=False)
    zs = zlo + ds * (zhi - zlo) if face_up else zhi - ds * (zhi - zlo)
    new_parts = []
    for radius, outward in ((r_out, True), (r_in, False)):
        X = centre[0] + radius[:, None] * np.cos(th)[None, :]
        Y = centre[1] + radius[:, None] * np.sin(th)[None, :]
        Z = np.repeat(zs[:, None], steps, axis=1)
        verts = np.stack([X, Y, Z], axis=-1).reshape(-1, 3)
        idx = np.arange(len(ds) * steps).reshape(len(ds), steps)
        a, b = idx[:-1], idx[1:]
        a2, b2 = np.roll(a, -1, axis=1), np.roll(b, -1, axis=1)
        faces = np.concatenate([np.stack([a, b, a2], -1).reshape(-1, 3), np.stack([a2, b, b2], -1).reshape(-1, 3)])
        part = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
        # face the walls outward (outer) or toward the axle (inner)
        cen = part.triangles_center
        radial = np.zeros_like(cen)
        radial[:, :2] = cen[:, :2] - centre
        sign = np.sign((part.face_normals * radial).sum(axis=1)) * (1 if outward else -1)
        flip = sign < 0
        part.faces[flip] = part.faces[flip][:, ::-1]
        new_parts.append(part)
    out = trimesh.util.concatenate([kept] + new_parts)
    print(f'barrel rebuilt: {int(drop.sum())} faces replaced by a {wall_mm:g} mm wall (outer r {r_out.min() / mm:.0f} to {r_out.max() / mm:.0f} mm)')
    return out


def straighten_barrel(mesh: trimesh.Trimesh, max_mm: float) -> None:
    """Pull barrel vertices toward the median radius of their height along the axle (the axle is Z).
    Works in place. Vertices on the face-side lip (bolts), on spokes and on real steps are not moved:
    only mostly-radial surfaces in the rear part of the wheel, and never by more than max_mm."""
    v = mesh.vertices
    centre = (v[:, :2].min(axis=0) + v[:, :2].max(axis=0)) / 2
    d = v[:, :2] - centre
    r = np.linalg.norm(d, axis=1)
    rmax = r.max()
    unit_mm = rmax / 265.0  # a 0.53 m wheel is 265 mm in radius, whatever unit the file is in
    z = v[:, 2]
    zlo, zhi = z.min(), z.max()
    rhat = d / (r[:, None] + 1e-12)
    n = mesh.vertex_normals
    n_r = (n[:, :2] * rhat).sum(axis=1)
    # the face side is where the spokes are; find it as the side with the larger share of small-radius vertices
    face_up = (z[r < 0.5 * rmax].mean() > (zlo + zhi) / 2) if (r < 0.5 * rmax).any() else True
    depth = (z - zlo) / (zhi - zlo) if face_up else (zhi - z) / (zhi - zlo)   # 0 = back, 1 = face
    zone = (depth < 0.82) & (r > 0.7 * rmax)
    radial = np.abs(n_r) > 0.7
    weight = np.clip((np.abs(n_r) - 0.7) / 0.22, 0, 1) * np.clip((0.82 - depth) / 0.08, 0, 1)
    new_r = r.copy()
    bins = np.linspace(0, 0.82, 120)
    for sign in (1, -1):  # outer wall, inner wall
        sel = zone & radial & (np.sign(n_r) == sign)
        if sel.sum() < 200:
            continue
        which = np.digitize(depth[sel], bins)
        prof = {}
        for b in np.unique(which):
            prof[b] = np.median(r[sel][which == b])
        keys = sorted(prof)
        vals = np.array([prof[k] for k in keys])
        k = 2  # light moving average along the profile
        sm = np.array([vals[max(0, i - k): i + k + 1].mean() for i in range(len(vals))])
        target = np.interp(which, keys, sm)
        shift = np.clip(target - r[sel], -max_mm * unit_mm, max_mm * unit_mm)
        new_r[np.where(sel)[0]] = r[sel] + shift * weight[sel]
    moved = np.abs(new_r - r) > 1e-9
    scale = new_r / (r + 1e-12)
    v[:, 0] = centre[0] + d[:, 0] * scale
    v[:, 1] = centre[1] + d[:, 1] * scale
    mesh.vertices = v
    print(f'barrel straightened: {int(moved.sum())} vertices moved by at most {max_mm:g} mm')


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--target', type=int, default=150000, help='triangles to keep')
    ap.add_argument('--agg', type=int, default=2, help='decimation aggression, lower is gentler')
    ap.add_argument('--smooth', type=int, default=4, help='Taubin smoothing iterations')
    ap.add_argument('--diameter', type=float, default=0.53, help='rim diameter in metres')
    ap.add_argument('--width', type=float, default=None,
                    help='squash the wheel to this width in metres (AI meshes often come out too deep); default keeps the file\'s proportions')
    ap.add_argument('--sliver-ratio', type=float, default=0.03,
                    help='remove triangles thinner than this (area / longest edge squared); higher removes more')
    ap.add_argument('--sliver-len', type=float, default=0.05,
                    help='...and longer than this fraction of the wheel diameter; lower removes more')
    ap.add_argument('--fold-angle', type=float, default=0.0,
                    help='degrees; remove small clusters of faces folding back by more than this (0 = off, 110 to 130 is typical)')
    ap.add_argument('--fold-max-faces', type=int, default=600,
                    help='a fold cluster with more faces than this is a real edge (the rim lip) and is kept')
    ap.add_argument('--normal-smooth', type=int, default=0,
                    help='Taubin iterations for the smoothed copy that shading normals come from (0 = off, 20 to 40 is typical)')
    ap.add_argument('--normal-blend', type=float, default=0.8,
                    help='0..1, how much of the smoothed normal to use')
    ap.add_argument('--cache', default=None,
                    help='file to keep the decimated mesh in (.npz); a later run with the same file skips the slow first half, so several clean-up settings can be tried quickly')
    ap.add_argument('--rebuild-barrel', type=float, default=0.0,
                    help='mm; replace the barrel with a clean shape of revolution with this wall thickness (0 = off, 6 is typical)')
    ap.add_argument('--barrel-smooth', type=float, default=0.0,
                    help='mm; straighten ripples in the barrel by at most this far (0 = off, 3 to 5 is typical)')
    ap.add_argument('--flip', action='store_true', help='turn the wheel 180 degrees if the face points to -Z')
    a = ap.parse_args()
    # a negative or zero size would mirror or flatten the wheel without any error, so refuse it up front
    for name, value in (('--target', a.target), ('--diameter', a.diameter), ('--width', a.width if a.width is not None else 1)):
        if value <= 0:
            print(f'ERROR: {name} must be greater than 0 (got {value})', file=sys.stderr)
            return 1
    if not 0 <= a.sliver_ratio <= 1 or a.sliver_len < 0:
        print('ERROR: --sliver-ratio must be between 0 and 1 and --sliver-len 0 or more '
              '(a negative length would delete every thin triangle and leave holes)', file=sys.stderr)
        return 1
    if a.fold_angle < 0 or a.fold_angle >= 180 or a.fold_max_faces < 1:
        print('ERROR: --fold-angle must be 0 (off) up to 180, and --fold-max-faces at least 1', file=sys.stderr)
        return 1
    if a.rebuild_barrel < 0 or a.rebuild_barrel > 20:
        print('ERROR: --rebuild-barrel must be 0 (off) up to 20 mm', file=sys.stderr)
        return 1
    if a.barrel_smooth < 0 or a.barrel_smooth > 15:
        print('ERROR: --barrel-smooth must be 0 (off) up to 15 mm', file=sys.stderr)
        return 1
    if a.normal_smooth < 0 or not 0 <= a.normal_blend <= 1:
        print('ERROR: --normal-smooth must be 0 or more and --normal-blend between 0 and 1', file=sys.stderr)
        return 1
    if a.smooth < 0 or a.agg < 0:
        print('ERROR: --smooth and --agg must be 0 or more', file=sys.stderr)
        return 1

    import os as _os
    # The cache is only valid for the same input file and the same decimation settings, so it carries a
    # signature of both. A cache from another wheel (or an unreadable one) is ignored, never silently used.
    try:
        signature = f'{_os.path.getsize(a.src)}|{int(_os.path.getmtime(a.src))}|{a.target}|{a.agg}|{a.sliver_ratio}|{a.sliver_len}|{a.flip}'
    except OSError:
        signature = ''
    dec = None
    if a.cache and _os.path.isfile(a.cache):
        try:
            z = np.load(a.cache, allow_pickle=False)
            if str(z['sig']) == signature and signature:
                dec = trimesh.Trimesh(vertices=z['v'], faces=z['f'], process=False)
                print(f'loaded the decimated mesh from {a.cache}: {len(dec.faces):,} triangles')
            else:
                print(f'WARNING: {a.cache} was made from a different file or settings, so it is ignored', file=sys.stderr)
        except (OSError, ValueError, KeyError) as err:
            print(f'WARNING: could not read the cache {a.cache} ({err}); starting from the source file', file=sys.stderr)
    if dec is None:
        try:
            m = trimesh.load(a.src, force='mesh', process=False)
        except Exception as err:  # unreadable, truncated (a failed download) or not a 3D file
            print(f'ERROR: could not read {a.src}: {err}', file=sys.stderr)
            return 1
        if len(getattr(m, 'faces', [])) == 0:
            print(f'ERROR: {a.src} has no triangles. Was the download complete?', file=sys.stderr)
            return 1
        print(f'loaded {len(m.faces):,} triangles')
        m.merge_vertices(merge_tex=True, merge_norm=True)
        parts = sorted(m.split(only_watertight=False), key=lambda p: -len(p.faces))
        wheel = parts[0]
        dropped = sum(len(p.faces) for p in parts[1:])
        print(f'kept the wheel ({len(wheel.faces):,} triangles); dropped {dropped:,} triangles in {len(parts) - 1} other pieces (brake, fragments)')
        if len(parts) > 1 and len(parts[1].faces) > 0.5 * len(wheel.faces):
            print('WARNING: the second piece is nearly as big as the first, so the wheel may be split. Look at the preview.', file=sys.stderr)

        mesh = trimesh.Trimesh(vertices=wheel.vertices.copy(), faces=wheel.faces.copy(), process=False)
        mesh.remove_unreferenced_vertices()

        # axle onto Z: the thinnest side of the bounding box is the wheel's width
        ext = mesh.extents
        thin = int(np.argmin(ext))
        if thin == 0:
            mesh.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [0, 1, 0]))
        elif thin == 1:
            mesh.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0]))
        if a.flip:
            mesh.apply_transform(trimesh.transformations.rotation_matrix(np.pi, [0, 1, 0]))

        dec = mesh.simplify_quadric_decimation(face_count=a.target, aggression=a.agg)
        print(f'decimated to {len(dec.faces):,} triangles')

        v, f = dec.vertices, dec.faces
        edges = np.stack([np.linalg.norm(v[f[:, i]] - v[f[:, (i + 1) % 3]], axis=1) for i in range(3)], 1)
        longest = edges.max(1)
        dia0 = max(dec.extents[0], dec.extents[1])
        sliver = (dec.area_faces / (longest ** 2 + 1e-12) < a.sliver_ratio) & (longest > a.sliver_len * dia0)
        print(f'removed {int(sliver.sum())} web triangles')
        dec.update_faces(~sliver)
        dec.remove_unreferenced_vertices()
        pieces = sorted(dec.split(only_watertight=False), key=lambda p: -len(p.faces))
        dec = trimesh.util.concatenate([p for p in pieces if len(p.faces) >= 0.01 * len(pieces[0].faces)])

        if a.cache:
            try:
                np.savez(a.cache, v=dec.vertices, f=dec.faces, sig=signature)
            except OSError as err:
                print(f'WARNING: could not write the cache {a.cache}: {err}', file=sys.stderr)

    if a.fold_angle > 0:
        dec = remove_fins(dec, a.fold_angle, a.fold_max_faces)

    if a.rebuild_barrel > 0:
        try:
            dec = rebuild_barrel(dec, a.rebuild_barrel)
        except ValueError as err:
            print(f'ERROR: --rebuild-barrel could not read the barrel: {err}. Try --barrel-smooth instead, or leave both off.', file=sys.stderr)
            return 1
    elif a.barrel_smooth > 0:
        straighten_barrel(dec, a.barrel_smooth)

    smoothing.filter_taubin(dec, lamb=0.5, nu=-0.53, iterations=a.smooth)

    b = dec.bounds
    dia = max(b[1][0] - b[0][0], b[1][1] - b[0][1])
    dec.apply_translation([-(b[0][0] + b[1][0]) / 2, -(b[0][1] + b[1][1]) / 2, 0])
    dec.apply_scale(a.diameter / dia)
    if a.width is not None:
        z = dec.extents[2]
        if z <= 0:
            print('ERROR: the wheel has no depth, cannot squash it', file=sys.stderr)
            return 1
        dec.apply_scale([1, 1, a.width / z])
        print(f'squashed the width from {z:.3f} m to {a.width:.3f} m')
    if a.normal_smooth > 0:
        calm = dec.copy()
        smoothing.filter_taubin(calm, lamb=0.5, nu=-0.53, iterations=a.normal_smooth)
        n = (1 - a.normal_blend) * dec.vertex_normals + a.normal_blend * calm.vertex_normals
        n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-12
        dec.vertex_normals = n
        print(f'baked smoothed shading normals ({a.normal_smooth} iterations, blend {a.normal_blend})')
    else:
        dec.vertex_normals  # smooth normals, computed once

    scene = trimesh.Scene()
    scene.add_geometry(dec, node_name='Rim_Face_Spokes', geom_name='Rim_Face_Spokes')
    try:
        scene.export(a.dst)
    except OSError as err:
        print(f'ERROR: could not write {a.dst}: {err}', file=sys.stderr)
        return 1
    w = dec.extents
    print(f'wrote {a.dst}: {len(dec.faces):,} triangles, {w[0]:.3f} x {w[1]:.3f} m across, {w[2]:.3f} m wide')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
