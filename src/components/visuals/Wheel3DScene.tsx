import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Disc3,
  Layers,
  Maximize2,
  Minimize2,
  Upload,
  BookOpen,
  Gauge,
  ArrowLeftRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  WHEEL_FINISHES,
  WheelFinishId,
  SpokeGeometryType,
} from '../../data/kahnData';
import { Rim3DPrepGuideModal } from './Rim3DPrepGuideModal';

// Detect software WebGL from GPU renderer string per threejs skill guidelines
const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return true;
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

// Pre-allocated module-scope math helpers (Zero GC in render loop)
const _targetCameraPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _dummyMatrix = new THREE.Matrix4();
const _dummyPos = new THREE.Vector3();
const _dummyQuat = new THREE.Quaternion();
const _dummyScale = new THREE.Vector3(1, 1, 1);
const _dummyEuler = new THREE.Euler();

export type CameraPresetId = 'orbit-360' | 'front-face' | 'concave-34' | 'inner-barrel' | 'hub-hardware';

const CAMERA_PRESETS: Record<
  CameraPresetId,
  { label: string; pos: [number, number, number]; target: [number, number, number] }
> = {
  'orbit-360': {
    label: '360° Studio',
    pos: [1.95, 1.15, 2.45],
    target: [0, 0.76, 0],
  },
  'front-face': {
    label: 'Face Elevation',
    pos: [0.0, 0.76, 2.85],
    target: [0, 0.76, 0],
  },
  'concave-34': {
    label: '3/4 Concave',
    pos: [2.15, 0.98, 1.7],
    target: [0, 0.76, 0],
  },
  'inner-barrel': {
    label: 'Inner Barrel',
    pos: [-1.95, 1.05, -2.15],
    target: [0, 0.76, 0],
  },
  'hub-hardware': {
    label: 'Hub & Hardware',
    pos: [0.35, 0.88, 1.25],
    target: [0, 0.76, 0.12],
  },
};

