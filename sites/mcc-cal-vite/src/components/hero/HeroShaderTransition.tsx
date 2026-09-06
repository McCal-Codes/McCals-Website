import { useCallback, useEffect, useRef, useState } from 'react';
import type { Renderer, Program, Mesh, Texture, OGLRenderingContext } from 'ogl';
import { HERO_FRAGMENT_SHADER, HERO_VERTEX_SHADER } from './heroShaders';
import { computeFrame, type HeroFocalPoint } from './heroFraming';
import styles from './heroShaderTransition.module.css';

interface HeroShaderTransitionProps {
  /** The exact URL the underlying <img> is showing, so the texture is a cache hit. */
  src: string;
  focal: HeroFocalPoint;
  durationMs?: number;
  /** Raised once the canvas has a frame on screen, and again if it gives up. */
  onReadyChange?: (ready: boolean) => void;
}

interface HeroEngine {
  renderer: Renderer;
  program: Program;
  mesh: Mesh;
  gl: OGLRenderingContext;
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
 * Decodes an image for texture upload. `crossOrigin` is required even for
 * same-origin URLs here: without it a cross-origin response taints the canvas
 * and WebGL refuses to sample it.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`hero texture failed to load: ${url}`));
    image.src = url;
  });
}

/**
 * A WebGL layer that dissolves between hero photographs and lays grain and a
 * vignette over them.
 *
 * It is strictly additive. The <img> beneath it keeps rendering the current
 * slide, stays the LCP element, and remains the only thing search engines and
 * screen readers see; this canvas is aria-hidden and fades in only once it has
 * drawn a frame. Any failure, no context, a program that will not link, a
 * texture that cannot be sampled, a lost context, unmounts the canvas and
 * leaves the original carousel intact.
 *
 * Built on ogl rather than three: this draws one fullscreen triangle with a
 * hand-written shader, which is about 3% of three's API for 5% of its weight.
 */
