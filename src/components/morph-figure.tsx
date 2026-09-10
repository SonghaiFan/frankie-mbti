"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { Renderer, Triangle, Program, Mesh, Texture } from "ogl";
import { cn } from "@/lib/utils";

/**
 * GPU morph between figures, adapted from React Bits' MorphSlider.
 *
 * The displacement shader is upstream's; everything around it is rebuilt for
 * this site: the output is transparent (our figures are cut-out SVGs on paper,
 * not photos in a dark frame), the fit is contain rather than cover so nobody
 * gets cropped, and the slide index is driven from outside — the preference
 * switches are the only control, so the component carries no chrome of its own.
 */

export type MorphTransition = "melt" | "ripple" | "shear" | "swirl";

const TRANSITIONS: Record<MorphTransition, number> = {
  melt: 0,
  ripple: 1,
  shear: 2,
  swirl: 3,
};

const vertexShader = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform vec2 uResolution;
uniform vec2 uCurrentSize;
uniform vec2 uNextSize;
uniform float uProgress;
uniform float uDir;
uniform int uMode;
uniform float uIntensity;
uniform float uScale;
uniform float uAberration;
uniform float uDrift;
uniform float uTime;
uniform float uReduce;

varying vec2 vUv;

const float PI = 3.14159265359;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

/* Contain, not cover — a cropped character reads as a bug. */
vec2 containUV(vec2 uv, vec2 res, vec2 img) {
  float rA = res.x / max(res.y, 1.0);
  float iA = img.x / max(img.y, 1.0);
  float ratio = rA / max(iA, 0.0001);
  vec2 s = vec2(1.0);
  if (ratio > 1.0) {
    s.x = ratio;
  } else {
    s.y = 1.0 / ratio;
  }
  return (uv - 0.5) * s + 0.5;
}

/* Undo premultiplication so a channel can be split without dragging colour
   toward black, then put it back. */
vec4 unpremultiply(vec4 c) {
  return c.a > 0.001 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}

/* Premultiplied sample with an RGB split, masked outside the image box so the
   figure keeps clean edges instead of smearing its border pixels.
   Alpha follows the centre sample alone — a side sample that lands off the
   figure must not punch a hole in, or a black rim around, the silhouette. */
