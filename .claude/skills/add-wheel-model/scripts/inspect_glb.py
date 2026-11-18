import sys, json, struct
p = sys.argv[1]
d = open(p,'rb').read()
magic, ver, length = struct.unpack('<4sII', d[:12])
print('magic', magic, 'version', ver, 'declared', length, 'actual', len(d))
off = 12; js=None; binlen=0
while off < len(d):
    clen, ctype = struct.unpack('<I4s', d[off:off+8]); body = d[off+8:off+8+clen]
    if ctype == b'JSON': js = json.loads(body)
    else: binlen = clen
    off += 8+clen
print('bin chunk bytes', binlen)
print('extensionsUsed', js.get('extensionsUsed'), 'required', js.get('extensionsRequired'))
print('generator', js.get('asset'))
acc=js['accessors']; tris=0; verts=0
for m in js['meshes']:
    for pr in m['primitives']:
        verts += acc[pr['attributes']['POSITION']]['count']
        if 'indices' in pr: tris += acc[pr['indices']]['count']//3
print('meshes', len(js['meshes']), 'nodes', len(js['nodes']), 'materials', len(js.get('materials',[])), 'textures', len(js.get('textures',[])), 'images', len(js.get('images',[])))
print('verts', verts, 'tris', tris)
for i,n in enumerate(js['nodes'][:60]):
    print(i, n.get('name'), 'mesh' if 'mesh' in n else '', n.get('scale'), n.get('rotation'), n.get('translation'))
for m in js.get('materials',[])[:20]: print('mat', m.get('name'), json.dumps(m.get('pbrMetallicRoughness'))[:160])
for im in js.get('images',[])[:12]: print('img', im.get('name'), im.get('mimeType'), js['bufferViews'][im['bufferView']]['byteLength'] if 'bufferView' in im else im.get('uri','')[:40])
mins=[1e9]*3; maxs=[-1e9]*3
for m in js['meshes']:
    for pr in m['primitives']:
        a=acc[pr['attributes']['POSITION']]
        if 'min' in a:
            for k in range(3): mins[k]=min(mins[k],a['min'][k]); maxs[k]=max(maxs[k],a['max'][k])
print('raw position bounds min', mins, 'max', maxs, 'size', [maxs[k]-mins[k] for k in range(3)])
