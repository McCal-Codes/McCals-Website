import { useCallback, useEffect, useRef, useState } from 'react';
import type * as THREE_NS from 'three';
import { HERO_FRAGMENT_SHADER, HERO_VERTEX_SHADER } from './heroShaders';
import { computeFrame, type HeroFocalPoint } from './heroFraming';
import styles from './heroShaderTransition.module.css';

interface HeroShaderTransitionProps {
  /** The exact URL the underlying <img> is showing, so the texture is a cache hit. */
  src: string;
  /**
   * The slide after this one. Uploaded to the GPU while the browser is idle so
   * that advancing does not sit on the previous photograph waiting for a decode.
   */
  preloadSrc?: string;
  focal: HeroFocalPoint;
  durationMs?: number;
  /** Raised once the canvas has a frame on screen, and again if it gives up. */
  onReadyChange?: (ready: boolean) => void;
}

interface HeroEngine {
  THREE: typeof THREE_NS;
  renderer: THREE_NS.WebGLRenderer;
  material: THREE_NS.ShaderMaterial;
  loader: THREE_NS.TextureLoader;
  render: () => void;
}

const DEFAULT_DURATION_MS = 900;
// Both are deliberately restrained: this sits over a photographer's own
// grading, so the layer should be felt rather than seen.
const GRAIN_STRENGTH = 0.028;
const VIGNETTE_STRENGTH = 0.2;
const MAX_PIXEL_RATIO = 2;

/**
 * How many decoded hero photographs to keep on the GPU. A 1920x1280 texture is
 * roughly 10MB uncompressed, so caching every slide in a long carousel would be
 * a real memory cost for images that may not be seen again. Four covers the
 * outgoing frame, the current one, the preloaded next one, and one spare.
 */
const MAX_CACHED_TEXTURES = 4;

/** Cubic ease-in-out. Slow ends, quick middle. */
function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * A WebGL layer that dissolves between hero photographs and lays grain and a
 * vignette over them.
 *
 * It is strictly additive. The <img> beneath it keeps rendering the current
 * slide, stays the LCP element, and remains the only thing search engines and
 * screen readers see; this canvas is aria-hidden and fades in only once it has
 * drawn a frame. Any failure — no context, a texture that will not load, a lost
 * context — unmounts the canvas and leaves the original carousel intact.
 */
