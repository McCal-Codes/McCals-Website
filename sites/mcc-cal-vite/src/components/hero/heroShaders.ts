/**
 * Shader source for the hero transition layer.
 *
 * The fragment shader does three things in one pass: reproduce the CSS
 * `object-fit: cover` + `object-position` framing the <img> underneath already
 * uses, dissolve between the outgoing and incoming photograph, and lay film
 * grain and a vignette over the result.
 */

export const HERO_VERTEX_SHADER = /* glsl */ `
  // Declared explicitly: unlike three, ogl prepends nothing to a shader, so
  // the attributes its Triangle geometry supplies have to be named here.
  attribute vec2 position;
  attribute vec2 uv;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    // The geometry already covers clip space, so there is no camera transform.
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const HERO_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uFrom;
  uniform sampler2D uTo;

  // x = width scale, y = height scale, z = u offset, w = v offset.
  // Precomputed on the CPU so the cover maths costs nothing per fragment.
  uniform vec4 uFromFrame;
  uniform vec4 uToFrame;

  uniform float uProgress;
  uniform float uTime;
  uniform float uGrain;
  uniform float uVignette;
  uniform vec2  uResolution;

  const float DISSOLVE_SOFTNESS = 0.28;
  const float DISPLACE_STRENGTH = 0.018;

  vec2 frameUv(vec2 uv, vec4 frame) {
    return uv * frame.xy + frame.zw;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  /** Value noise with smoothstep interpolation. */
  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  /** Three octaves is enough to break up the dissolve edge without banding. */
  float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 3; i++) {
      total += valueNoise(p) * amplitude;
      p *= 2.0;
      amplitude *= 0.5;
    }

    return total;
  }

  float heroLuminance(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }

  void main() {
    vec2 uv = vUv;

    float noise = fbm(uv * 3.0);

    // Push both frames apart slightly at the midpoint of the dissolve, so the
    // cut reads as a physical shift rather than a plain opacity blend. sin()
    // returns to zero at both ends, leaving the resting frames undisturbed.
    float displace = sin(uProgress * 3.14159265) * DISPLACE_STRENGTH;
    vec2 offset = vec2(noise - 0.5) * displace;

    vec3 fromColor = texture2D(uFrom, frameUv(uv + offset, uFromFrame)).rgb;
    vec3 toColor   = texture2D(uTo,   frameUv(uv - offset, uToFrame)).rgb;

    // Sweep a threshold across the noise field. Padding the range past 0 and 1
    // guarantees every fragment has flipped by the time progress reaches 1.
    float threshold = mix(-DISSOLVE_SOFTNESS, 1.0 + DISSOLVE_SOFTNESS, uProgress);
    float blend = smoothstep(threshold - DISSOLVE_SOFTNESS, threshold + DISSOLVE_SOFTNESS, noise);

    vec3 color = mix(toColor, fromColor, blend);

    // Grain, weighted toward the midtones. Shadows hold noise badly and
    // highlights show it as dirt, which is also how film behaves.
    float grainNoise = hash(gl_FragCoord.xy + vec2(uTime * 37.0, uTime * 17.0)) - 0.5;
    float midtoneWeight = 1.0 - abs(heroLuminance(color) - 0.5) * 2.0;
    color += grainNoise * uGrain * mix(0.35, 1.0, midtoneWeight);

    // Vignette measured in aspect-corrected space so it stays circular. The
    // inner radius is held well outside the frame centre so the subject keeps
    // its original exposure and only the far corners fall off.
    vec2 centred = (uv - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    float falloff = smoothstep(1.15, 0.62, length(centred));
    color *= mix(1.0, falloff, uVignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;
