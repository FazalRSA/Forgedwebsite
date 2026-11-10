import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { WHEEL_FINISHES, type WheelFinishId } from '../../data/catalogue';
import { getStudioFinish } from '../../data/studioFinishes';
import {
  BRAKE_PARTS,
  FINISH_PARTS,
  cameraDistanceScale,
  classifyStudioPart,
  explodeOffsets,
  isMatteFinishName,
  prefersReducedMotion,
  type StudioPart,
} from '../../utils/wheelStudioParts';

/**
 * 3D wheel studio for wheels that have a real .glb model.
 *
 * A light product-photography stage: studio reflections built in code (no HDR download),
 * a soft contact shadow, physically based paint, fixed camera views, and a Front / Rear switch for
 * wheels with a second model. The wheel pages mount it only after the visitor taps "View in 3D".
 *
 * The default (simple) stage is for customers: views, Front / Rear, a visible "Close 3D" button.
 * `advanced` adds the exploded, wireframe and brake-check toggles used on the unlisted /studio preview.
 *
 * GLBs are meshopt-compressed (see public/models/wheels/README.md), so the loader gets the decoder.
 */

export type StudioViewId = 'face' | 'three' | 'side' | 'back' | 'top';

export interface StudioToggles {
  orbit: boolean;
  spin: boolean;
  explode: boolean;
  wire: boolean;
  bolts: boolean;
  cap: boolean;
  brakes: boolean;
}

export const DEFAULT_STUDIO_TOGGLES: StudioToggles = {
  orbit: true,
  spin: false,
  explode: false,
  wire: false,
  bolts: true,
  cap: true,
  brakes: false,
};

export interface WheelStudioProps {
  wheelModel: string;
  /** Shown under the name on the advanced stage only. */
  wheelSeries?: string;
  selectedFinish: WheelFinishId;
  /**
   * The paint choices offered. A single entry shows no finish row, which is how the wheel pages
   * keep the stage to the finish that is actually in stock.
   */
  availableFinishes: WheelFinishId[];
  onSelectFinish: (finish: WheelFinishId) => void;
  /** The wheel's own finish name, e.g. "Black Matte"; a matte name gives the paint a matte sheen. */
  finishName?: string;
  /** Served path to the wheel's .glb, e.g. "/models/wheels/stf399-front.glb". */
  modelUrl: string;
  /** Optional second model for the rear axle of a staggered set. */
  rearModelUrl?: string | null;
  /** One-line spec shown in the badge on the advanced stage, e.g. "19 × 9.5 · ET 17 · 5×112". */
  specFront?: string;
  specRear?: string;
  initialView?: StudioViewId;
  initialToggles?: Partial<StudioToggles>;
  /** Shows a visible "Close 3D" button (and closes on Escape) when given. */
  onClose?: () => void;
  /** Adds the exploded, wireframe, brake and other toggles. */
  advanced?: boolean;
  /** Tailwind sizing for the stage. */
  className?: string;
}

interface LoadedModelInfo {
  diameterMm: number;
  widthMm: number;
  hasBrakes: boolean;
}

interface StudioEngine {
  load: (url: string) => void;
  setFinish: (finishId: WheelFinishId, finishName?: string) => void;
  setToggles: (toggles: StudioToggles) => void;
  goView: (view: StudioViewId, instant?: boolean) => void;
  /** Height in CSS pixels of the control panel covering the bottom of the stage. */
  setBottomInset: (px: number) => void;
  dispose: () => void;
}

interface EngineCallbacks {
  onLoaded: (info: LoadedModelInfo) => void;
  onError: (message: string) => void;
  onUserDrag: () => void;
}