export default function HeroShaderTransition({
  src,
  preloadSrc,
  focal,
  durationMs = DEFAULT_DURATION_MS,
  onReadyChange,
}: HeroShaderTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const texturesRef = useRef(new Map<string, THREE_NS.Texture>());
  const frameRef = useRef<number | null>(null);

  // The renderer and its scene graph are mutated constantly by the render loop,
  // so they live in a ref rather than state; `engineReady` is the render-safe
  // signal that the effects below can start using it.
  const engineRef = useRef<HeroEngine | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const focalRef = useRef(focal);
  const onReadyChangeRef = useRef(onReadyChange);

  useEffect(() => {
    focalRef.current = focal;
  }, [focal]);

  useEffect(() => {
    onReadyChangeRef.current = onReadyChange;
  }, [onReadyChange]);

  useEffect(() => {
    onReadyChangeRef.current?.(ready && !failed);
  }, [ready, failed]);

  /**
   * Returns a GPU texture for `url`, decoding it if it is not already cached.
   * Resolves to null when the image cannot be sampled — almost always a
   * cross-origin file served without CORS headers.
   *
   * The cache is a plain Map used as an LRU: Map preserves insertion order, so
   * re-inserting on a hit moves an entry to the back and the oldest entries sit
   * at the front. Textures currently bound to the material are never evicted.
   */
  const acquireTexture = useCallback(
    async (url: string): Promise<THREE_NS.Texture | null> => {
      const engine = engineRef.current;
      if (!engine) return null;

      const cache = texturesRef.current;

      const cached = cache.get(url);
      if (cached) {
        cache.delete(url);
        cache.set(url, cached);
        return cached;
      }

      let texture: THREE_NS.Texture;
      try {
        texture = await engine.loader.loadAsync(url);
      } catch {
        return null;
      }

      // NoColorSpace, deliberately. Marking the texture sRGB makes WebGL2
      // upload it as SRGB8_ALPHA8 and decode to linear in hardware on sample,
      // but a raw ShaderMaterial gets none of three's output-encoding chunks,
      // so nothing converts back and every photograph renders about a gamma
      // too dark. Keeping the texture untagged means the shader works in the
      // same sRGB space the <img> underneath is displayed in, and the canvas
      // matches it pixel for pixel.
      texture.colorSpace = engine.THREE.NoColorSpace;
      texture.minFilter = engine.THREE.LinearFilter;
      texture.magFilter = engine.THREE.LinearFilter;
      texture.generateMipmaps = false;
      cache.set(url, texture);

      const { uFrom, uTo } = engine.material.uniforms;
      const inUse = new Set([uFrom.value, uTo.value]);

      for (const [key, value] of cache) {
        if (cache.size <= MAX_CACHED_TEXTURES) break;
        if (inUse.has(value) || value === texture) continue;
        value.dispose();
        cache.delete(key);
      }

      return texture;
    },
    [],
  );

  // ── Scene setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let disposeEngine: (() => void) | null = null;

    const handleContextLost = (event: Event) => {
      // A lost context cannot be recovered mid-animation without a visible
      // artefact, so hand the hero back to the plain <img> instead.
      event.preventDefault();
      setFailed(true);
    };

    // three is ~150KB gzipped, so it is imported here rather than at module
    // scope: this effect runs after the hero <img> has already painted, which
    // keeps the library out of the homepage's initial bundle and off the LCP
    // critical path entirely.
    import('three')
      .then((THREE) => {
        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: false,
          alpha: false,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
        // Pass the shader's output through untouched. Textures are uploaded
        // untagged (see acquireTexture), so the whole pipeline stays in sRGB
        // and the canvas matches the <img> it covers exactly.
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

        // A program that fails to compile still renders — as black — which
        // would blank the photograph the canvas is sitting on. Treat it as a
        // hard failure so the layer unmounts and the <img> shows through.
        renderer.debug.onShaderError = () => setFailed(true);

        const scene = new THREE.Scene();
        const camera = new THREE.Camera();

        const material = new THREE.ShaderMaterial({
          vertexShader: HERO_VERTEX_SHADER,
          fragmentShader: HERO_FRAGMENT_SHADER,
          depthTest: false,
          depthWrite: false,
          uniforms: {
            uFrom: { value: null },
            uTo: { value: null },
            uFromFrame: { value: new THREE.Vector4(1, 1, 0, 0) },
            uToFrame: { value: new THREE.Vector4(1, 1, 0, 0) },
            uProgress: { value: 1 },
            uTime: { value: 0 },
            uGrain: { value: GRAIN_STRENGTH },
            uVignette: { value: VIGNETTE_STRENGTH },
            uResolution: { value: new THREE.Vector2(1, 1) },
          },
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        scene.add(mesh);

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');

        canvas.addEventListener('webglcontextlost', handleContextLost);

        disposeEngine = () => {
          canvas.removeEventListener('webglcontextlost', handleContextLost);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
        };

        engineRef.current = {
          THREE,
          renderer,
          material,
          loader,
          render: () => renderer.render(scene, camera),
        };
        setEngineReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    const textures = texturesRef.current;

    return () => {
      cancelled = true;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      disposeEngine?.();
      engineRef.current = null;
      for (const texture of textures.values()) texture.dispose();
      textures.clear();
    };
  }, []);

  // ── Sizing ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      if (!clientWidth || !clientHeight) return;

      engine.renderer.setSize(clientWidth, clientHeight, false);
      engine.material.uniforms.uResolution.value.set(clientWidth, clientHeight);

      // Reframe both textures: a resize changes the cover crop.
      for (const [textureKey, frameKey] of [
        ['uFrom', 'uFromFrame'],
        ['uTo', 'uToFrame'],
      ] as const) {
        const texture = engine.material.uniforms[textureKey].value as THREE_NS.Texture | null;
        const image = texture?.image as { width: number; height: number } | undefined;
        if (!image) continue;

        engine.material.uniforms[frameKey].value.fromArray(
          computeFrame(image.width, image.height, clientWidth, clientHeight, focalRef.current),
        );
      }

      engine.render();
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [engineReady]);

  // ── Slide changes ─────────────────────────────────────────────────────────
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || failed || !src) return;

    let cancelled = false;

    const run = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const texture = await acquireTexture(src);
      if (cancelled) return;

      if (!texture) {
        // Almost always a cross-origin image served without CORS headers,
        // which WebGL cannot sample. The <img> below is unaffected.
        setFailed(true);
        return;
      }

      const { uniforms } = engine.material;
      const image = texture.image as { width: number; height: number };
      const frame = computeFrame(
        image.width,
        image.height,
        canvas.clientWidth,
        canvas.clientHeight,
        focalRef.current,
      );

      const previous = uniforms.uTo.value as THREE_NS.Texture | null;
      const isFirstFrame = previous === null;

      uniforms.uFrom.value = previous ?? texture;
      uniforms.uFromFrame.value.copy(uniforms.uToFrame.value);
      uniforms.uTo.value = texture;
      uniforms.uToFrame.value.fromArray(frame);

      // The very first texture appears without a dissolve — there is nothing to
      // dissolve from, and animating here would fight the <img> fade-in.
      if (isFirstFrame) {
        uniforms.uFromFrame.value.fromArray(frame);
        uniforms.uProgress.value = 1;
        engine.render();
        if (!cancelled) setReady(true);
        return;
      }

      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

      const start = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;

        const linear = Math.min((now - start) / durationMs, 1);
        uniforms.uProgress.value = ease(linear);
        uniforms.uTime.value = now / 1000;
        engine.render();

        if (linear < 1) {
          frameRef.current = requestAnimationFrame(tick);
          return;
        }

        // Grain is deliberately left static between slides: re-randomising it
        // every frame would hold the GPU awake through eight seconds of a still
        // photograph to animate noise almost nobody would consciously notice.
        frameRef.current = null;
      };

      uniforms.uProgress.value = 0;
      frameRef.current = requestAnimationFrame(tick);
    };

    run().catch(() => setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [src, engineReady, durationMs, failed, acquireTexture]);

  // ── Next-slide prewarm ────────────────────────────────────────────────────
  // Without this the canvas holds the previous photograph while the incoming
  // one decodes, so the caption and dots change before the image does. Decode
  // during idle time instead, after the current slide has settled.
  useEffect(() => {
    if (!engineReady || failed || !preloadSrc || preloadSrc === src) return;
    if (texturesRef.current.has(preloadSrc)) return;

    let cancelled = false;

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const warm = () => {
      if (cancelled) return;
      // A prewarm failure is not fatal: the slide effect will retry this URL
      // when it actually becomes current, and decide about failing then.
      acquireTexture(preloadSrc).catch(() => {});
    };

    let idleId: number | undefined;
    let timeoutId: number | undefined;

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(warm, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(warm, 1200);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [engineReady, preloadSrc, src, failed, acquireTexture]);

  // Land an in-flight dissolve on its final frame when the tab is hidden, so
  // returning to it never shows a transition frozen half-way.
  useEffect(() => {
    const handleVisibility = () => {
      const engine = engineRef.current;
      if (!engine) return;
      if (document.visibilityState !== 'hidden' || frameRef.current === null) return;

      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      engine.material.uniforms.uProgress.value = 1;
      engine.render();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  if (failed) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas} ${ready ? styles.ready : ''}`}
      aria-hidden="true"
    />
  );
}