// Procedural Canvas Textures (Zero external 404 assets)
function createCenterCapTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Brushed dark carbon metallic base
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
  grad.addColorStop(0, '#1e1e24');
  grad.addColorStop(0.75, '#0d0d11');
  grad.addColorStop(1, '#2a2a34');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Outer precision ring
  ctx.strokeStyle = '#ff5500';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(256, 256, 224, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 256, 198, 0, Math.PI * 2);
  ctx.stroke();

  // Center 'F' Monogram
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 148px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('F', 256, 242);

  ctx.fillStyle = '#ff5500';
  ctx.font = '600 28px sans-serif';
  ctx.fillText('FORGED', 256, 355);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createRotorBumpTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  // Concentric wear grooves
  for (let r = 90; r < 245; r += 3) {
    ctx.strokeStyle = r % 6 === 0 ? '#969696' : '#6e6e6e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Cross-drilled ventilation holes & curved slots
  ctx.fillStyle = '#121212';
  const numArms = 24;
  for (let i = 0; i < numArms; i++) {
    const baseAngle = (i / numArms) * Math.PI * 2;
    for (let step = 0; step < 4; step++) {
      const radius = 125 + step * 28;
      const angle = baseAngle + step * 0.065;
      const x = 256 + Math.cos(angle) * radius;
      const y = 256 + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(x, y, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0, 'rgba(0,0,0,0.85)');
  grad.addColorStop(0.45, 'rgba(0,0,0,0.42)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(canvas);
}

// Build spoke geometry based on SpokeGeometryType
function buildSpokeGroup(
  spokeStyle: SpokeGeometryType,
  primaryMat: THREE.Material,
  accentMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  const outerRadius = 0.72;
  const innerRadius = 0.19;

  if (spokeStyle === 'y-spoke-forged' || spokeStyle === 'split-five-rs' || spokeStyle === 'ten-spoke-ring') {
    const pairCount = spokeStyle === 'split-five-rs' ? 5 : 10;
    const forkSpread = spokeStyle === 'split-five-rs' ? 0.26 : 0.14;
    const strutThickness = spokeStyle === 'split-five-rs' ? 0.038 : 0.026;

    // Build a Y-spoke shape extruded with bevels
    const shape = new THREE.Shape();
    shape.moveTo(-strutThickness * 0.85, innerRadius);
    shape.lineTo(strutThickness * 0.85, innerRadius);
    shape.lineTo(strutThickness * 0.7, 0.38);
    shape.lineTo(forkSpread, outerRadius);
    shape.lineTo(forkSpread - strutThickness * 1.05, outerRadius);
    shape.lineTo(0, 0.43);
    shape.lineTo(-(forkSpread - strutThickness * 1.05), outerRadius);
    shape.lineTo(-forkSpread, outerRadius);
    shape.lineTo(-strutThickness * 0.7, 0.38);
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.042,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.006,
      bevelSegments: 2,
    });
    geom.center();

    for (let i = 0; i < pairCount; i++) {
      const angle = (i / pairCount) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.z = angle;

      const mesh = new THREE.Mesh(geom, primaryMat);
      mesh.position.set(0, (outerRadius + innerRadius) * 0.5, 0.06);
      mesh.rotation.x = -0.14; // Concave angle into center bowl
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      holder.add(mesh);

      // Milled chamfer pocket accent along the stem
      const pocketGeom = new THREE.BoxGeometry(strutThickness * 0.45, 0.22, 0.052);
      const pocketMesh = new THREE.Mesh(pocketGeom, accentMat);
      pocketMesh.position.set(0, 0.34, 0.068);
      pocketMesh.rotation.x = -0.14;
      holder.add(pocketMesh);

      group.add(holder);
    }
  } else if (spokeStyle === 'aero-disc-f1' || spokeStyle === 'directional-turbine') {
    // 10 directional turbine blades + machined Venturi outer aero ring
    const bladeCount = 10;
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(-0.022, innerRadius);
    bladeShape.lineTo(0.028, innerRadius);
    bladeShape.lineTo(0.065, outerRadius);
    bladeShape.lineTo(-0.015, outerRadius);
    bladeShape.closePath();

    const bladeGeom = new THREE.ExtrudeGeometry(bladeShape, {
      depth: 0.045,
      bevelEnabled: true,
      bevelThickness: 0.007,
      bevelSize: 0.005,
      bevelSegments: 2,
    });

    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.z = angle;

      const blade = new THREE.Mesh(bladeGeom, primaryMat);
      blade.position.set(0, 0, 0.035);
      blade.rotation.y = 0.22; // Directional turbine twist
      blade.rotation.x = -0.11;
      blade.castShadow = true;
      holder.add(blade);
      group.add(holder);
    }

    // Outer Aero Venturi Ring
    const aeroRingGeom = new THREE.RingGeometry(0.55, 0.72, 48, 1);
    const aeroRingMesh = new THREE.Mesh(aeroRingGeom, accentMat);
    aeroRingMesh.position.z = 0.095;
    group.add(aeroRingMesh);
  } else if (spokeStyle === 'multi-spoke-gt') {
    // 16 cross-laced classic motorsport mesh spokes
    const meshCount = 16;
    const strutGeom = new THREE.BoxGeometry(0.022, outerRadius - innerRadius, 0.038);
    for (let i = 0; i < meshCount; i++) {
      const angle = (i / meshCount) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.z = angle;

      const strutA = new THREE.Mesh(strutGeom, primaryMat);
      strutA.position.set(0.04, (outerRadius + innerRadius) * 0.48, 0.045);
      strutA.rotation.z = 0.24;
      strutA.rotation.x = -0.12;
      strutA.castShadow = true;

      const strutB = new THREE.Mesh(strutGeom, i % 2 === 0 ? primaryMat : accentMat);
      strutB.position.set(-0.04, (outerRadius + innerRadius) * 0.48, 0.038);
      strutB.rotation.z = -0.24;
      strutB.rotation.x = -0.12;
      strutB.castShadow = true;

      holder.add(strutA, strutB);
      group.add(holder);
    }
  } else if (spokeStyle === 'dish-beadlock' || spokeStyle === 'classic-horseshoe') {
    // 5 wide sculpted monoblock dish paddles + central aero disc
    const paddleCount = 5;
    const paddleShape = new THREE.Shape();
    paddleShape.moveTo(-0.055, innerRadius);
    paddleShape.lineTo(0.055, innerRadius);
    paddleShape.lineTo(0.135, outerRadius);
    paddleShape.lineTo(-0.135, outerRadius);
    paddleShape.closePath();

    const paddleGeom = new THREE.ExtrudeGeometry(paddleShape, {
      depth: 0.048,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.008,
      bevelSegments: 3,
    });

    for (let i = 0; i < paddleCount; i++) {
      const angle = (i / paddleCount) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.z = angle;
      const mesh = new THREE.Mesh(paddleGeom, primaryMat);
      mesh.position.z = 0.04;
      mesh.rotation.x = -0.09;
      mesh.castShadow = true;
      holder.add(mesh);
      group.add(holder);
    }
  } else {
    // 10 directional split blades
    const count = 10;
    const bladeGeom = new THREE.BoxGeometry(0.032, outerRadius - innerRadius, 0.044);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.z = angle;

      const mesh = new THREE.Mesh(bladeGeom, i % 2 === 0 ? primaryMat : accentMat);
      mesh.position.set(0.025, (outerRadius + innerRadius) * 0.5, 0.055);
      mesh.rotation.z = i % 2 === 0 ? 0.14 : -0.14;
      mesh.rotation.x = -0.15;
      mesh.castShadow = true;
      holder.add(mesh);
      group.add(holder);
    }
  }

  return group;
}

export interface Wheel3DSceneProps {
  wheelModel: string;
  wheelSeries: string;
  spokeStyle: SpokeGeometryType;
  selectedFinish: WheelFinishId;
  availableFinishes: WheelFinishId[];
  onSelectFinish: (finish: WheelFinishId) => void;
  onEnquire?: () => void;
  userVehicleLabel?: string | null;
  /** Served path to this wheel's photoreal .glb (e.g. "/models/wheels/fsa002-gold.glb"). Absent = procedural rim. */
  modelUrl?: string | null;
}

