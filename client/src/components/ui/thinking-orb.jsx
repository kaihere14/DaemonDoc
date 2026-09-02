"use client";
import * as React from "react";
import { cva } from "class-variance-authority";
import { useAnimationFrame, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * B6 UI: Thinking Orb
 *
 * A small status pill that pairs an animated orb with a label, for showing what
 * an agent is doing: thinking, listening, searching, working, solving.
 *
 * The orb is a sphere of particles drawn on a `<canvas>`. Each particle sits at
 * a fixed point on a unit sphere with its own phase offset and base brightness;
 * every frame the sphere is turned, the points are projected with perspective,
 * and each particle is drawn back-to-front with size and opacity scaled by its
 * depth, so the front of the sphere reads brighter and nearer than the back. A
 * few particles orbit just outside the surface. `preset` (or `kind`) only
 * changes the motion: the spin rate, how the radius breathes, whether particles
 * scan outward or pulse like a radar. `working` is the exception: a stationary
 * tall matrix of dots with a soft wave of brightness travelling down it.
 *
 * The draw loop runs on Motion's frame loop (`useAnimationFrame`), writing
 * straight to the canvas, so it never re-renders React. Under
 * `prefers-reduced-motion`, or with `active={false}`, it paints one still frame
 * and stops.
 *
 * This file is standalone by design. It carries its own type-step reads and
 * imports nothing from the rest of B6, because a registry item has to work in a
 * project that installed nothing else.
 */

/* -------------------------------------------------------------------------- */
/* Type steps                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * B6 type steps as direct token reads. A registry component cannot name a step
 * (`text-small`): tailwind-merge only sorts the B6 scale into the font-size
 * group when cn() has been extended, which a stock shadcn project has not, so
 * the step would be mistaken for a colour and a later size utility would delete
 * an earlier colour. Reading the token lands the step in the font-size group
 * for every cn(), and still loses to a consumer's own `text-lg`.
 */
const TYPE = {
  caption:
    "text-(length:--text-caption) leading-(--text-caption--line-height) tracking-(--text-caption--letter-spacing)",

  small: "text-(length:--text-small) leading-(--text-small--line-height)",
  body: "text-(length:--text-body) leading-(--text-body--line-height)",
};

/* -------------------------------------------------------------------------- */
/* Styling                                                                     */
/* -------------------------------------------------------------------------- */

const thinkingOrbVariants = cva(
  [
    "inline-flex items-center select-none",
    "rounded-full border transition-colors duration-150 ease-b6",
  ],
  {
    variants: {
      size: {
        sm: `h-8 gap-2 py-1 pr-3 pl-1.5 ${TYPE.caption} [--orb-size:1.25rem]`,
        md: `h-10 gap-2.5 py-1 pr-4 pl-2 ${TYPE.small} [--orb-size:1.75rem]`,
        lg: `h-12 gap-3 py-1.5 pr-5 pl-2.5 ${TYPE.body} [--orb-size:2.25rem]`,
      },
      tone: {
        surface: "border-border bg-card text-card-foreground shadow-b6-xs",
        muted: "border-transparent bg-muted text-muted-foreground",
        ghost: "border-transparent bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "surface",
    },
  },
);

/**
 * Preset to orb motion plus default label. `label` here is a fallback only: an
 * explicit `label` prop always wins, and `showLabel={false}` drops the text.
 */
const THINKING_ORB_PRESETS = {
  idle: { kind: "pulse", label: "Idle" },
  thinking: { kind: "wave", label: "Thinking" },
  listening: { kind: "cluster", label: "Agent listening" },
  working: { kind: "spark", label: "Working" },
  searching: { kind: "globe", label: "Searching" },
  solving: { kind: "dots", label: "Solving" },
};

const TAU = Math.PI * 2;

/** Deterministic 0..1 hash, so the field is identical on every load. */
function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** `count` points spread evenly over a unit sphere by the Fibonacci lattice. */
function fibonacciSphere(count) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    return { x: Math.cos(theta) * ring, y, z: Math.sin(theta) * ring };
  });
}

