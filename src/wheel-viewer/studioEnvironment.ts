import * as THREE from 'three';

/** Studio reflections: a neutral grey gradient dome (no colour cast, so a finish reads as its real colour) with bright softboxes and dark flags, prefiltered once. */
export function buildStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const envScene = new THREE.Scene();
  const dome = new THREE.SphereGeometry(50, 48, 24);
  const top = new THREE.Color(0.8, 0.8, 0.8);
  const horizon = new THREE.Color(0.31, 0.31, 0.31);
  const bottom = new THREE.Color(0.13, 0.13, 0.13);
  const tmp = new THREE.Color();
  const colours: number[] = [];
  const pos = dome.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const h = (pos.getY(i) / 50) * 0.5 + 0.5;
    if (h > 0.5) tmp.copy(horizon).lerp(top, (h - 0.5) * 2);
    else tmp.copy(bottom).lerp(horizon, h * 2);
    colours.push(tmp.r, tmp.g, tmp.b);
  }
  dome.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  const disposables: { dispose: () => void }[] = [dome];
  const domeMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide });
  disposables.push(domeMat);
  envScene.add(new THREE.Mesh(dome, domeMat));

  const addPanel = (w: number, h: number, at: [number, number, number], brightness: number) => {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(brightness, brightness, brightness),
      side: THREE.DoubleSide
    });
    disposables.push(geo, mat);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(at[0], at[1], at[2]);
    mesh.lookAt(0, 0, 0);
    envScene.add(mesh);
  };
  addPanel(40, 14, [0, 40, 8], 7); // overhead softbox
  addPanel(12, 34, [-38, 10, 6], 5); // left strip
  addPanel(12, 34, [38, 10, -8], 4); // right strip
  addPanel(46, 7, [0, 6, -42], 3); // back horizon strip
  addPanel(30, 6, [0, 5, 40], 2.2); // front fill
  // dark flags give mirror finishes something to contrast against
  addPanel(26, 30, [26, 4, 30], 0.01);
  addPanel(26, 30, [-28, 2, -26], 0.01);
  addPanel(60, 10, [0, -12, 0], 0.02);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(envScene, 0.02).texture;
  pmrem.dispose();
  disposables.forEach((d) => d.dispose());
  return texture;
}
