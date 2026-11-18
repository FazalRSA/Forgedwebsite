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
 6. light Taubin smoothing, which hides the faceting AI meshes have without shrinking the wheel;
 7. scales to --diameter metres (0.53 = a 21 inch rim) and writes one mesh named Rim_Face_Spokes.
"""
import argparse
import sys

import numpy as np
import trimesh
from trimesh import smoothing


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
    if a.smooth < 0 or a.agg < 0:
        print('ERROR: --smooth and --agg must be 0 or more', file=sys.stderr)
        return 1

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