function buildField(surface, outliers) {
  const onSurface = fibonacciSphere(surface).map((p, i) => ({
    ...p,
    phase: hash(i + 1),
    bright: 0.4 + hash(i + 7.3) * 0.6,
    orbit: 1,
  }));
  const orbiting = fibonacciSphere(outliers).map((p, i) => ({
    ...p,
    phase: hash(i + 101),
    bright: 0.75 + hash(i + 53) * 0.25,
    orbit: 1.16 + hash(i + 211) * 0.22,
  }));
  return [...onSurface, ...orbiting];
}

/**
 * One field per kind, built once. `wave` and `spark` are drawn as lines and
 * bars rather than free particles, so they need no field.
 */
const FIELDS = {
  globe: buildField(96, 5),
  wave: [],
  dots: buildField(52, 4),
  spark: [],
  cluster: buildField(34, 3),
  pulse: buildField(32, 3),
};

/* -------------------------------------------------------------------------- */
/* Wave: a scanning ring of meridian lines                                     */
/* -------------------------------------------------------------------------- */

const WAVE_MERIDIANS = 26;
const WAVE_SEGMENTS = 18;
/** Latitudes each meridian line is sampled at, a band with the poles cut off. */
const WAVE_PHI = Array.from({ length: WAVE_SEGMENTS + 1 }, (_, i) => {
  const f = i / WAVE_SEGMENTS;
  return 0.13 * Math.PI + f * 0.74 * Math.PI;
});
/** A fixed brightness per line, so some strokes always read stronger. */
const WAVE_BRIGHT = Array.from(
  { length: WAVE_MERIDIANS },
  (_, m) => 0.4 + hash(m + 3.7) * 0.6,
);

/* -------------------------------------------------------------------------- */
/* Working: a stationary dot matrix with a wave travelling down it              */
/* -------------------------------------------------------------------------- */

/** A tall, narrow grid: 5 columns by 14 rows, roughly a 1:2.8 field. */
const WORK_COLS = 5;
const WORK_ROWS = 14;
const WORK_ASPECT = WORK_COLS / WORK_ROWS;
/** Width of the active band as a fraction of the grid height. */
const WORK_SIGMA = 0.12;

const MOTION = {
  // thinking: drawn by paintWave, not the particle path. Kept for the record type.
  wave: {
    radius: 0.92,
    dot: 0.05,
    spin: 0.5,
    globalRadius: () => 1,
    particleRadius: () => 1,
    glow: () => 1,
  },
  // searching: the sphere turns while a moving band of particles shoots outward.
  globe: {
    radius: 0.92,
    dot: 0.038,
    spin: 0.72,
    globalRadius: () => 1,
    particleRadius: (t, p) => {
      const beam = Math.sin(t * 1.15 - p.phase * TAU);
      const shoot = beam > 0.85 ? (beam - 0.85) / 0.15 : 0;
      return 1 + shoot * shoot * 0.34;
    },
    glow: () => 1,
  },
  // solving: every particle draws toward the centre, then expands back out.
  dots: {
    radius: 0.92,
    dot: 0.05,
    spin: 0.62,
    globalRadius: (t) => 0.5 + 0.5 * (0.5 - 0.5 * Math.cos(t * 1.05)),
    particleRadius: (t, p) => 1 + 0.03 * Math.sin(t * 2 + p.phase * TAU),
    glow: () => 1,
  },
  // working: drawn by paintWork as a dot matrix, not the particle path. Kept
  // for the record type.
  spark: {
    radius: 0.9,
    dot: 0.048,
    spin: 1.5,
    globalRadius: () => 1,
    particleRadius: () => 1,
    glow: () => 1,
  },
  // listening: a small sphere breathing outward in soft radar rings.
  cluster: {
    radius: 0.64,
    dot: 0.058,
    spin: 0.42,
    globalRadius: () => 1,
    particleRadius: (t, p) => {
      const w = Math.max(0, Math.sin(t * 2.2 - p.phase * TAU));
      return 1 + 0.17 * w * w;
    },
    glow: (t) => 0.8 + 0.2 * (0.5 + 0.5 * Math.sin(t * 2.2)),
  },
  // idle: a slow, dim sphere with a shallow breath.
  pulse: {
    radius: 0.82,
    dot: 0.062,
    spin: 0.26,
    globalRadius: (t) => 1 + 0.05 * Math.sin(t * 0.85),
    particleRadius: (t, p) => 1 + 0.02 * Math.sin(t * 1.2 + p.phase * TAU),
    glow: () => 0.76,
  },
};