export const Wheel3DScene: React.FC<Wheel3DSceneProps> = ({
  wheelModel,
  wheelSeries,
  spokeStyle,
  selectedFinish,
  availableFinishes,
  onSelectFinish,
  onEnquire,
  userVehicleLabel,
  modelUrl,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Interactive HUD state
  const [activePreset, setActivePreset] = useState<CameraPresetId>('orbit-360');
  const [explodedRatio, setExplodedRatio] = useState<number>(0);
  const [showBrakes, setShowBrakes] = useState<boolean>(false);
  const [spinVelocity, setSpinVelocity] = useState<number>(0); // -3.0 (Reverse) to +3.0 (Forward)
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);
  const [customModelInfo, setCustomModelInfo] = useState<{
    fileName: string;
    triangles: number;
    meshes: number;
    source: 'official' | 'test';
  } | null>(null);
  const [isLoadingCustom, setIsLoadingCustom] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mutable refs for animation loop without tearing down canvas
  const stateRef = useRef({
    explodedTarget: 0,
    explodedCurrent: 0,
    showBrakes: false,
    spinVelocity: 0,
    presetTransitionActive: false,
    presetCamPos: new THREE.Vector3(...CAMERA_PRESETS['orbit-360'].pos),
    presetLookAt: new THREE.Vector3(...CAMERA_PRESETS['orbit-360'].target),
    requestRender: () => {},
    updateFinishColors: (_finish: WheelFinishId) => {},
    rebuildSpokes: (_style: SpokeGeometryType) => {},
    loadCustomGLB: (_url: string, _fileName: string, _source: 'official' | 'test') => {},
    loadOfficialModel: (_url: string | null) => {},
    restoreBaseModel: () => {},
    restoreDefaultRim: () => {},
  });

  // Sync React props/state into stateRef & request render
  useEffect(() => {
    stateRef.current.explodedTarget = explodedRatio;
    stateRef.current.showBrakes = showBrakes;
    stateRef.current.spinVelocity = isSoftwareGl ? 0 : spinVelocity;
    stateRef.current.requestRender();
  }, [explodedRatio, showBrakes, spinVelocity]);

  const currentFinishRef = useRef<WheelFinishId>(selectedFinish);
  useEffect(() => {
    currentFinishRef.current = selectedFinish;
    stateRef.current.updateFinishColors(selectedFinish);
    stateRef.current.requestRender();
  }, [selectedFinish]);

  useEffect(() => {
    stateRef.current.rebuildSpokes(spokeStyle);
    stateRef.current.requestRender();
  }, [spokeStyle]);

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    stateRef.current.loadCustomGLB(objectUrl, file.name, 'test');
    e.target.value = '';
  };

  // Keyboard shortcut 'H' for collapsing/expanding the bottom HUD dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'h') {
        setHudCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSelectCameraPreset = (presetId: CameraPresetId) => {
    setActivePreset(presetId);
    const p = CAMERA_PRESETS[presetId];
    stateRef.current.presetCamPos.set(p.pos[0], p.pos[1], p.pos[2]);
    stateRef.current.presetLookAt.set(p.target[0], p.target[1], p.target[2]);
    stateRef.current.presetTransitionActive = true;
    stateRef.current.requestRender();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Initialize Three.js WebGL scene once
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const width = mountEl.clientWidth || 960;
    const height = mountEl.clientHeight || 620;

    // 1. Renderer setup with software WebGL guard & ACES Filmic tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    // 2. Scene & Studio Environment Map (RoomEnvironment + PMREMGenerator)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.065);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3. Camera & Damped OrbitControls (360° rotation)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(...CAMERA_PRESETS['orbit-360'].pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_PRESETS['orbit-360'].target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.065;
    controls.minDistance = 1.45;
    controls.maxDistance = 5.5;
    controls.maxPolarAngle = Math.PI * 0.88;
    controls.minPolarAngle = 0.12;
    controls.update();

    // Cancel camera preset transition if user starts manual orbit
    controls.addEventListener('start', () => {
      stateRef.current.presetTransitionActive = false;
    });

    // 4. Balanced 3-Point Studio Lighting Rig + RectAreaLight Softboxes
    const hemiLight = new THREE.HemisphereLight(0x9ec5ff, 0x16161d, 0.65);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff2e2, 2.4);
    keyLight.position.set(3.5, 4.8, 3.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    const d = 2.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff5500, 1.35);
    rimLight.position.set(-3.2, 2.4, -3.0);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xdbe8ff, 0.95);
    fillLight.position.set(-2.6, 1.5, 2.8);
    scene.add(fillLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxTop = new THREE.RectAreaLight(0xffffff, 3.2, 2.8, 1.2);
      softboxTop.position.set(0, 2.9, 1.0);
      softboxTop.lookAt(0, 0.76, 0);
      scene.add(softboxTop);
    }

    // 5. Studio Floor & Grounded Contact Shadow (Rim bottom grounded at y = 0)
    const floorGeom = new THREE.CircleGeometry(9, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d11,
      roughness: 0.78,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.1),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.7,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.006; // Offset >= 0.005 to avoid coplanar Z-fighting
    scene.add(shadowPlane);

    // Subtle technical calibration ring on studio floor sized for bare rim
    const studioRingGeom = new THREE.RingGeometry(0.86, 0.88, 64);
    const studioRingMat = new THREE.MeshBasicMaterial({
      color: 0x26262e,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const studioRing = new THREE.Mesh(studioRingGeom, studioRingMat);
    studioRing.rotation.x = -Math.PI / 2;
    studioRing.position.y = 0.008;
    scene.add(studioRing);

    // 6. Materials Library (Varied roughness & metalness across adjacent parts)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const initialFinish = WHEEL_FINISHES[selectedFinish] || WHEEL_FINISHES.silver;

    const primaryAlloyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialFinish.swatchHex),
      metalness: 0.94,
      roughness: 0.18,
      anisotropy: 0.75,
      clearcoat: 0.35,
      clearcoatRoughness: 0.15,
    });

    const secondaryBarrelMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialFinish.secondaryHex),
      metalness: 0.9,
      roughness: 0.44, // >= 0.25 roughness contrast vs primaryAlloyMat
      anisotropy: 0.5,
    });

    const rimLipAccentMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialFinish.rimAccentHex),
      metalness: 0.97,
      roughness: 0.12,
      clearcoat: 0.6,
    });

    const titaniumHardwareMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4dc,
      metalness: 0.95,
      roughness: 0.22,
    });

    const caliperOrangeMat = new THREE.MeshPhysicalMaterial({
      color: 0xff5500,
      metalness: 0.35,
      roughness: 0.24,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
    });

    const rotorTex = createRotorBumpTexture(maxAniso);
    const carbonRotorMat = new THREE.MeshStandardMaterial({
      color: 0x3b3b42,
      metalness: 0.68,
      roughness: 0.48,
      bumpMap: rotorTex,
      bumpScale: 0.015,
      roughnessMap: rotorTex,
    });

    const centerCapTex = createCenterCapTexture(maxAniso);
    const centerCapMat = new THREE.MeshStandardMaterial({
      map: centerCapTex,
      roughness: 0.28,
      metalness: 0.65,
    });

    // 7. Composite Procedural Forged Rim Assembly (Grounded at y = 0, rim center at y = 0.76)
    const wheelRoot = new THREE.Group();
    wheelRoot.position.set(0, 0.76, 0);
    scene.add(wheelRoot);

    const spinGroup = new THREE.Group();
    wheelRoot.add(spinGroup);

    // Default procedural forged rim assembly
    const defaultRimAssembly = new THREE.Group();
    spinGroup.add(defaultRimAssembly);

    // Sub-groups for smooth Exploded View separation along Z axis
    const barrelAndRimGroup = new THREE.Group();
    const spokesContainerGroup = new THREE.Group();
    const hubAndHardwareGroup = new THREE.Group();
    const centerCapGroup = new THREE.Group();
    const brakeAssemblyGroup = new THREE.Group();
    brakeAssemblyGroup.visible = false; // Hidden by default, display only the rim

    defaultRimAssembly.add(
      barrelAndRimGroup,
      spokesContainerGroup,
      hubAndHardwareGroup,
      centerCapGroup
    );
    // Brake assembly stays in wheelRoot and can be toggled for clearance checking
    wheelRoot.add(brakeAssemblyGroup);

    let customRimHolder: THREE.Group | null = null;
    let activeCustomUrl: string | null = null;
    // Official per-wheel model (from props). Test uploads sit on top of it; "Restore" returns here.
    let officialModelUrl: string | null = null;
    // Monotonic token so a slow load that finishes after a newer request is discarded.
    let loadToken = 0;
    // Materials on named rim meshes of a loaded model that follow the finish swatches.
    let customFinishMats: THREE.MeshStandardMaterial[] = [];
    const FINISH_MESH_PATTERN = /^(rim_face|rim_barrel|rim_lip|rim_spokes)/i;
    const releaseUrl = (url: string | null) => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    };

    // Part 1: Stepped Forged Alloy Barrel (LatheGeometry)
    const barrelProfile = [
      new THREE.Vector2(0.75, 0.26),
      new THREE.Vector2(0.76, 0.23),
      new THREE.Vector2(0.72, 0.2),
      new THREE.Vector2(0.69, 0.08),
      new THREE.Vector2(0.67, -0.18),
      new THREE.Vector2(0.72, -0.24),
      new THREE.Vector2(0.75, -0.26),
      new THREE.Vector2(0.71, -0.26),
      new THREE.Vector2(0.65, -0.18),
      new THREE.Vector2(0.67, 0.08),
      new THREE.Vector2(0.7, 0.2),
      new THREE.Vector2(0.73, 0.26),
    ];
    const barrelGeom = new THREE.LatheGeometry(barrelProfile, 64);
    barrelGeom.rotateX(Math.PI / 2);
    const barrelMesh = new THREE.Mesh(barrelGeom, secondaryBarrelMat);
    barrelMesh.castShadow = true;
    barrelMesh.receiveShadow = true;
    barrelAndRimGroup.add(barrelMesh);

    // Part 2: Outer Stepped Rim Lip Flange & Rear Flange Accent
    const frontLipGeom = new THREE.TorusGeometry(0.735, 0.022, 24, 64);
    const frontLipMesh = new THREE.Mesh(frontLipGeom, rimLipAccentMat);
    frontLipMesh.position.z = 0.235;
    barrelAndRimGroup.add(frontLipMesh);

    const rearLipGeom = new THREE.TorusGeometry(0.735, 0.02, 24, 64);
    const rearLipMesh = new THREE.Mesh(rearLipGeom, secondaryBarrelMat);
    rearLipMesh.position.z = -0.25;
    barrelAndRimGroup.add(rearLipMesh);

    const valveStemGeom = new THREE.CylinderGeometry(0.009, 0.011, 0.048, 12);
    const valveStemMesh = new THREE.Mesh(valveStemGeom, titaniumHardwareMat);
    valveStemMesh.position.set(0, -0.66, 0.19);
    const valveCapMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.016, 12),
      caliperOrangeMat
    );
    valveCapMesh.position.set(0, -0.635, 0.19);
    barrelAndRimGroup.add(valveStemMesh, valveCapMesh);

    // Part 3: Sculpted Forged Spokes (ExtrudeGeometry per spokeStyle)
    let activeSpokesMeshGroup = buildSpokeGroup(
      spokeStyle,
      primaryAlloyMat,
      rimLipAccentMat
    );
    activeSpokesMeshGroup.position.z = 0.12;
    spokesContainerGroup.add(activeSpokesMeshGroup);

    // Part 4: Deep Concave Center Hub Bowl
    const hubBowlPoints = [
      new THREE.Vector2(0.08, 0.11),
      new THREE.Vector2(0.11, 0.11),
      new THREE.Vector2(0.19, 0.15),
      new THREE.Vector2(0.21, 0.18),
      new THREE.Vector2(0.21, 0.06),
      new THREE.Vector2(0.08, 0.06),
    ];
    const hubBowlGeom = new THREE.LatheGeometry(hubBowlPoints, 48);
    hubBowlGeom.rotateX(Math.PI / 2);
    const hubBowlMesh = new THREE.Mesh(hubBowlGeom, secondaryBarrelMat);
    hubAndHardwareGroup.add(hubBowlMesh);

    // Part 5: 5x112 Titanium Lug Bolts + 30 Perimeter 2-Piece Rim Bolts (InstancedMesh > 20 items)
    const boltGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.028, 6);
    boltGeom.rotateX(Math.PI / 2);
    const totalBolts = 35; // 5 center lug bolts + 30 outer flange bolts
    const boltsInstanced = new THREE.InstancedMesh(
      boltGeom,
      titaniumHardwareMat,
      totalBolts
    );

    // 5 center 5x112 PCD lug bolts
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      _dummyPos.set(Math.cos(a) * 0.135, Math.sin(a) * 0.135, 0.135);
      _dummyEuler.set(0, 0, a);
      _dummyQuat.setFromEuler(_dummyEuler);
      _dummyScale.set(1.45, 1.45, 1.45);
      _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
      boltsInstanced.setMatrixAt(i, _dummyMatrix);
    }

    // 30 outer perimeter beadlock/register bolts
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2;
      _dummyPos.set(Math.cos(a) * 0.695, Math.sin(a) * 0.695, 0.21);
      _dummyEuler.set(0, 0, a);
      _dummyQuat.setFromEuler(_dummyEuler);
      _dummyScale.set(0.65, 0.65, 0.65);
      _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
      boltsInstanced.setMatrixAt(5 + i, _dummyMatrix);
    }
    boltsInstanced.instanceMatrix.needsUpdate = true;
    boltsInstanced.computeBoundingSphere();
    hubAndHardwareGroup.add(boltsInstanced);

    // Part 6: Center Lock Billet Cap with FORGED Crest
    const capDiskGeom = new THREE.CylinderGeometry(0.088, 0.092, 0.026, 36);
    capDiskGeom.rotateX(Math.PI / 2);
    const capDiskMesh = new THREE.Mesh(capDiskGeom, centerCapMat);
    capDiskMesh.position.z = 0.145;

    const capBezelGeom = new THREE.TorusGeometry(0.09, 0.007, 16, 36);
    const capBezelMesh = new THREE.Mesh(capBezelGeom, rimLipAccentMat);
    capBezelMesh.position.z = 0.155;
    centerCapGroup.add(capDiskMesh, capBezelMesh);

    // Part 7: Cross-Drilled Carbon-Ceramic Brake Rotor & Bell Hat
    const rotorDiscGeom = new THREE.CylinderGeometry(0.54, 0.54, 0.046, 48);
    rotorDiscGeom.rotateX(Math.PI / 2);
    const rotorDiscMesh = new THREE.Mesh(rotorDiscGeom, carbonRotorMat);
    rotorDiscMesh.position.z = -0.02;

    const rotorBellGeom = new THREE.CylinderGeometry(0.22, 0.24, 0.08, 36);
    rotorBellGeom.rotateX(Math.PI / 2);
    const rotorBellMesh = new THREE.Mesh(rotorBellGeom, secondaryBarrelMat);
    rotorBellMesh.position.z = 0.01;
    brakeAssemblyGroup.add(rotorDiscMesh, rotorBellMesh);

    // Part 8: 6-Piston Forged Monoblock Brake Caliper (ExtrudeGeometry with bevels)
    const caliperShape = new THREE.Shape();
    caliperShape.absarc(0, 0, 0.585, -0.48, 0.48, false);
    caliperShape.absarc(0, 0, 0.36, 0.44, -0.44, true);
    caliperShape.closePath();

    const caliperGeom = new THREE.ExtrudeGeometry(caliperShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.016,
      bevelSize: 0.014,
      bevelSegments: 3,
    });
    const caliperMesh = new THREE.Mesh(caliperGeom, caliperOrangeMat);
    caliperMesh.position.set(0, 0, -0.09);
    caliperMesh.rotation.z = 0.18;
    caliperMesh.castShadow = true;
    brakeAssemblyGroup.add(caliperMesh);

    // Pre-compile shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Expose finish & spoke update handlers
    stateRef.current.updateFinishColors = (finishId: WheelFinishId) => {
      const f = WHEEL_FINISHES[finishId] || WHEEL_FINISHES.silver;
      primaryAlloyMat.color.set(f.swatchHex);
      secondaryBarrelMat.color.set(f.secondaryHex);
      rimLipAccentMat.color.set(f.rimAccentHex);
      if (finishId === 'dark-gunmetal') {
        primaryAlloyMat.roughness = 0.24;
        primaryAlloyMat.metalness = 0.88;
      } else if (finishId === 'satin-black') {
        primaryAlloyMat.roughness = 0.36;
        primaryAlloyMat.metalness = 0.78;
      } else {
        primaryAlloyMat.roughness = 0.18;
        primaryAlloyMat.metalness = 0.94;
      }
      for (const mat of customFinishMats) {
        mat.color.set(f.swatchHex);
        mat.metalness = primaryAlloyMat.metalness;
        mat.roughness = primaryAlloyMat.roughness;
        mat.needsUpdate = true;
      }
    };

    stateRef.current.rebuildSpokes = (newStyle: SpokeGeometryType) => {
      spokesContainerGroup.remove(activeSpokesMeshGroup);
      activeSpokesMeshGroup = buildSpokeGroup(
        newStyle,
        primaryAlloyMat,
        rimLipAccentMat
      );
      activeSpokesMeshGroup.position.z = 0.12;
      spokesContainerGroup.add(activeSpokesMeshGroup);
    };

    stateRef.current.loadCustomGLB = (
      url: string,
      fileName: string,
      source: 'official' | 'test'
    ) => {
      const token = ++loadToken;
      setIsLoadingCustom(true);
      setLoadError(null);

      releaseUrl(activeCustomUrl);
      activeCustomUrl = url;

      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          if (token !== loadToken) {
            // A newer load or a restore superseded this one while it was in flight.
            releaseUrl(url);
            return;
          }
          let triangles = 0;
          let meshCount = 0;
          const finishMats: THREE.MeshStandardMaterial[] = [];

          gltf.scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              const m = obj as THREE.Mesh;
              meshCount++;
              m.castShadow = true;
              m.receiveShadow = true;
              const followsFinish = FINISH_MESH_PATTERN.test(m.name || '');
              if (m.material) {
                const mats = Array.isArray(m.material) ? m.material : [m.material];
                const next = mats.map((mat) => {
                  if ('envMapIntensity' in mat) {
                    (mat as THREE.MeshStandardMaterial).envMapIntensity = 1.35;
                  }
                  if (followsFinish && (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                    // Clone so re-tinting a named rim mesh never bleeds into bolts/caps sharing the material.
                    const own = (mat as THREE.MeshStandardMaterial).clone();
                    finishMats.push(own);
                    return own;
                  }
                  return mat;
                });
                m.material = Array.isArray(m.material) ? next : next[0];
              }
              if (m.geometry) {
                if (m.geometry.index) {
                  triangles += m.geometry.index.count / 3;
                } else if (m.geometry.attributes.position) {
                  triangles += m.geometry.attributes.position.count / 3;
                }
              }
            }
          });

          // Bounding box auto-normalization
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Center model at local origin (0, 0, 0)
          gltf.scene.position.x = -center.x;
          gltf.scene.position.y = -center.y;
          gltf.scene.position.z = -center.z;

          // Target diameter in studio is ~1.48m
          const maxDim = Math.max(size.x, size.y);
          if (maxDim > 0.001) {
            const scaleFactor = 1.48 / maxDim;
            gltf.scene.scale.setScalar(scaleFactor);
          }

          if (customRimHolder) {
            spinGroup.remove(customRimHolder);
            customRimHolder = null;
          }

          customRimHolder = new THREE.Group();
          customRimHolder.add(gltf.scene);
          defaultRimAssembly.visible = false;
          spinGroup.add(customRimHolder);

          customFinishMats = finishMats;
          stateRef.current.updateFinishColors(currentFinishRef.current);

          setCustomModelInfo({
            fileName,
            triangles: Math.round(triangles),
            meshes: meshCount,
            source,
          });
          setIsLoadingCustom(false);
          requestRender();
        },
        undefined,
        (err) => {
          if (token !== loadToken) return;
          console.error('Error loading GLB rim:', err);
          releaseUrl(url);
          if (activeCustomUrl === url) activeCustomUrl = null;
          setIsLoadingCustom(false);
          setLoadError(
            source === 'official'
              ? 'Official 3D model could not be loaded. Showing the studio reference rim.'
              : 'Failed to parse 3D file. Ensure it is a valid glTF / .glb binary model.'
          );
          requestRender();
        }
      );
    };

    stateRef.current.restoreDefaultRim = () => {
      loadToken++; // cancel any in-flight load
      releaseUrl(activeCustomUrl);
      activeCustomUrl = null;
      if (customRimHolder) {
        spinGroup.remove(customRimHolder);
        customRimHolder = null;
      }
      customFinishMats = [];
      defaultRimAssembly.visible = true;
      setCustomModelInfo(null);
      setLoadError(null);
      setIsLoadingCustom(false);
      requestRender();
    };

    // Load (or clear) the wheel's official model from props.
    stateRef.current.loadOfficialModel = (url: string | null) => {
      officialModelUrl = url;
      if (url) {
        const fileName = url.split('/').pop() || 'official-model.glb';
        stateRef.current.loadCustomGLB(url, fileName, 'official');
      } else {
        stateRef.current.restoreDefaultRim();
      }
    };

    // After a test upload, go back to the official model if there is one, else the procedural rim.
    stateRef.current.restoreBaseModel = () => {
      if (officialModelUrl) {
        stateRef.current.loadOfficialModel(officialModelUrl);
      } else {
        stateRef.current.restoreDefaultRim();
      }
    };

    // 8. On-Demand + Software-WebGL Paced Render Loop
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        renderDirty = false;
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        let needsMoreFrames = false;

        // Smooth exponential damping for Exploded View separation
        const diffExploded =
          stateRef.current.explodedTarget - stateRef.current.explodedCurrent;
        if (Math.abs(diffExploded) > 0.002) {
          stateRef.current.explodedCurrent = isSoftwareGl
            ? stateRef.current.explodedTarget
            : THREE.MathUtils.damp(
                stateRef.current.explodedCurrent,
                stateRef.current.explodedTarget,
                8,
                dt
              );
          needsMoreFrames = !isSoftwareGl;
        } else {
          stateRef.current.explodedCurrent = stateRef.current.explodedTarget;
        }

        const ex = stateRef.current.explodedCurrent;
        brakeAssemblyGroup.position.z = -ex * 0.55;
        brakeAssemblyGroup.visible = stateRef.current.showBrakes;
        barrelAndRimGroup.position.z = -ex * 0.22;
        spokesContainerGroup.position.z = ex * 0.16;
        hubAndHardwareGroup.position.z = ex * 0.38;
        centerCapGroup.position.z = ex * 0.62;

        // Smooth camera preset transition
        if (stateRef.current.presetTransitionActive) {
          _targetCameraPos.copy(stateRef.current.presetCamPos);
          _targetLookAt.copy(stateRef.current.presetLookAt);

          if (isSoftwareGl) {
            camera.position.copy(_targetCameraPos);
            controls.target.copy(_targetLookAt);
            stateRef.current.presetTransitionActive = false;
          } else {
            camera.position.x = THREE.MathUtils.damp(
              camera.position.x,
              _targetCameraPos.x,
              7,
              dt
            );
            camera.position.y = THREE.MathUtils.damp(
              camera.position.y,
              _targetCameraPos.y,
              7,
              dt
            );
            camera.position.z = THREE.MathUtils.damp(
              camera.position.z,
              _targetCameraPos.z,
              7,
              dt
            );
            controls.target.x = THREE.MathUtils.damp(
              controls.target.x,
              _targetLookAt.x,
              7,
              dt
            );
            controls.target.y = THREE.MathUtils.damp(
              controls.target.y,
              _targetLookAt.y,
              7,
              dt
            );
            controls.target.z = THREE.MathUtils.damp(
              controls.target.z,
              _targetLookAt.z,
              7,
              dt
            );

            if (
              camera.position.distanceToSquared(_targetCameraPos) < 0.0005 &&
              controls.target.distanceToSquared(_targetLookAt) < 0.0005
            ) {
              stateRef.current.presetTransitionActive = false;
            } else {
              needsMoreFrames = true;
            }
          }
        }

        // Variable rotational speed and bidirectional manual/automatic control around axle
        const vel = stateRef.current.spinVelocity;
        if (Math.abs(vel) > 0.001) {
          const deltaAngle = -vel * dt * 1.6;
          spinGroup.rotation.z += deltaAngle;
          rotorDiscMesh.rotation.y += deltaAngle;
          needsMoreFrames = true;
        }

        if (controls.update()) {
          if (!isSoftwareGl) needsMoreFrames = true;
        }

        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || needsMoreFrames) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    stateRef.current.requestRender = requestRender;
    controls.addEventListener('change', requestRender);

    const handleResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth || 960;
      const h = mountEl.clientHeight || 620;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };

    window.addEventListener('resize', handleResize);
    requestRender();

    return () => {
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', requestRender);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      loadToken++;
      releaseUrl(activeCustomUrl);
      controls.dispose();
      envTexture.dispose();
      rotorTex.dispose();
      centerCapTex.dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Load the official per-wheel model whenever it changes (runs after scene init on mount).
  useEffect(() => {
    stateRef.current.loadOfficialModel(modelUrl ?? null);
  }, [modelUrl]);

  const currentFinishObj =
    WHEEL_FINISHES[selectedFinish] || WHEEL_FINISHES.silver;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[76vh] min-h-[540px] max-h-[860px] bg-[#0A0A0A] border border-[#26262E] rounded-3xl overflow-hidden select-none"
    >
      {/* Dedicated WebGL Mount Container (100% Unobstructed Center) */}
      <div
        ref={canvasMountRef}
        aria-label={`Interactive 360 degree 3D scene for ${wheelModel}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Minimal Top-Left Specification Badge */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111115] border border-[#26262E] text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-300">
          <Disc3 className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>360° FORGED RIM STUDIO</span>
          <span className="text-neutral-600">·</span>
          <span className="text-white font-semibold">{wheelModel}</span>
          <span className="text-[10px] text-neutral-400 font-normal border-l border-[#26262E] pl-2">RIM ONLY</span>
        </div>

        {userVehicleLabel && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#141419] border border-[#FF5500]/40 text-[11px] font-mono text-[#FF5500]">
            <span>Matched to your Garage: {userVehicleLabel}</span>
          </div>
        )}
      </div>

      {/* Top-Right Action Controls: 3D CAD Guide, Test .GLB, Reset, Fullscreen */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          aria-label="Upload custom .GLB 3D rim file"
          className="hidden"
          onChange={handleCustomFileUpload}
        />

        <button
          type="button"
          onClick={() => setGuideModalOpen(true)}
          title="Photorealistic 3D CAD & Asset Prep Guidelines"
          className="h-9 px-3 rounded-lg bg-[#111115] border border-[#26262E] hover:border-[#FF5500]/60 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#FF5500]" />
          <span className="hidden sm:inline">3D Prep Guide</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Test your custom .GLB rim model"
          className="h-9 px-3 rounded-lg bg-[#111115] border border-[#26262E] hover:border-neutral-500 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Test .GLB Rim</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setExplodedRatio(0);
            setSpinVelocity(0);
            handleSelectCameraPreset('orbit-360');
          }}
          title="Reset 360° View"
          className="h-9 px-3 rounded-lg bg-[#111115] border border-[#26262E] hover:border-neutral-500 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen 3D Studio"
          className="w-9 h-9 rounded-lg bg-[#111115] border border-[#26262E] hover:border-neutral-500 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Custom Model Active Pill / Status Notification */}
      {customModelInfo && (
        <div className="absolute top-16 left-5 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0E1511] border border-emerald-500/40 text-[11px] font-mono text-emerald-300 shadow-xl">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {customModelInfo.source === 'official' ? 'OFFICIAL 3D MODEL' : 'TEST 3D RIM'}:{' '}
            <strong>{customModelInfo.fileName}</strong>
          </span>
          <span className="text-neutral-500">·</span>
          <span>{customModelInfo.triangles.toLocaleString()} tris</span>
          {customModelInfo.source === 'test' && (
          <button
            type="button"
            onClick={() => stateRef.current.restoreBaseModel()}
            className="ml-2 px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-neutral-500 text-[10px] cursor-pointer"
          >
            Restore
          </button>
          )}
        </div>
      )}

      {isLoadingCustom && (
        <div className="absolute top-16 left-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141419] border border-[#FF5500]/40 text-[11px] font-mono text-[#FF5500]">
          <div className="w-3 h-3 rounded-full border-2 border-transparent border-t-[#FF5500] animate-spin" />
          <span>Loading 3D rim model...</span>
        </div>
      )}

      {loadError && (
        <div className="absolute top-16 left-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-[11px] font-mono text-red-300">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => setLoadError(null)}
            className="text-red-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock (Solid surface, zero backdrop-filter over WebGL) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-[940px] flex flex-col items-center">
        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={() => setHudCollapsed((prev) => !prev)}
          className="mb-1.5 px-3.5 py-1 rounded-t-lg rounded-b-md bg-[#121216] border border-[#26262E] hover:border-neutral-600 text-[11px] font-mono uppercase tracking-wider text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {hudCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Show 3D Controls (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              <span>Hide Controls (H)</span>
            </>
          )}
        </button>

        {!hudCollapsed && (
          <div className="w-full bg-[#111115] border border-[#26262E] rounded-2xl p-3.5 sm:px-5 sm:py-3.5 shadow-2xl flex flex-col gap-3">
            {/* Top Row: Finish Swatches & Camera Presets */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-[#1E1E26] pb-3">
              {/* 1. Finish Variant Swatches */}
              <div className="flex items-center gap-3">
                <div className="text-left pr-1">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Finish
                  </span>
                  <span className="block text-xs font-medium text-white whitespace-nowrap">
                    {currentFinishObj.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {availableFinishes.map((fId) => {
                    const f = WHEEL_FINISHES[fId];
                    const active = selectedFinish === fId;
                    return (
                      <button
                        key={fId}
                        type="button"
                        onClick={() => onSelectFinish(fId)}
                        title={f.name}
                        aria-label={`Select ${f.name} 3D finish`}
                        className={`w-7 h-7 rounded-full p-0.5 border transition-transform cursor-pointer ${
                          active
                            ? 'border-[#FF5500] scale-110'
                            : 'border-[#2E2E38] hover:border-neutral-500'
                        }`}
                      >
                        <span
                          className="block w-full h-full rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${f.rimAccentHex}, ${f.swatchHex}, ${f.secondaryHex})`,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Camera Angle Presets */}
              <div className="flex flex-wrap items-center gap-1 bg-[#0A0A0D] p-1 rounded-xl border border-[#22222A]">
                {(Object.keys(CAMERA_PRESETS) as CameraPresetId[]).map((presetKey) => {
                  const preset = CAMERA_PRESETS[presetKey];
                  const isSelected = activePreset === presetKey;
                  return (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() => handleSelectCameraPreset(presetKey)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#22222A] text-white font-semibold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Row: Rotational Speed & Direction Interaction + Exploded View + Caliper */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Rotational Speed & Direction Slider Controller */}
              <div className="flex flex-wrap items-center gap-2.5 bg-[#0A0A0D] p-1.5 px-3 rounded-xl border border-[#22222A]">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Gauge className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span className="text-[10px] font-mono uppercase text-neutral-300 font-semibold">
                    Rim Rotation
                  </span>
                </div>

                {/* Direct Rotational Slider (-3.0 to +3.0) */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-neutral-500">◄ REV</span>
                  <input
                    id="rim-rotation-slider"
                    aria-label="Rim rotational speed and direction slider"
                    type="range"
                    min={-3}
                    max={3}
                    step={0.1}
                    value={spinVelocity}
                    onChange={(e) => setSpinVelocity(parseFloat(e.target.value))}
                    className="w-24 sm:w-36 h-1.5 bg-[#22222A] rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
                  />
                  <span className="text-[9px] font-mono text-neutral-500">FWD ►</span>
                </div>

                {/* Numerical & Directional Status Badge */}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    spinVelocity < -0.05
                      ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 font-bold'
                      : spinVelocity > 0.05
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                      : 'bg-[#181820] text-neutral-400 border border-[#26262E]'
                  }`}
                >
                  {spinVelocity < -0.05
                    ? `◄ REV ${Math.abs(spinVelocity).toFixed(1)}x`
                    : spinVelocity > 0.05
                    ? `► FWD ${spinVelocity.toFixed(1)}x`
                    : '0.0x STOP'}
                </span>

                {/* Quick directional action buttons */}
                <div className="flex items-center gap-1 pl-1 border-l border-[#22222A]">
                  <button
                    type="button"
                    onClick={() => setSpinVelocity(-1.0)}
                    title="Reverse spin (-1.0x)"
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      spinVelocity === -1.0
                        ? 'bg-[#FF5500] text-white font-bold'
                        : 'bg-[#141419] hover:bg-[#202028] text-neutral-400 hover:text-white'
                    }`}
                  >
                    ◄ Rev
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpinVelocity(0)}
                    title="Stop rotation (0.0x)"
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      spinVelocity === 0
                        ? 'bg-[#22222A] text-white font-bold'
                        : 'bg-[#141419] hover:bg-[#202028] text-neutral-400 hover:text-white'
                    }`}
                  >
                    ⏸ Stop
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpinVelocity(1.0)}
                    title="Forward spin (+1.0x)"
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      spinVelocity === 1.0
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-[#141419] hover:bg-[#202028] text-neutral-400 hover:text-white'
                    }`}
                  >
                    ► Fwd
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpinVelocity((v) => -v || 1.0)}
                    title="Invert rotation direction"
                    className="p-1 rounded bg-[#141419] hover:bg-[#202028] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Exploded View & Caliper Rig & Spec Request */}
              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <label
                    htmlFor="exploded-slider"
                    className="text-[11px] font-mono text-neutral-400 whitespace-nowrap"
                  >
                    Explode Rim
                  </label>
                  <input
                    id="exploded-slider"
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={explodedRatio}
                    onChange={(e) => setExplodedRatio(parseFloat(e.target.value))}
                    className="w-20 sm:w-24 accent-[#FF5500] cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowBrakes((prev) => !prev)}
                  title="Toggle brake caliper clearance rig"
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showBrakes
                      ? 'bg-[#18181F] border-[#FF5500]/50 text-[#FF5500]'
                      : 'bg-[#0A0A0D] border-[#22222A] text-neutral-400 hover:text-white'
                  }`}
                >
                  {showBrakes ? (
                    <Eye className="w-3 h-3 text-[#FF5500]" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                  <span>Caliper Rig</span>
                </button>

                {onEnquire && (
                  <button
                    type="button"
                    onClick={onEnquire}
                    className="px-3.5 py-1.5 rounded-lg bg-[#FF5500] hover:bg-[#FF6B1A] text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Request Spec
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photorealistic 3D Rim Specification & CAD Prep Modal */}
      <Rim3DPrepGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onSelectUploadFile={() => fileInputRef.current?.click()}
      />
    </div>
  );
};