vec4 sampleFigure(sampler2D tex, vec2 uv, float ca) {
  vec2 lo = step(vec2(0.0), uv);
  vec2 hi = step(uv, vec2(1.0));
  float inside = lo.x * lo.y * hi.x * hi.y;

  vec4 cg = unpremultiply(texture2D(tex, uv));
  vec4 cr = unpremultiply(texture2D(tex, uv + vec2(ca, 0.0)));
  vec4 cb = unpremultiply(texture2D(tex, uv - vec2(ca, 0.0)));

  // Only take a shifted channel where that sample actually has content.
  float r = mix(cg.r, cr.r, step(0.01, cr.a));
  float b = mix(cg.b, cb.b, step(0.01, cb.a));

  float a = cg.a * inside;
  return vec4(vec3(r, cg.g, b) * a, a);
}

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  float env = sin(p * PI);

  vec2 uv = vUv;

  uv += vec2(sin(uTime * 0.25 + uv.y * 4.0), cos(uTime * 0.22 + uv.x * 4.0)) * uDrift * 0.008;
  uv = (uv - 0.5) * (1.0 - uDrift * 0.02 * sin(uTime * 0.4)) + 0.5;

  vec2 uvC = uv;
  vec2 uvN = uv;
  float m = smoothstep(0.0, 1.0, p);

  if (uReduce < 0.5) {
    if (uMode == 3) {
      vec2 c = uv - 0.5;
      float r = length(c);
      float ang = env * uIntensity * 3.5 * (1.0 - r);
      uvC = rot(ang) * c + 0.5;
      uvN = rot(-ang) * c + 0.5;
    } else if (uMode == 1) {
      vec2 centre = vec2(0.5);
      float d = distance(uv, centre);
      float ring = p * 1.6;
      float wave = sin((d - ring) * 30.0) * env;
      vec2 dir = normalize(uv - centre + 1e-4);
      vec2 disp = dir * wave * uIntensity * 0.25;
      uvC = uv + disp;
      uvN = uv + disp * 0.6;
      m = 1.0 - smoothstep(ring - 0.03, ring + 0.03, d);
    } else if (uMode == 2) {
      float slices = 14.0;
      float row = floor(uv.y * slices);
      float rnd = hash11(row);
      vec2 disp = vec2((rnd - 0.5) * env * uIntensity * 0.6, 0.0);
      uvC = uv + disp;
      uvN = uv + disp;
      float localX = uDir > 0.0 ? uv.x : 1.0 - uv.x;
      float th = p * 1.5 - 0.25 + (rnd - 0.5) * 0.25;
      m = 1.0 - smoothstep(th - 0.06, th + 0.06, localX);
    } else {
      float nn = fbm(uv * uScale + uTime * 0.03);
      float warp = fbm(uv * uScale * 1.7 - uTime * 0.02);
      vec2 g = vec2(nn, warp) - 0.5;
      uvC = uv + g * uIntensity * 0.5 * p;
      uvN = uv - g * uIntensity * 0.5 * (1.0 - p);
      m = smoothstep(nn - 0.15, nn + 0.15, p);
    }
  }

  vec2 sC = containUV(uvC, uResolution, uCurrentSize);
  vec2 sN = containUV(uvN, uResolution, uNextSize);

  float ca = uReduce < 0.5 ? uAberration * env * 0.03 : 0.0;

  vec4 colC = sampleFigure(tCurrent, sC, ca);
  vec4 colN = sampleFigure(tNext, sN, ca);

  gl_FragColor = mix(colC, colN, m);
}
`;

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1]; // ≈ power2.inOut

/** SVGs carry a 400px intrinsic box; rasterise well past it so the morph stays
 *  crisp on a retina drawing buffer. */
const RASTER = 1024;

function rasterise(src: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth || RASTER;
      const h = img.naturalHeight || RASTER;
      const s = RASTER / Math.max(w, h);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(w * s));
      canvas.height = Math.max(1, Math.round(h * s));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("no 2d context"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

interface MorphItem {
  src: string;
  alt?: string;
}

interface Engine {
  morphTo: (index: number, dir: number) => void;
  setOptions: (o: Options) => void;
  destroy: () => void;
}

interface Options {
  transition: MorphTransition;
  intensity: number;
  scale: number;
  aberration: number;
  drift: number;
  duration: number;
}

function createEngine(
  container: HTMLElement,
  items: MorphItem[],
  startIndex: number,
  options: Options,
  reduced: boolean,
  onReady: () => void
): Engine | null {
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      alpha: true,
      antialias: true,
      // Our textures and shader output are premultiplied; the context has to
      // agree, or the compositor multiplies edge pixels by alpha twice and
      // every antialiased edge darkens toward black.
      premultipliedAlpha: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
  } catch {
    return null;
  }

  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const canvas = gl.canvas as HTMLCanvasElement;
  canvas.className = "morph-figure-canvas";
  container.appendChild(canvas);

  const blank = new Texture(gl, {
    image: new Uint8Array([0, 0, 0, 0]),
    width: 1,
    height: 1,
    generateMipmaps: false,
  });

  const textures: (Texture | null)[] = items.map(() => null);
  const sizes: [number, number][] = items.map(() => [1, 1]);

  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    transparent: true,
    uniforms: {
      tCurrent: { value: blank },
      tNext: { value: blank },
      uResolution: { value: [1, 1] },
      uCurrentSize: { value: [1, 1] },
      uNextSize: { value: [1, 1] },
      uProgress: { value: 0 },
      uDir: { value: 1 },
      uMode: { value: TRANSITIONS[options.transition] },
      uIntensity: { value: options.intensity },
      uScale: { value: options.scale },
      uAberration: { value: options.aberration },
      uDrift: { value: options.drift },
      uTime: { value: 0 },
      uReduce: { value: reduced ? 1 : 0 },
    },
  });
  // Textures are premultiplied, so blend accordingly.
  program.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  let opts = options;
  let current = startIndex;
  let raf = 0;
  let tween: { stop: () => void } | null = null;
  let disposed = false;
  let ready = false;

  const loading = new Map<number, Promise<void>>();

  const ensure = (i: number): Promise<void> => {
    if (textures[i]) return Promise.resolve();
    const existing = loading.get(i);
    if (existing) return existing;

    const job = rasterise(items[i].src)
      .then((canvasSource) => {
        if (disposed) return;
        const texture = new Texture(gl, {
          image: canvasSource,
          generateMipmaps: false,
          premultiplyAlpha: true,
        });
        textures[i] = texture;
        sizes[i] = [canvasSource.width, canvasSource.height];
      })
      .catch(() => {});

    loading.set(i, job);
    return job;
  };

  const showCurrent = () => {
    const tex = textures[current];
    if (!tex) return;
    program.uniforms.tCurrent.value = tex;
    program.uniforms.uCurrentSize.value = sizes[current];
    program.uniforms.tNext.value = tex;
    program.uniforms.uNextSize.value = sizes[current];
    program.uniforms.uProgress.value = 0;
    if (!ready) {
      ready = true;
      onReady();
    }
  };

  const resize = () => {
    const rect = container.getBoundingClientRect();
    renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1));
    program.uniforms.uResolution.value = [canvas.width, canvas.height];
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const onContextLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
  };
  canvas.addEventListener("webglcontextlost", onContextLost, false);

  const loop = (t: number) => {
    program.uniforms.uTime.value = t * 0.001;
    renderer.render({ scene: mesh });
    raf = requestAnimationFrame(loop);
  };

  // The idle drift means this never settles, so don't burn a GPU loop on a
  // tab nobody is looking at.
  const onVisibility = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !disposed) raf = requestAnimationFrame(loop);
  };
  document.addEventListener("visibilitychange", onVisibility);

  raf = requestAnimationFrame(loop);

  ensure(current).then(showCurrent);

  const commit = (target: number) => {
    current = target;
    const tex = textures[target];
    if (tex) {
      program.uniforms.tCurrent.value = tex;
      program.uniforms.uCurrentSize.value = sizes[target];
    }
    program.uniforms.uProgress.value = 0;
    tween = null;
  };

  return {
    setOptions(next) {
      opts = next;
      program.uniforms.uMode.value = TRANSITIONS[next.transition];
      program.uniforms.uIntensity.value = next.intensity;
      program.uniforms.uScale.value = next.scale;
      program.uniforms.uAberration.value = next.aberration;
      program.uniforms.uDrift.value = next.drift;
    },

    morphTo(target, dir) {
      if (disposed || target === current) return;

      // A change mid-morph lands the one in flight before starting the next.
      if (tween) {
        tween.stop();
        const inFlight = (program.uniforms.tNext.value as Texture) ?? null;
        if (inFlight) {
          program.uniforms.tCurrent.value = inFlight;
          program.uniforms.uCurrentSize.value = program.uniforms.uNextSize.value;
        }
        program.uniforms.uProgress.value = 0;
        tween = null;
      }

      ensure(target).then(() => {
        if (disposed) return;
        const tex = textures[target];
        if (!tex) {
          commit(target);
          return;
        }
        if (!ready) {
          current = target;
          showCurrent();
          return;
        }

        program.uniforms.tNext.value = tex;
        program.uniforms.uNextSize.value = sizes[target];
        program.uniforms.uDir.value = dir;

        tween = animate(0, 1, {
          duration: reduced ? Math.min(opts.duration, 0.35) : opts.duration,
          ease: EASE,
          onUpdate: (v) => {
            program.uniforms.uProgress.value = v;
          },
          onComplete: () => commit(target),
        });
      });
    },

    destroy() {
      disposed = true;
      cancelAnimationFrame(raf);
      tween?.stop();
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      textures.forEach((tex) => {
        if (tex?.texture) gl.deleteTexture(tex.texture);
      });
      if (blank.texture) gl.deleteTexture(blank.texture);
      if (program.program) gl.deleteProgram(program.program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.parentNode?.removeChild(canvas);
    },
  };
}

interface MorphFigureProps {
  items: MorphItem[];
  index: number;
  transition?: MorphTransition;
  duration?: number;
  intensity?: number;
  scale?: number;
  aberration?: number;
  drift?: number;
  className?: string;
  /** Rendered underneath until WebGL has its first frame, and left in place if it never does. */
  fallback?: React.ReactNode;
}

export function MorphFigure({
  items,
  index,
  transition = "melt",
  duration = 0.9,
  intensity = 0.45,
  scale = 2.4,
  aberration = 0.22,
  drift = 0.25,
  className,
  fallback,
}: MorphFigureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const lastIndex = useRef(index);
  const [ready, setReady] = useState(false);

  const optionsRef = useRef<Options>({
    transition,
    intensity,
    scale,
    aberration,
    drift,
    duration,
  });
  optionsRef.current = { transition, intensity, scale, aberration, drift, duration };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = createEngine(
      container,
      items,
      lastIndex.current,
      optionsRef.current,
      reduced,
      () => setReady(true)
    );

    engineRef.current = engine;
    return () => {
      engine?.destroy();
      engineRef.current = null;
      setReady(false);
    };
    // Items are a stable list for the life of the page.
  }, [items]);

  useEffect(() => {
    engineRef.current?.setOptions(optionsRef.current);
  }, [transition, intensity, scale, aberration, drift, duration]);

  useEffect(() => {
    if (index === lastIndex.current) return;
    const dir = index > lastIndex.current ? 1 : -1;
    lastIndex.current = index;
    engineRef.current?.morphTo(index, dir);
  }, [index]);

  return (
    <div className={cn("relative", className)}>
      <div ref={containerRef} className="absolute inset-0" aria-hidden />
      {fallback && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            ready ? "opacity-0" : "opacity-100"
          )}
        >
          {fallback}
        </div>
      )}
    </div>
  );
}