/* -------------------------------------------------------------------------- */
/* Canvas                                                                      */
/* -------------------------------------------------------------------------- */

const TILT = -0.34;
const COS_TILT = Math.cos(TILT);
const SIN_TILT = Math.sin(TILT);
const PERSPECTIVE = 0.55;

/** A shared 1x1 context that turns any CSS colour string into "r,g,b". */
let colorProbe = null;

function resolveColor(css) {
  if (typeof document === "undefined") return "255,255,255";
  if (!colorProbe) {
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    colorProbe = probe.getContext("2d", { willReadFrequently: true });
  }
  if (!colorProbe) return "255,255,255";
  colorProbe.clearRect(0, 0, 1, 1);
  colorProbe.fillStyle = "#000";
  colorProbe.fillStyle = css;
  colorProbe.fillRect(0, 0, 1, 1);
  const [r, g, b] = colorProbe.getImageData(0, 0, 1, 1).data;
  return `${r},${g},${b}`;
}

/**
 * `wave`: a horizontally squashed ring built from meridian lines. The ring
 * turns slowly while a brightness wave travels around it and each point wobbles
 * a little, so it reads as an organic scan rather than a spinner.
 */
function paintWave(ctx, state, t) {
  const { w, h, dpr, color } = state;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const unit = Math.min(w, h) / 2;
  const radius = unit * 0.96;
  const squash = 0.72;
  const yaw = t * 0.5;

  ctx.lineCap = "round";

  // Draw back meridians first so the front ones sit on top.
  const order = Array.from({ length: WAVE_MERIDIANS }, (_, m) => m).sort(
    (a, b) =>
      Math.sin((a / WAVE_MERIDIANS) * TAU + yaw) -
      Math.sin((b / WAVE_MERIDIANS) * TAU + yaw),
  );

  for (const m of order) {
    const lon = (m / WAVE_MERIDIANS) * TAU;
    const travel = 0.5 + 0.5 * Math.sin(lon * 3 - t * 2.2);
    let prevX = 0;
    let prevY = 0;

    for (let s = 0; s <= WAVE_SEGMENTS; s++) {
      const phi = WAVE_PHI[s];
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const wobble = 1 + 0.05 * Math.sin(phi * 5 + t * 1.6 + lon * 2);
      const x0 = sinPhi * Math.cos(lon + yaw) * wobble;
      const z0 = sinPhi * Math.sin(lon + yaw) * wobble;
      const y0 = cosPhi * wobble;
      const zr = y0 * SIN_TILT + z0 * COS_TILT;
      const yr = y0 * COS_TILT - z0 * SIN_TILT;
      const near = 1 + zr * PERSPECTIVE * 0.5;
      const px = cx + x0 * radius * near;
      const py = cy + yr * radius * squash * near;

      if (s > 0) {
        const depth = (zr + 1) / 2;
        const alpha = Math.min(
          1,
          (0.05 + depth * 0.5) * WAVE_BRIGHT[m] * (0.3 + travel * 0.85),
        );
        ctx.strokeStyle = `rgba(${color},${alpha})`;
        ctx.lineWidth = Math.max(0.6 * dpr, (0.45 + depth * 1.1) * dpr);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
      prevX = px;
      prevY = py;
    }
  }
}

/**
 * `spark` (working): a tall, narrow grid of dots that never moves. A band of
 * brightness and scale runs down it to the bottom row, then reverses and runs
 * back to the top, bouncing between the two edges. The band has a Gaussian
 * falloff, so dots near it grow and glow while the rest stay small and dim,
 * and the edge between them is soft. The band's travel rate is not constant (a
 * gentle speed-up and slow-down, and it eases to a stop at each turn), each
 * column is nudged out of step with its neighbours, and the band tilts across
 * the columns, so it reads as a surface passing through the matrix rather than
 * a bar sliding down it. At `t` near 0 the band sits at the top, which is the
 * frame shown when the animation is paused or reduced.
 */
function paintWork(ctx, state, t) {
  const { w, h, dpr, color } = state;
  ctx.clearRect(0, 0, w, h);

  const gridH = h * 0.98;
  const gridW = gridH * WORK_ASPECT;
  const stepX = gridW / WORK_COLS;
  const stepY = gridH / WORK_ROWS;
  const originX = (w - gridW) / 2 + stepX / 2;
  const originY = (h - gridH) / 2 + stepY / 2;
  const baseDot = Math.min(stepX, stepY) * 0.22;

  // Band centre in grid-row units (0 = top row, 1 = bottom row), ping-ponging
  // 0 -> 1 -> 0 so the wave runs to the bottom, reverses, and runs back up. The
  // triangle apexes ease each turn; the sine term keeps the mid-travel rate
  // uneven.
  const phase = t * 0.78 + 0.08 * Math.sin(t * 2.2);
  const band = 1 - Math.abs(1 - (phase % 2));
  const twoSigmaSq = 2 * WORK_SIGMA * WORK_SIGMA;

  for (let col = 0; col < WORK_COLS; col++) {
    // A per-column phase offset plus a tilt that rises down the column.
    const colShift = 0.028 * Math.sin(col * 1.7 + t * 0.55);
    const colTilt = 0.06 * Math.sin(col * 0.9 - t * 1.1);
    const px = originX + col * stepX;

    for (let row = 0; row < WORK_ROWS; row++) {
      const rowY = row / (WORK_ROWS - 1);

      const d = rowY + colShift + colTilt * rowY - band;
      const g = Math.exp(-(d * d) / twoSigmaSq);

      const alpha = Math.min(1, 0.14 + g * 0.86);
      const radius = Math.max(0.4 * dpr, baseDot * (1 + g * 1.15));
      const py = originY + row * stepY;

      if (g > 0.72) {
        ctx.shadowBlur = 5 * dpr * g;
        ctx.shadowColor = `rgba(${color},${0.5 * g})`;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, TAU);
      ctx.fill();
    }
  }
  ctx.shadowBlur = 0;
}

function paint(ctx, state, field, kind, t) {
  if (kind === "wave") {
    paintWave(ctx, state, t);
    return;
  }
  if (kind === "spark") {
    paintWork(ctx, state, t);
    return;
  }

  const { w, h, dpr, color } = state;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const unit = Math.min(w, h) / 2;
  const motion = MOTION[kind];
  const radius = unit * motion.radius;
  const baseDot = unit * motion.dot;
  const globalRadius = motion.globalRadius(t);
  const glow = motion.glow(t);

  const yaw = t * motion.spin;
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);

  if (state.scratch.length !== field.length) {
    state.scratch = field.map((p) => ({ sx: 0, sy: 0, sz: 0, p }));
  }
  const list = state.scratch;
  for (let i = 0; i < field.length; i++) {
    const p = field[i];
    const rr = p.orbit * globalRadius * motion.particleRadius(t, p);
    const x = p.x * rr;
    const y = p.y * rr;
    const z = p.z * rr;
    const xr = x * cosYaw + z * sinYaw;
    const zr = z * cosYaw - x * sinYaw;
    const yr = y * COS_TILT - zr * SIN_TILT;
    const zt = y * SIN_TILT + zr * COS_TILT;
    const item = list[i];
    item.sx = xr;
    item.sy = yr;
    item.sz = zt;
    item.p = p;
  }
  list.sort((a, b) => a.sz - b.sz);

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const depth = (item.sz + 1) / 2;
    const near = 1 + item.sz * PERSPECTIVE * 0.5;
    const px = cx + item.sx * radius * near;
    const py = cy + item.sy * radius * near;
    const dotRadius = Math.max(0.45 * dpr, baseDot * (0.4 + depth * 1) * near);
    const alpha = Math.min(1, (0.1 + depth * 0.95) * item.p.bright * glow);

    if (item.p.bright > 0.8 && depth > 0.62) {
      ctx.shadowBlur = 6 * dpr * depth;
      ctx.shadowColor = `rgba(${color},${0.4 * depth})`;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = `rgba(${color},${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, dotRadius, 0, TAU);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function ParticleOrb({ kind, running, speed }) {
  const canvasRef = React.useRef(null);
  const field = FIELDS[kind];
  const stateRef = React.useRef({
    w: 0,
    h: 0,
    dpr: 1,
    color: "255,255,255",
    start: 0,
    frame: 0,
    scratch: [],
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const readColor = () => {
      stateRef.current.color = resolveColor(getComputedStyle(canvas).color);
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = w;
      canvas.height = h;
      Object.assign(stateRef.current, { w, h, dpr });
      readColor();
      const ctx = canvas.getContext("2d");
      if (ctx) paint(ctx, stateRef.current, field, kind, 0.0001);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    const theme = new MutationObserver(readColor);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    return () => {
      observer.disconnect();
      theme.disconnect();
    };
  }, [field, kind]);

  // Paint one still frame whenever the animation is not running.
  React.useEffect(() => {
    if (running) return;
    stateRef.current.start = 0;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && stateRef.current.w) {
      paint(ctx, stateRef.current, field, kind, 0.0001);
    }
  }, [running, field, kind]);

  useAnimationFrame((time) => {
    if (!running) return;
    const ctx = canvasRef.current?.getContext("2d");
    const state = stateRef.current;
    if (!ctx || !state.w) return;
    if (!state.start) state.start = time;
    if ((state.frame = (state.frame + 1) % 45) === 0) {
      state.color = resolveColor(getComputedStyle(ctx.canvas).color);
    }
    paint(ctx, state, field, kind, ((time - state.start) / 1000) * speed);
  });

  return (
    <canvas ref={canvasRef} className="block size-full" aria-hidden="true" />
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

const ThinkingOrb = React.forwardRef(function ThinkingOrb(
  {
    className,
    size,
    tone,
    preset = "thinking",
    kind,
    label,
    showLabel = true,
    active = true,
    speed = 1,
    role,
    ...props
  },
  forwardedRef,
) {
  const reducedMotion = useReducedMotion() ?? false;

  const config = THINKING_ORB_PRESETS[preset];
  const resolvedKind = kind ?? config.kind;
  const resolvedLabel = label ?? config.label;
  const resolvedSpeed = speed > 0 ? speed : 1;
  const running = active && !reducedMotion;

  return (
    <div
      ref={forwardedRef}
      role={role ?? "status"}
      aria-live="polite"
      aria-label={showLabel ? undefined : resolvedLabel}
      data-preset={preset}
      data-kind={resolvedKind}
      data-active={active || undefined}
      className={cn(thinkingOrbVariants({ size, tone }), className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="block size-(--orb-size) shrink-0 text-current"
      >
        <ParticleOrb
          kind={resolvedKind}
          running={running}
          speed={resolvedSpeed}
        />
      </span>
      {showLabel && (
        <span className="truncate font-medium">{resolvedLabel}</span>
      )}
    </div>
  );
});

export { ThinkingOrb, thinkingOrbVariants, THINKING_ORB_PRESETS };