export default function HeroShaderTransition({
  src,
  focal,
  durationMs = DEFAULT_DURATION_MS,
  onReadyChange,
}: HeroShaderTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const texturesRef = useRef(new Map<string, Texture>());
  const frameRef = useRef<number | null>(null);

  // The renderer and its program are mutated constantly by the render loop, so
  // they live in a ref rather than state; `engineReady` is the render-safe
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
   * Resolves to null when the image cannot be sampled, almost always a
   * cross-origin file served without CORS headers.
   *
   * The cache is a plain Map used as an LRU: Map preserves insertion order, so
   * re-inserting on a hit moves an entry to the back and the oldest entries sit
   * at the front. Textures currently bound to the program are never evicted.
   */
  const acquireTexture = useCallback(async (url: string): Promise<Texture | null> => {
    const engine = engineRef.current;
    if (!engine) return null;

    const cache = texturesRef.current;

    const cached = cache.get(url);
    if (cached) {
      cache.delete(url);
      cache.set(url, cached);
      return cached;
    }

    let image: HTMLImageElement;
    try {
      image = await loadImage(url);
    } catch {
      return null;
    }

    const { Texture: OglTexture } = await import('ogl');
    const { gl } = engine;

    // No colour management anywhere in this pipeline, deliberately. ogl uploads
    // the bytes as they are and the shader writes them straight back out, so
    // the canvas matches the <img> underneath it exactly. Tagging the texture
    // sRGB would make WebGL2 decode to linear on sample with nothing to encode
    // it back, and every photograph would render about a gamma too dark.
    const texture = new OglTexture(gl, {
      image,
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });

    cache.set(url, texture);

    const inUse = new Set([
      engine.program.uniforms.uFrom.value,
      engine.program.uniforms.uTo.value,
    ]);

    for (const [key, value] of cache) {
      if (cache.size <= MAX_CACHED_TEXTURES) break;
      if (inUse.has(value) || value === texture) continue;
      if (value.texture) gl.deleteTexture(value.texture);
      cache.delete(key);
    }

    return texture;
  }, []);

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

    // Imported here rather than at module scope so the WebGL code stays out of
    // the homepage's initial bundle: this effect runs only after the hero <img>
    // has painted, keeping it off the LCP critical path entirely.
    import('ogl')
      .then(({ Renderer: OglRenderer, Program: OglProgram, Mesh: OglMesh, Triangle }) => {
        if (cancelled) return;

        const renderer = new OglRenderer({
          canvas,
          alpha: false,
          antialias: false,
          depth: false,
          dpr: Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
          powerPreference: 'low-power',
        });

        const gl = renderer.gl as HeroEngine['gl'];

        const program = new OglProgram(gl, {
          vertex: HERO_VERTEX_SHADER,
          fragment: HERO_FRAGMENT_SHADER,
          depthTest: false,
          depthWrite: false,
          cullFace: false,
          uniforms: {
            uFrom: { value: null },
            uTo: { value: null },
            uFromFrame: { value: new Float32Array([1, 1, 0, 0]) },
            uToFrame: { value: new Float32Array([1, 1, 0, 0]) },
            uProgress: { value: 1 },
            uTime: { value: 0 },
            uGrain: { value: GRAIN_STRENGTH },
            uVignette: { value: VIGNETTE_STRENGTH },
            uResolution: { value: new Float32Array([1, 1]) },
          },
        });

        // ogl warns on a failed compile but does not always throw, and a
        // program that never linked still renders, as black, which would
        // blank the photograph the canvas sits on. Check explicitly.
        if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
          setFailed(true);
          return;
        }

        // One fullscreen triangle rather than a quad: no diagonal seam, and one
        // fewer vertex to transform.
        const mesh = new OglMesh(gl, { geometry: new Triangle(gl), program });

        canvas.addEventListener('webglcontextlost', handleContextLost);

        disposeEngine = () => {
          canvas.removeEventListener('webglcontextlost', handleContextLost);
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        };

        engineRef.current = {
          renderer,
          program,
          mesh,
          gl,
          // ogl binds sampler uniforms by dereferencing them, so a render
          // before the first texture is assigned throws on a null uFrom/uTo.
          // The sizing effect renders as soon as the canvas is measured, which
          // is before any image has decoded, so the guard belongs here rather
          // than at each call site.
          render: () => {
            if (!program.uniforms.uTo.value || !program.uniforms.uFrom.value) return;
            renderer.render({ scene: mesh });
          },
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

      const gl = engineRef.current?.gl;
      for (const texture of textures.values()) {
        if (gl && texture.texture) gl.deleteTexture(texture.texture);
      }
      textures.clear();

      disposeEngine?.();
      engineRef.current = null;
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

      engine.renderer.setSize(clientWidth, clientHeight);
      // setSize writes inline pixel width/height onto the canvas, which would
      // override the stylesheet's 100%/100% and stop it tracking the hero box.
      canvas.style.width = '';
      canvas.style.height = '';

      engine.program.uniforms.uResolution.value.set([clientWidth, clientHeight]);

      // Reframe both textures: a resize changes the cover crop.
      for (const [textureKey, frameKey] of [
        ['uFrom', 'uFromFrame'],
        ['uTo', 'uToFrame'],
      ] as const) {
        const texture = engine.program.uniforms[textureKey].value as Texture | null;
        const image = texture?.image as { width: number; height: number } | undefined;
        if (!image) continue;

        engine.program.uniforms[frameKey].value.set(
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

      const { uniforms } = engine.program;
      const image = texture.image as { width: number; height: number };
      const frame = computeFrame(
        image.width,
        image.height,
        canvas.clientWidth,
        canvas.clientHeight,
        focalRef.current,
      );

      const previous = uniforms.uTo.value as Texture | null;
      const isFirstFrame = previous === null;

      uniforms.uFrom.value = previous ?? texture;
      uniforms.uFromFrame.value.set(uniforms.uToFrame.value);
      uniforms.uTo.value = texture;
      uniforms.uToFrame.value.set(frame);

      // The very first texture appears without a dissolve, there is nothing to
      // dissolve from, and animating here would fight the <img> fade-in.
      if (isFirstFrame) {
        uniforms.uFromFrame.value.set(frame);
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

  // Land an in-flight dissolve on its final frame when the tab is hidden, so
  // returning to it never shows a transition frozen half-way.
  useEffect(() => {
    const handleVisibility = () => {
      const engine = engineRef.current;
      if (!engine) return;
      if (document.visibilityState !== 'hidden' || frameRef.current === null) return;

      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      engine.program.uniforms.uProgress.value = 1;
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
