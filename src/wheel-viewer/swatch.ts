import * as THREE from 'three';
import { buildStudioEnvironment } from './studioEnvironment';
import { defaultPaintRenderer, type PaintRenderer, type StudioFinish } from './paint';

/**
 * Photoreal finish swatches.
 *
 * A swatch is the finish itself, photographed: a sphere dressed in the same paint material the wheel
 * gets (same `PaintRenderer`, same studio reflections, same tone mapping and key light as the stage),
 * rendered once to a small picture. So a swatch shows the reflections, depth and gloss or matte of the
 * paint on the wheel, and can never disagree with it. Pictures are cached by paint, and every swatch
 * asked for in the same moment is drawn by one short-lived WebGL context.
 */

export interface SwatchRequest {
  finish: StudioFinish;
  /** Edge in CSS pixels. The picture is drawn at up to twice this for sharpness on dense screens. */
  size: number;
  paint?: PaintRenderer;
}

/** The paint renderer's cache. WeakMap: a renderer nobody holds any more frees its pictures. */
const caches = new WeakMap<PaintRenderer, Map<string, string>>();

/** Set when a context could not be made; swatches then fall back to the drawn gradient, without retrying. */
let unavailable = false;

/** Everything about a finish that changes how it looks. The id and the dot colour do not. */
export function swatchKey(finish: StudioFinish, size: number): string {
  return JSON.stringify([finish.name, finish.paint, size]);
}

function cacheFor(paint: PaintRenderer): Map<string, string> {
  let cache = caches.get(paint);
  if (!cache) {
    cache = new Map();
    caches.set(paint, cache);
  }
  return cache;
}

/** The finished picture (a data URL) if this swatch was drawn before; otherwise null. */
export function cachedSwatch(finish: StudioFinish, size: number, paint: PaintRenderer = defaultPaintRenderer): string | null {
  return cacheFor(paint).get(swatchKey(finish, size)) ?? null;
}

/**
 * The drawn stand-in shown until the photographed swatch is ready, and kept when WebGL is not there:
 * a lit ball in the dot colour, with a highlight and a darker underside.
 */
export function fallbackSwatchBackground(hex: string): string {
  return `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.75) 0, rgba(255,255,255,0) 34%), radial-gradient(circle at 50% 50%, ${hex} 55%, rgba(0,0,0,0.55) 100%), ${hex}`;
}

interface Pending extends Required<SwatchRequest> {
  resolve: (url: string | null) => void;
}

let pending: Pending[] = [];
let scheduled = false;

/**
 * The swatch for a finish, as a picture URL (null when it cannot be drawn on this device). Calls made in
 * the same moment are drawn together.
 */
export function swatchFor(request: SwatchRequest): Promise<string | null> {
  const paint = request.paint ?? defaultPaintRenderer;
  const hit = cachedSwatch(request.finish, request.size, paint);
  if (hit) return Promise.resolve(hit);
  if (unavailable || typeof document === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    pending.push({ finish: request.finish, size: request.size, paint, resolve });
    if (!scheduled) {
      scheduled = true;
      setTimeout(flush, 0);
    }
  });
}

function flush() {
  scheduled = false;
  const batch = pending;
  pending = [];
  if (!batch.length) return;
  try {
    const urls = drawSwatches(batch);
    batch.forEach((item, i) => item.resolve(urls[i]));
  } catch (err) {
    unavailable = true;
    console.warn('Finish swatches: WebGL is not available, using drawn swatches', err);
    batch.forEach((item) => item.resolve(null));
  }
}

/** One context, one sphere, one picture per request. */
function drawSwatches(batch: Pending[]): string[] {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // The same tone mapping and exposure as the stage, so the swatch matches the wheel.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);

  let env: THREE.Texture | null = null;
  let geometry: THREE.SphereGeometry | null = null;
  const urls: string[] = [];
  try {
    const scene = new THREE.Scene();
    env = buildStudioEnvironment(renderer);
    scene.environment = env;
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(1.2, 2.2, 1.0);
    scene.add(keyLight);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f98, 1.4));

    geometry = new THREE.SphereGeometry(1, 96, 64);
    // A little above and to the side, so the overhead softbox and a side strip both land on the ball.
    const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 20);
    camera.position.set(0.55, 0.9, 4.6);
    camera.lookAt(0, 0, 0);

    for (const { finish, size, paint } of batch) {
      const key = swatchKey(finish, size);
      const cache = cacheFor(paint);
      const done = cache.get(key);
      if (done) {
        urls.push(done);
        continue;
      }
      renderer.setSize(Math.round(size * pixelRatio), Math.round(size * pixelRatio), false);
      const material = paint.create(THREE.FrontSide, 1, finish);
      const ball = new THREE.Mesh(geometry, material);
      scene.add(ball);
      try {
        renderer.render(scene, camera);
        const url = renderer.domElement.toDataURL('image/png');
        cache.set(key, url);
        urls.push(url);
      } finally {
        scene.remove(ball);
        material.dispose();
      }
    }
  } finally {
    geometry?.dispose();
    env?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
  return urls;
}