const VIEWS: { id: StudioViewId; label: string }[] = [
  { id: 'face', label: 'Face' },
  { id: 'three', label: '3/4' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
  { id: 'top', label: 'Top' },
];

const TOGGLE_LABELS: { id: keyof StudioToggles; label: string }[] = [
  { id: 'orbit', label: 'Orbit' },
  { id: 'spin', label: 'Spin wheel' },
  { id: 'explode', label: 'Exploded' },
  { id: 'wire', label: 'Wireframe' },
  { id: 'bolts', label: 'Bolts' },
  { id: 'cap', label: 'Cap' },
  { id: 'brakes', label: 'Brake check' },
];

/** Studio reflections: a gradient dome with bright softboxes and dark flags, prefiltered once. */
function buildStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const envScene = new THREE.Scene();
  const dome = new THREE.SphereGeometry(50, 48, 24);
  const top = new THREE.Color(0.78, 0.82, 0.9);
  const horizon = new THREE.Color(0.3, 0.32, 0.35);
  const bottom = new THREE.Color(0.13, 0.13, 0.15);
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
      side: THREE.DoubleSide,
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

function createStudioEngine(
  mount: HTMLDivElement,
  callbacks: EngineCallbacks,
  options: { ariaLabel: string }
): StudioEngine {
  const reduceMotion = prefersReducedMotion();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = 'block';
  // Dragging the picture must not scroll the page. This is safe because the engine only exists
  // after the visitor has tapped "View in 3D"; the Close 3D button leaves it again.
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', options.ariaLabel);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const envTexture = buildStudioEnvironment(renderer);
  scene.environment = envTexture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.02, 20);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !reduceMotion;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.35;
  controls.maxDistance = 4;
  controls.maxPolarAngle = Math.PI * 0.62;
  controls.enablePan = false;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 1.2;

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
  keyLight.position.set(1.2, 2.2, 1.0);
  keyLight.castShadow = true;
  const shadowSize = window.innerWidth < 768 ? 1024 : 2048; // lighter on phones
  keyLight.shadow.mapSize.set(shadowSize, shadowSize);
  keyLight.shadow.camera.left = -0.9;
  keyLight.shadow.camera.right = 0.9;
  keyLight.shadow.camera.top = 0.9;
  keyLight.shadow.camera.bottom = -0.9;
  keyLight.shadow.camera.near = 0.2;
  keyLight.shadow.camera.far = 6;
  keyLight.shadow.bias = -0.0004;
  keyLight.shadow.radius = 6;
  scene.add(keyLight);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f98, 0.9));

  const floorGeo = new THREE.PlaneGeometry(12, 12);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.28 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Paint materials: barrel is separate from face so the brake check can ghost it alone.
  const barrelMat = new THREE.MeshPhysicalMaterial();
  const faceMat = new THREE.MeshPhysicalMaterial();
  const applyFinishTo = (
    mat: THREE.MeshPhysicalMaterial,
    finishId: WheelFinishId,
    finishName?: string
  ) => {
    const f = getStudioFinish(finishId);
    const matte = isMatteFinishName(finishName);
    mat.color.set(f.hex);
    mat.metalness = matte ? Math.min(f.metalness, 0.2) : f.metalness;
    mat.roughness = matte ? Math.max(f.roughness, 0.6) : f.roughness;
    mat.clearcoat = matte ? Math.min(f.clearcoat, 0.05) : f.clearcoat;
    mat.clearcoatRoughness = matte ? 0.6 : f.clearcoatRoughness;
    mat.envMapIntensity = f.envMapIntensity;
    mat.needsUpdate = true;
  };

  interface Rig {
    spinGroup: THREE.Group;
    staticGroup: THREE.Group;
    parts: Record<StudioPart, THREE.Mesh[]>;
    homes: Map<THREE.Mesh, THREE.Vector3>;
    ownMaterials: THREE.Material[];
    axis: THREE.Vector3;
    centre: THREE.Vector3;
    diameter: number;
  }

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const modelCache = new Map<string, THREE.Group>();
  let rig: Rig | null = null;
  let loadToken = 0;
  let currentFinish: WheelFinishId = 'silver';
  let currentFinishName: string | undefined;
  let toggles: StudioToggles = { ...DEFAULT_STUDIO_TOGGLES };
  let currentView: StudioViewId = 'three';
  let explodeNow = 0;
  let tween: {
    start: number;
    duration: number;
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toPos: THREE.Vector3;
    toTarget: THREE.Vector3;
  } | null = null;
  let disposed = false;
  let stageWidth = 1;
  let stageHeight = 1;
  let bottomInset = 0;

  // Shift the picture up by half the covered height so the wheel sits in the visible area.
  const applyViewOffset = () => {
    const inset = Math.min(bottomInset, stageHeight * 0.6);
    if (inset > 0) camera.setViewOffset(stageWidth, stageHeight, 0, inset / 2, stageWidth, stageHeight);
    else camera.clearViewOffset();
  };

  const emptyParts = (): Record<StudioPart, THREE.Mesh[]> => ({
    barrel: [],
    face: [],
    bolts: [],
    cap: [],
    rotor: [],
    caliper: [],
  });

  const removeRig = () => {
    if (!rig) return;
    scene.remove(rig.spinGroup);
    scene.remove(rig.staticGroup);
    rig = null;
  };

  const applyExplode = () => {
    if (!rig) return;
    const offsets = explodeOffsets(rig.diameter);
    (Object.keys(rig.parts) as StudioPart[]).forEach((part) => {
      for (const mesh of rig!.parts[part]) {
        const home = rig!.homes.get(mesh);
        if (home) mesh.position.copy(home).addScaledVector(rig!.axis, offsets[part] * explodeNow);
      }
    });
  };

  const applyToggles = () => {
    if (!rig) return;
    rig.parts.bolts.forEach((m) => (m.visible = toggles.bolts));
    rig.parts.cap.forEach((m) => (m.visible = toggles.cap));
    BRAKE_PARTS.forEach((part) => rig!.parts[part].forEach((m) => (m.visible = toggles.brakes)));
    // Brake check: ghost the barrel so the caliper is visible against the spokes.
    barrelMat.transparent = toggles.brakes;
    barrelMat.opacity = toggles.brakes ? 0.22 : 1;
    barrelMat.depthWrite = !toggles.brakes;
    barrelMat.needsUpdate = true;
    barrelMat.wireframe = toggles.wire;
    faceMat.wireframe = toggles.wire;
    rig.ownMaterials.forEach((m) => {
      if ('wireframe' in m) (m as THREE.MeshStandardMaterial).wireframe = toggles.wire;
    });
    controls.autoRotate = toggles.orbit && !reduceMotion;
  };

  const viewPose = (view: StudioViewId) => {
    const r = rig!;
    const visibleFraction = 1 - Math.min(bottomInset, stageHeight * 0.6) / stageHeight;
    const d = r.diameter * 2.75 * cameraDistanceScale(camera.aspect, visibleFraction);
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(up, r.axis).normalize();
    if (side.lengthSq() < 0.5) side.set(1, 0, 0);
    const c = r.centre;
    const poses: Record<StudioViewId, THREE.Vector3> = {
      face: c.clone().addScaledVector(r.axis, d),
      back: c.clone().addScaledVector(r.axis, -d),
      side: c.clone().addScaledVector(side, d * 1.05).add(new THREE.Vector3(0, 0.02, 0)),
      three: c
        .clone()
        .addScaledVector(r.axis, d * 0.78)
        .addScaledVector(side, d * 0.62)
        .add(new THREE.Vector3(0, d * 0.1, 0)),
      top: c.clone().add(new THREE.Vector3(0, d * 1.05, 0)).addScaledVector(r.axis, d * 0.15),
    };
    return { pos: poses[view], target: c.clone().add(new THREE.Vector3(0, -0.01, 0)) };
  };

  const goView = (view: StudioViewId, instant = false) => {
    currentView = view;
    if (!rig) return;
    const pose = viewPose(view);
    if (instant || reduceMotion) {
      tween = null;
      camera.position.copy(pose.pos);
      controls.target.copy(pose.target);
      controls.update();
      return;
    }
    tween = {
      start: performance.now(),
      duration: 650,
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPos: pose.pos,
      toTarget: pose.target,
    };
  };

  const buildRig = (source: THREE.Group) => {
    const root = source.clone(true);
    scene.add(root);
    root.updateMatrixWorld(true);

    const parts = emptyParts();
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) parts[classifyStudioPart(mesh.name || mesh.parent?.name || '')].push(mesh);
    });

    // Rest the rim on the floor, then measure it.
    const rimMeshes = parts.barrel.length ? parts.barrel : [...parts.face, ...parts.cap];
    const rimBox = new THREE.Box3();
    rimMeshes.forEach((m) => rimBox.expandByObject(m));
    if (rimBox.isEmpty()) rimBox.setFromObject(root);
    root.position.y -= rimBox.min.y;
    root.updateMatrixWorld(true);
    rimBox.makeEmpty();
    rimMeshes.forEach((m) => rimBox.expandByObject(m));
    if (rimBox.isEmpty()) rimBox.setFromObject(root);
    const centre = rimBox.getCenter(new THREE.Vector3());
    const size = rimBox.getSize(new THREE.Vector3());

    // The axle is the direction in which the rim is shortest; point it at the outboard side.
    const axisIndex = size.x < size.y && size.x < size.z ? 0 : size.y < size.z ? 1 : 2;
    const axis = new THREE.Vector3();
    axis.setComponent(axisIndex, 1);
    const outboard = parts.cap.length ? parts.cap : parts.face;
    if (outboard.length) {
      const outboardCentre = new THREE.Box3();
      outboard.forEach((m) => outboardCentre.expandByObject(m));
      if (outboardCentre.getCenter(new THREE.Vector3()).sub(centre).dot(axis) < 0) axis.negate();
    }

    const spinGroup = new THREE.Group();
    const staticGroup = new THREE.Group();
    spinGroup.position.copy(centre);
    staticGroup.position.copy(centre);
    scene.add(spinGroup, staticGroup);

    const homes = new Map<THREE.Mesh, THREE.Vector3>();
    const ownMaterials: THREE.Material[] = [];
    (Object.keys(parts) as StudioPart[]).forEach((part) => {
      for (const mesh of parts[part]) {
        // The caliper is bolted to the car, so it must not turn with the wheel.
        (part === 'caliper' ? staticGroup : spinGroup).attach(mesh);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        homes.set(mesh, mesh.position.clone());
        if (FINISH_PARTS.includes(part)) {
          mesh.material = part === 'barrel' ? barrelMat : faceMat;
        } else {
          const own = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          own.forEach((m) => {
            if ('envMapIntensity' in m) (m as THREE.MeshStandardMaterial).envMapIntensity = 1;
            ownMaterials.push(m);
          });
        }
      }
    });
    scene.remove(root);

    removeRig();
    const diameter = Math.max(size.x, size.y, size.z);
    rig = { spinGroup, staticGroup, parts, homes, ownMaterials, axis, centre, diameter };
    applyFinishTo(barrelMat, currentFinish, currentFinishName);
    applyFinishTo(faceMat, currentFinish, currentFinishName);
    applyToggles();
    explodeNow = toggles.explode ? 1 : 0;
    applyExplode();
    goView(currentView, true);
    callbacks.onLoaded({
      diameterMm: Math.round(diameter * 1000),
      widthMm: Math.round(size.getComponent(axisIndex) * 1000),
      hasBrakes: parts.rotor.length + parts.caliper.length > 0,
    });
  };

  const load = (url: string) => {
    const token = ++loadToken;
    const cached = modelCache.get(url);
    const showModel = (model: THREE.Group) => {
      try {
        buildRig(model);
      } catch (err) {
        console.error('WheelStudio: could not prepare model', url, err);
        callbacks.onError('This 3D model could not be displayed.');
      }
    };
    if (cached) {
      showModel(cached);
      return;
    }
    loader.load(
      url,
      (gltf) => {
        if (disposed || token !== loadToken) return; // a newer request superseded this one
        modelCache.set(url, gltf.scene);
        showModel(gltf.scene);
      },
      undefined,
      (err) => {
        if (disposed || token !== loadToken) return;
        console.error('WheelStudio: could not load model', url, err);
        callbacks.onError('The 3D model could not be loaded. Check your connection and try again.');
      }
    );
  };

  const resize = () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    stageWidth = w;
    stageHeight = h;
    camera.aspect = w / h;
    applyViewOffset();
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  resize();

  // Only draw while the stage is on screen and the tab is visible.
  let onScreen = true;
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
    },
    { threshold: 0.01 }
  );
  visibilityObserver.observe(mount);

  const onPointerDown = () => {
    tween = null;
    callbacks.onUserDrag();
  };
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  let last = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!onScreen || document.hidden) return;
    if (tween) {
      const k = Math.min(1, (now - tween.start) / tween.duration);
      const eased = k * k * (3 - 2 * k);
      camera.position.lerpVectors(tween.fromPos, tween.toPos, eased);
      controls.target.lerpVectors(tween.fromTarget, tween.toTarget, eased);
      if (k >= 1) tween = null;
    }
    const explodeTarget = toggles.explode ? 1 : 0;
    if (Math.abs(explodeTarget - explodeNow) > 0.001) {
      explodeNow = reduceMotion
        ? explodeTarget
        : explodeNow + (explodeTarget - explodeNow) * Math.min(1, dt * 6);
      applyExplode();
    }
    if (rig && toggles.spin) rig.spinGroup.rotateOnWorldAxis(rig.axis, -dt * 1.6);
    controls.update();
    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);

  return {
    load,
    goView,
    setFinish: (finishId, finishName) => {
      currentFinish = finishId;
      currentFinishName = finishName;
      applyFinishTo(barrelMat, finishId, finishName);
      applyFinishTo(faceMat, finishId, finishName);
    },
    setToggles: (next) => {
      toggles = { ...next };
      applyToggles();
    },
    setBottomInset: (px) => {
      const next = Math.max(0, Math.round(px));
      if (next === bottomInset) return;
      const firstMeasure = bottomInset === 0;
      bottomInset = next;
      applyViewOffset();
      camera.updateProjectionMatrix();
      // Re-frame once the panel has been measured; later changes only shift the picture.
      if (firstMeasure && rig && !tween) goView(currentView, true);
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      controls.dispose();
      removeRig();
      modelCache.forEach((model) => {
        model.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m?.dispose());
        });
      });
      modelCache.clear();
      barrelMat.dispose();
      faceMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      envTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    },
  };
}

