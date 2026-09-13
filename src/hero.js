/**
 * "The Compression" — the hero particle field.
 *
 * A scattered cloud of points (the quarter) collapses into an ordered lattice
 * (the week) as you scroll the hero. The argument the page makes in words,
 * made in geometry before anyone reads a line.
 *
 * Each particle carries BOTH end states as attributes and the vertex shader
 * mixes between them. No GPGPU, no render targets, no per-frame CPU work
 * beyond writing three uniforms — which is why this holds 60fps on a phone.
 */
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl';

const VERT = /* glsl */ `
  attribute vec3 aScatter;
  attribute vec3 aOrder;
  attribute vec2 aSeed;      // x: stagger offset, y: size/brightness jitter

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uMouse;       // xy world position, z strength (0 when absent)
  uniform float uScale;

  varying float vOrdered;
  varying float vSeed;
  varying float vScreenX;

  void main() {
    // Stagger: particles resolve over the first 75% of travel, offset by seed,
    // so the lattice assembles rather than snapping.
    float p = clamp((uProgress - aSeed.x * 0.25) / 0.75, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);

    vec3 pos = mix(aScatter, aOrder, p);

    // Idle drift, only while scattered. Dies out as the lattice forms.
    float drift = 1.0 - p;
    pos.x += sin(uTime * 0.35 + aSeed.x * 12.57) * 0.10 * drift;
    pos.y += cos(uTime * 0.29 + aSeed.y * 12.57) * 0.10 * drift;
    pos.z += sin(uTime * 0.21 + aSeed.x * 6.28) * 0.16 * drift;

    // Cursor attraction. Inverse-square falloff so the pull is local, and
    // scaled by (1 - p) * 0.6 + 0.4 so the settled lattice still responds
    // a little rather than going dead.
    vec2 d = uMouse.xy - pos.xy;
    float fall = 1.0 / (1.0 + dot(d, d) * 9.0);
    pos.xy += d * fall * 0.34 * uMouse.z * (drift * 0.6 + 0.4);

    vOrdered = p;
    vSeed = aSeed.y;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // 0 at the left edge of the viewport, 1 at the right.
    vScreenX = (gl_Position.x / max(gl_Position.w, 0.0001)) * 0.5 + 0.5;
    // Perspective size: nearer points are larger, and ordered points tighten.
    float sizeVar = mix(1.0, 0.55 + aSeed.y * 0.95, drift);
    gl_PointSize = uScale * (1.15 + 0.95 * drift) * sizeVar / max(-mv.z, 0.6);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uDim;
  uniform vec3 uAccent;
  uniform float uMask;       // 1 on wide screens, 0 when the copy is full-width

  varying float vOrdered;
  varying float vSeed;
  varying float vScreenX;

  void main() {
    // Round, soft-edged point. Discarding outside the disc keeps the field
    // from looking like a grid of squares at small sizes.
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;
    float alpha = smoothstep(0.25, 0.02, d);

    // Colour earns its way to the accent as the lattice resolves, and only
    // for some of the particles, so the ordered state reads as structure
    // rather than a flat wash of green.
    float tint = vOrdered * smoothstep(0.55, 1.0, vSeed);
    vec3 col = mix(uDim, uAccent, tint);

    // Fade the field out across the text column. The scattered state is
    // meant to be everywhere, but not at the cost of reading the paragraph,
    // and nudging the whole field right instead would leave the frame
    // lopsided at the start.
    float mask = mix(1.0, mix(0.16, 1.0, smoothstep(0.30, 0.66, vScreenX)), uMask);

    gl_FragColor = vec4(col, alpha * (0.62 + vOrdered * 0.32) * mask);
  }
`;

const lerp = (a, b, t) => a + (b - a) * t;

