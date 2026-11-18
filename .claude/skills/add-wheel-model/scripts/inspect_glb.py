#!/usr/bin/env python3
"""Print what is inside a .glb: generator, triangles, parts, materials, textures, size.

    python3 -I inspect_glb.py FILE.glb

Read-only and safe on untrusted files. Exits 1 with a clear message if the file is missing, truncated or
not a GLB (a failed download is often a small HTML page).
"""
import json
import struct
import sys


def fail(msg: str) -> int:
    print(f'ERROR: {msg}', file=sys.stderr)
    return 1


def main() -> int:
    if len(sys.argv) != 2:
        return fail('usage: inspect_glb.py FILE.glb')
    path = sys.argv[1]
    try:
        with open(path, 'rb') as fh:
            d = fh.read()
    except OSError as err:
        return fail(f'could not read {path}: {err}')
    if len(d) < 20 or d[:4] != b'glTF':
        return fail(f'{path} is not a GLB (first bytes {d[:12]!r}). Was the download complete, or is it an HTML page?')

    magic, ver, length = struct.unpack('<4sII', d[:12])
    print('version', ver, 'declared bytes', length, 'actual bytes', len(d))
    if length != len(d):
        print('WARNING: size differs from the header, the file may be truncated', file=sys.stderr)

    js, binlen, off = None, 0, 12
    try:
        while off + 8 <= len(d):
            clen, ctype = struct.unpack('<I4s', d[off:off + 8])
            body = d[off + 8:off + 8 + clen]
            if ctype == b'JSON':
                js = json.loads(body)
            else:
                binlen = clen
            off += 8 + clen
    except (struct.error, ValueError) as err:
        return fail(f'could not parse {path}: {err}')
    if not isinstance(js, dict):
        return fail('no JSON chunk found: the file is damaged')

    print('bin chunk bytes', binlen)
    print('extensionsUsed', js.get('extensionsUsed'), 'required', js.get('extensionsRequired'))
    print('asset', js.get('asset'))

    acc = js.get('accessors', [])
    tris = verts = 0
    mins, maxs = [1e9] * 3, [-1e9] * 3
    for m in js.get('meshes', []):
        for pr in m.get('primitives', []):
            pos = pr.get('attributes', {}).get('POSITION')
            if pos is None or pos >= len(acc):
                continue
            a = acc[pos]
            verts += a.get('count', 0)
            if pr.get('indices') is not None and pr['indices'] < len(acc):
                tris += acc[pr['indices']].get('count', 0) // 3
            if 'min' in a and 'max' in a:
                for k in range(3):
                    mins[k] = min(mins[k], a['min'][k])
                    maxs[k] = max(maxs[k], a['max'][k])
    print('meshes', len(js.get('meshes', [])), 'nodes', len(js.get('nodes', [])), 'materials', len(js.get('materials', [])),
          'textures', len(js.get('textures', [])), 'images', len(js.get('images', [])))
    print('verts', verts, 'tris', tris)
    for i, n in enumerate(js.get('nodes', [])[:60]):
        print(i, n.get('name'), 'mesh' if 'mesh' in n else '', n.get('scale'), n.get('rotation'), n.get('translation'))
    for m in js.get('materials', [])[:20]:
        print('material', m.get('name'), json.dumps(m.get('pbrMetallicRoughness'))[:160])
    if mins[0] < 1e9:
        print('raw position bounds min', mins, 'max', maxs, 'size', [maxs[k] - mins[k] for k in range(3)])
    else:
        print('no position bounds recorded')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