const chipBase =
  'shrink-0 whitespace-nowrap rounded-full border px-4 min-h-[44px] text-sm leading-none transition-colors cursor-pointer';
const chipOff = 'border-black/10 bg-white/70 text-[#14161a] hover:bg-white';
const chipOn = 'border-[#14161a] bg-[#14161a] text-white';

export const WheelStudio: React.FC<WheelStudioProps> = ({
  wheelModel,
  wheelSeries,
  selectedFinish,
  availableFinishes,
  onSelectFinish,
  finishName,
  modelUrl,
  rearModelUrl,
  specFront,
  specRear,
  initialView = 'three',
  initialToggles,
  onClose,
  advanced = false,
  className = 'h-[76vh] min-h-[540px] max-h-[860px]',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<StudioEngine | null>(null);

  const [axle, setAxle] = useState<'front' | 'rear'>('front');
  const [view, setView] = useState<StudioViewId>(initialView);
  const [toggles, setToggles] = useState<StudioToggles>(() => ({
    ...DEFAULT_STUDIO_TOGGLES,
    orbit: !prefersReducedMotion(),
    ...initialToggles,
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<LoadedModelInfo | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const activeUrl = axle === 'rear' && rearModelUrl ? rearModelUrl : modelUrl;

  // Create the engine once.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let engine: StudioEngine;
    try {
      engine = createStudioEngine(
        mount,
        {
          onLoaded: (loaded) => {
            setInfo(loaded);
            setLoading(false);
            setError(null);
          },
          onError: (message) => {
            setError(message);
            setLoading(false);
          },
          onUserDrag: () => {
            setHintVisible(false);
            setToggles((t) => (t.orbit ? { ...t, orbit: false } : t));
          },
        },
        { ariaLabel: `Interactive 3D view of ${wheelModel}. Drag to rotate, pinch to zoom.` }
      );
    } catch (err) {
      console.error('WheelStudio: WebGL is not available', err);
      setError('3D view is not available on this device.');
      setLoading(false);
      return;
    }
    engineRef.current = engine;
    engine.goView(initialView, true);

    // Tell the engine how much of the stage the control panel covers.
    const panel = panelRef.current;
    const measurePanel = () => {
      if (panel) engine.setBottomInset(panel.offsetHeight + 8);
    };
    const panelObserver = new ResizeObserver(measurePanel);
    if (panel) panelObserver.observe(panel);
    measurePanel();

    return () => {
      panelObserver.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
    // initialView and the label are read once on mount by design
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load (or switch) the model.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setLoading(true);
    setError(null);
    engine.load(activeUrl);
  }, [activeUrl, retryCount]);

  useEffect(() => {
    engineRef.current?.setFinish(selectedFinish, finishName);
  }, [selectedFinish, finishName]);

  useEffect(() => {
    engineRef.current?.setToggles(toggles);
  }, [toggles]);

  const chooseView = (next: StudioViewId) => {
    setView(next);
    setToggles((t) => ({ ...t, orbit: false }));
    engineRef.current?.goView(next);
  };

  const flipToggle = (id: keyof StudioToggles) => setToggles((t) => ({ ...t, [id]: !t[id] }));

  const specLine = axle === 'rear' ? specRear : specFront;
  const visibleToggles = TOGGLE_LABELS.filter((t) => t.id !== 'brakes' || info?.hasBrakes);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-[#26262E] select-none text-[#14161a] ${className}`}
      style={{
        background: 'radial-gradient(120% 90% at 50% 35%, #f6f7f9 0%, #e3e6eb 60%, #cfd3da 100%)',
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && onClose) onClose();
      }}
    >
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Name, spec badge (advanced only) and the always-visible Close 3D button */}
      <div className="absolute top-0 inset-x-0 z-40 flex items-start justify-between gap-3 p-3 pointer-events-none">
        <div className="min-w-0 pt-2 pl-1">
          <div className="text-sm font-semibold tracking-wide truncate">{wheelModel}</div>
          {advanced && wheelSeries && (
            <div className="text-xs text-neutral-500 mt-0.5 truncate">{wheelSeries}</div>
          )}
        </div>
        <div className="flex items-start gap-2 shrink-0">
          {advanced && (specLine || info) && (
            <div className="rounded-xl border border-black/10 bg-white/85 backdrop-blur px-2.5 py-2 text-right text-[11px] leading-relaxed text-neutral-500">
              {specLine && (
                <div>
                  {rearModelUrl && (
                    <b className="font-semibold text-[#14161a]">{axle === 'rear' ? 'Rear ' : 'Front '}</b>
                  )}
                  {specLine}
                </div>
              )}
              {info && (
                <div>
                  Model: ⌀{info.diameterMm} × {info.widthMm} mm
                </div>
              )}
            </div>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              autoFocus
              className="pointer-events-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[#14161a] px-4 text-sm font-semibold text-white shadow-md cursor-pointer hover:bg-black"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Close 3D
            </button>
          )}
        </div>
      </div>

      {hintVisible && !loading && !error && (
        <div className="absolute inset-x-0 top-16 z-10 text-center text-xs text-neutral-500 pointer-events-none">
          Drag to rotate · pinch to zoom
        </div>
      )}

      {/* Controls */}
      <div
        ref={panelRef}
        role="group"
        aria-label="3D view controls"
        className="absolute inset-x-2 bottom-2 z-20 mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden"
      >
        <div className="px-2.5 py-2 space-y-1.5 max-h-[42vh] overflow-y-auto">
          {rearModelUrl && (
            <ControlRow label="Wheel" showLabel={advanced}>
              {(['front', 'rear'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={axle === a}
                  onClick={() => setAxle(a)}
                  className={`${chipBase} ${axle === a ? chipOn : chipOff}`}
                >
                  {a === 'front' ? 'Front' : 'Rear'}
                </button>
              ))}
            </ControlRow>
          )}

          <ControlRow label="View" showLabel={advanced}>
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={view === v.id}
                onClick={() => chooseView(v.id)}
                className={`${chipBase} ${view === v.id ? chipOn : chipOff}`}
              >
                {v.label}
              </button>
            ))}
          </ControlRow>

          {availableFinishes.length > 1 && (
            <ControlRow label="Finish" showLabel={advanced}>
              {availableFinishes.map((id) => {
                const finish = WHEEL_FINISHES[id];
                if (!finish) return null;
                const active = selectedFinish === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    aria-label={`Select ${finish.name} finish`}
                    onClick={() => onSelectFinish(id)}
                    className={`${chipBase} ${active ? chipOn : chipOff}`}
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-[-1px] border border-black/25"
                      style={{ background: finish.swatchHex }}
                    />
                    {finish.name}
                  </button>
                );
              })}
            </ControlRow>
          )}

          {advanced && (
            <ControlRow label="Show" showLabel>
              {visibleToggles.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={toggles[t.id]}
                  onClick={() => flipToggle(t.id)}
                  className={`${chipBase} ${toggles[t.id] ? chipOn : chipOff}`}
                >
                  <span
                    className={`inline-block w-[7px] h-[7px] rounded-full mr-1.5 ${
                      toggles[t.id] ? 'bg-emerald-400' : 'bg-neutral-400'
                    }`}
                  />
                  {t.label}
                </button>
              ))}
            </ControlRow>
          )}
        </div>
      </div>

      {loading && !error && (
        <div
          role="status"
          className="absolute inset-0 z-30 flex items-center justify-center bg-[#f0f2f5]/90"
        >
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-neutral-600">
            <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none text-[#FF5500]" />
            Loading wheel…
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="absolute inset-0 z-30 flex items-center justify-center bg-[#f0f2f5]/95 px-6"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="w-6 h-6 text-[#FF5500]" />
            <p className="text-sm text-neutral-700 max-w-xs">{error}</p>
            {engineRef.current && (
              <button
                type="button"
                onClick={() => setRetryCount((n) => n + 1)}
                className="rounded-full border border-black/15 bg-white px-5 min-h-[44px] text-sm cursor-pointer hover:bg-neutral-50"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ControlRow: React.FC<{ label: string; showLabel: boolean; children: React.ReactNode }> = ({
  label,
  showLabel,
  children,
}) => (
  <div className="flex items-center gap-2">
    {showLabel && (
      <div className="w-12 sm:w-14 shrink-0 text-[11px] uppercase tracking-wider text-neutral-500">
        {label}
      </div>
    )}
    <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  </div>
);