export function initHero(canvas, { count = 4200, accent = [0.776, 0.949, 0.306] } = {}) {
  const renderer = new Renderer({
    canvas,
    alpha: true,
    antialias: false,           // points are already soft-edged; MSAA buys nothing
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    powerPreference: 'high-performance',
  });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const camera = new Camera(gl, { fov: 38, near: 0.1, far: 60 });
  camera.position.set(0, 0, 7.5);

  const scene = new Transform();

  const scatter = new Float32Array(count * 3);
  const order = new Float32Array(count * 3);
  const seed = new Float32Array(count * 2);

  // The ordered state is a single plane, not a slab. Stacked layers interleave
  // in projection and read as noise, which destroys the one thing the ordered
  // state has to communicate. One plane, evenly spaced, reads as order
  // instantly — and the slow rotation is what gives it dimension instead.
  const EXT = { x: 6.6, y: 4.6 };
  const nx = Math.max(2, Math.round(Math.sqrt(count * (EXT.x / EXT.y))));
  const ny = Math.max(2, Math.ceil(count / nx));

  for (let i = 0; i < count; i++) {
    // Scattered: a wide, shallow cloud biased outward, so the collapse reads
    // as travel rather than a uniform shrink.
    const a = Math.random() * Math.PI * 2;
    const r = 2.4 + Math.pow(Math.random(), 0.6) * 4.2;
    scatter[i * 3] = Math.cos(a) * r;
    scatter[i * 3 + 1] = Math.sin(a) * r * 0.62;
    scatter[i * 3 + 2] = (Math.random() - 0.5) * 5.5;

    const ix = i % nx;
    const iy = Math.floor(i / nx);
    order[i * 3] = (ix / (nx - 1) - 0.5) * EXT.x;
    order[i * 3 + 1] = (iy / Math.max(ny - 1, 1) - 0.5) * EXT.y;
    order[i * 3 + 2] = 0;

    seed[i * 2] = Math.random();
    seed[i * 2 + 1] = Math.random();
  }

  const geometry = new Geometry(gl, {
    aScatter: { size: 3, data: scatter },
    aOrder: { size: 3, data: order },
    aSeed: { size: 2, data: seed },
  });

  const program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: [0, 0, 0] },
      uScale: { value: 90 },
      uMask: { value: 0 },
      uDim: { value: [0.56, 0.56, 0.53] },
      uAccent: { value: accent },
    },
  });
  // Additive so overlapping points build density instead of flattening.
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  const mesh = new Mesh(gl, { geometry, program, mode: gl.POINTS });
  mesh.setParent(scene);

  let width = 0;
  let height = 0;
  let wide = false;
  let baseX = 0;
  let baseY = 0;
  function resize() {
    // Measure the STAGE, not the canvas: OGL's Renderer constructor calls
    // setSize(300, 150), which writes inline width/height styles onto the
    // canvas. Measuring the canvas after that reads those inline styles
    // instead of the CSS and locks the field at 300x150 forever.
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    renderer.setSize(width, height);
    // setSize re-asserts the pixel sizes; hand layout back to the stylesheet.
    canvas.style.width = '';
    canvas.style.height = '';

    camera.perspective({ aspect: width / height });

    // On wide screens the copy owns the left column and the right half is
    // empty, so the field lives there. Positioned as a FRACTION of the
    // viewport: a fixed world offset clears the text at 1440px and runs
    // straight through it at 900px, because world-units-per-pixel moves with
    // the viewport.
    const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * (width / height);
    wide = width / height > 1.15;
    baseX = wide ? (0.76 * 2 - 1) * halfW : 0;
    baseY = wide ? 0 : 0.35;
    program.uniforms.uMask.value = wide ? 1 : 0;
    // Keep point size proportional to the viewport so the field has the same
    // visual density on a phone as on a desktop.
    program.uniforms.uScale.value = Math.min(height, width * 0.62) * 0.15;
  }

  // --- input: scroll drives progress, pointer drives attraction ------------

  let targetProgress = 0;
  let progress = 0;
  const targetMouse = [0, 0, 0];
  const mouse = [0, 0, 0];

  // The lattice must finish forming while the hero is still on screen. The
  // stage is now three sections tall, so travel is measured against the
  // viewport instead of the stage — otherwise the payoff would land somewhere
  // around the services section, long after anyone stopped looking.
  const stage = canvas.closest('.stage') || canvas.parentElement;

  function readScroll() {
    const rect = stage.getBoundingClientRect();
    const travel = (window.innerHeight || 1) * 0.85;
    targetProgress = Math.min(Math.max(-rect.top / travel, 0), 1);
  }

  function onPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    // Convert to world units at the plane the lattice sits on.
    const h = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    targetMouse[0] = nx * h * (width / height);
    targetMouse[1] = ny * h;
    targetMouse[2] = 1;
  }
  function onLeave() {
    targetMouse[2] = 0;
  }

  // --- loop ----------------------------------------------------------------

  let raf = 0;
  let running = false;
  let last = performance.now();

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    readScroll();
    // Critically damped-ish easing: the field lags the scroll slightly, which
    // is what makes it feel like matter rather than a slider.
    const k = 1 - Math.pow(0.001, dt);
    progress = lerp(progress, targetProgress, k);
    mouse[0] = lerp(mouse[0], targetMouse[0], k);
    mouse[1] = lerp(mouse[1], targetMouse[1], k);
    mouse[2] = lerp(mouse[2], targetMouse[2], k);

    program.uniforms.uProgress.value = progress;
    program.uniforms.uTime.value += dt;
    program.uniforms.uMouse.value = mouse;

    // A slow drift on the whole field, so the ordered lattice is legible as a
    // three-dimensional object rather than a flat grid.
    scene.position.x = baseX;
    scene.position.y = baseY;

    scene.rotation.y = Math.sin(program.uniforms.uTime.value * 0.07) * 0.13;
    scene.rotation.x = Math.cos(program.uniforms.uTime.value * 0.05) * 0.055;

    renderer.render({ scene, camera });
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerleave', onLeave, { passive: true });
  document.addEventListener('visibilitychange', () =>
    document.hidden ? stop() : start()
  );

  // Only run while the hero is actually on screen. Below the fold this is a
  // canvas nobody can see burning a phone battery.
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { threshold: 0 }
  );
  io.observe(canvas.parentElement);

  return { start, stop, destroy() { stop(); io.disconnect(); } };
}
