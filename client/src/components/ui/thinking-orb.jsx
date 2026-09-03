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
 * The orb is drawn on a `<canvas>` from small dots. `searching` uses a particle
 * sphere: each particle sits at a fixed point on a unit sphere with its own
 * phase offset and base brightness, and every frame the sphere is turned, the
 * points are projected with perspective, and each particle is drawn
 * back-to-front with size and opacity scaled by its depth, so the front reads
 * brighter and nearer than the back, with a few particles orbiting outside the
 * surface. The other five states each have their own painter: `idle` a dotted
 * wireframe sphere breathing slowly, `thinking` a scanning ring of meridian
 * lines, `working` a dotted disc with an energy band travelling round its rim,
 * `listening` a dotted sphere with a bright plane scanning up and down through
 * it, `solving` a fixed dot diamond with a bright band scanning through it.
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

/** Shared view transform: a small backward tilt on the X axis, plus a weak
 *  perspective so the near face of a sphere reads larger than the far one. */
const TILT = -0.34;
const COS_TILT = Math.cos(TILT);
const SIN_TILT = Math.sin(TILT);
const PERSPECTIVE = 0.55;

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
 * One field per kind, built once. Only `globe` still uses the particle path;
 * `pulse`, `wave`, `dots`, `spark` and `cluster` are drawn by their own
 * painters (a wireframe sphere, meridian lines, a diamond, a disc, a sphere),
 * so they need no particle field.
 */
const FIELDS = {
  globe: buildField(96, 5),
  wave: [],
  dots: [],
  spark: [],
  cluster: [],
  pulse: [],
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
/* Working: a dotted disc with an energy band travelling around its rim         */
/* -------------------------------------------------------------------------- */

/** Grid pitch and ring spacing, as a fraction of the working radius. */
const WORK_STEP = 0.12;
/** The inner square grid is clipped to this radius. */
const WORK_INNER_R = 0.6;
/** Number of concentric rings at the rim that carry the travelling highlight. */
const WORK_BAND_RINGS = 3;
/** Radial gap between one rim ring and the next. */
const WORK_RING_GAP = 0.12;

/**
 * The disc, built once. A square dot lattice clipped to a circle for the inner
 * field, then WORK_BAND_RINGS evenly spaced rings around it. Positions are
 * normalised to the working radius; paintWork only scales them to the canvas.
 */
const WORK_DISC = (() => {
  const dots = [];

  const half = Math.ceil(WORK_INNER_R / WORK_STEP);
  const limitSq = (WORK_INNER_R + WORK_STEP * 0.35) ** 2;
  for (let gy = -half; gy <= half; gy++) {
    for (let gx = -half; gx <= half; gx++) {
      const x = gx * WORK_STEP;
      const y = gy * WORK_STEP;
      if (x * x + y * y > limitSq) continue;
      dots.push({
        x,
        y,
        ang: 0,
        rf: 0,
        band: 0,
        jit: hash(gx * 91.7 + gy * 13.3),
      });
    }
  }

  for (let b = 1; b <= WORK_BAND_RINGS; b++) {
    const rf = WORK_INNER_R + b * WORK_RING_GAP;
    const count = Math.max(8, Math.round((TAU * rf) / WORK_STEP));
    const offset = hash(b * 7.13) * TAU;
    for (let i = 0; i < count; i++) {
      const ang = offset + (i / count) * TAU;
      dots.push({
        x: Math.cos(ang) * rf,
        y: Math.sin(ang) * rf,
        ang,
        rf,
        band: b,
        jit: 0,
      });
    }
  }
  return dots;
})();

/* -------------------------------------------------------------------------- */
/* Listening: a dotted sphere with a plane scanning up and down through it      */
/* -------------------------------------------------------------------------- */

/** Latitude rows from pole to pole. */
const LISTEN_ROWS = 12;
/** Dots around the widest (equator) row; thinner rows scale down from this. */
const LISTEN_EQ_DOTS = 16;
/** Poles are trimmed by this angle, so the top and bottom rows are short arcs
 *  rather than single points. */
const LISTEN_PHI0 = 0.15 * Math.PI;
/** Half-width of the scan plane in sphere-Y units: how far its glow reaches
 *  above and below the rows it sits on. */
const LISTEN_BAND_SIGMA = 0.14;

/**
 * The sphere, built once. Latitude rows of dots, each row a ring at a fixed
 * polar angle sampled around its longitude, tilted and projected to screen.
 * Sorted back to front so nearer dots paint over farther ones. paintListen
 * only scales the stored positions to the canvas.
 */
const LISTEN_SPHERE = (() => {
  const dots = [];
  for (let r = 0; r < LISTEN_ROWS; r++) {
    const f = r / (LISTEN_ROWS - 1);
    const phi = LISTEN_PHI0 + f * (Math.PI - 2 * LISTEN_PHI0);
    const y = Math.cos(phi);
    const ringR = Math.sin(phi);
    const count = Math.max(3, Math.round(LISTEN_EQ_DOTS * ringR));
    const offset = hash(r + 1) * TAU;
    for (let i = 0; i < count; i++) {
      const theta = offset + (i / count) * TAU;
      const x = ringR * Math.cos(theta);
      const z = ringR * Math.sin(theta);
      const zr = y * SIN_TILT + z * COS_TILT;
      const yr = y * COS_TILT - z * SIN_TILT;
      const near = 1 + zr * PERSPECTIVE * 0.5;
      dots.push({ sx: x * near, sy: yr * near, y, depth: (zr + 1) / 2 });
    }
  }
  dots.sort((a, b) => a.depth - b.depth);
  return dots;
})();

/* -------------------------------------------------------------------------- */
/* Solving: a fixed dot diamond with a bright band scanning through it          */
/* -------------------------------------------------------------------------- */

/** Rings out from the centre row: the diamond is 2*SOLVE_N + 1 rows tall and
 *  its widest row holds 2*SOLVE_N + 1 dots. */
const SOLVE_N = 5;
/** Column and row pitch, as a fraction of the diamond radius. The wider column
 *  pitch gives the slightly squashed diamond the reference has. */
const SOLVE_STEP_X = 0.17;
const SOLVE_STEP_Y = 0.155;
/** Half-height of the scan band, in row-fraction units (row centre is 0, the
 *  tips are +/-1). */
const SOLVE_BAND_SIGMA = 0.24;

/**
 * The diamond, built once. A taxicab lattice: row r carries 2*(SOLVE_N - |r|)
 * + 1 dots, so the count grows to the centre row and back down, giving the
 * diamond silhouette. Positions are normalised to the diamond radius;
 * paintSolve only scales them to the canvas.
 */
const SOLVE_DIAMOND = (() => {
  const dots = [];
  for (let r = -SOLVE_N; r <= SOLVE_N; r++) {
    const cols = SOLVE_N - Math.abs(r);
    for (let c = -cols; c <= cols; c++) {
      dots.push({
        x: c * SOLVE_STEP_X,
        y: r * SOLVE_STEP_Y,
        row: r / SOLVE_N,
        edge: cols === 0 ? 0 : Math.abs(c) / cols,
      });
    }
  }
  return dots;
})();

/* -------------------------------------------------------------------------- */
/* Idle: a dotted wireframe sphere breathing slowly                            */
/* -------------------------------------------------------------------------- */

/** Meridian lines across the front of the sphere. The middle one runs straight
 *  down the centre; the rest bow out towards the silhouette. */
const IDLE_MERIDIANS = 7;
/** Dots sampled along each meridian, pole to pole. */
const IDLE_LAT = 15;
/** Latitude rings, as a fraction of PI: a near-top arc, the equator, a
 *  near-bottom arc. They read as the horizontal curves of the wireframe. */
const IDLE_RING_PHI = [0.25, 0.5, 0.75];
/** Dots around each latitude ring. */
const IDLE_RING_DOTS = 20;

/**
 * The wireframe sphere, built once. Meridian lines plus a few latitude rings,
 * all on the unit sphere. paintIdle turns this by a few degrees, tilts and
 * projects it every frame, so nothing here is screen space yet.
 */
const IDLE_SPHERE = (() => {
  const dots = [];
  for (let m = 0; m < IDLE_MERIDIANS; m++) {
    const lon = 0.08 * Math.PI + (m / (IDLE_MERIDIANS - 1)) * 0.84 * Math.PI;
    for (let s = 0; s < IDLE_LAT; s++) {
      const phi = (0.05 + (s / (IDLE_LAT - 1)) * 0.9) * Math.PI;
      const sinPhi = Math.sin(phi);
      dots.push({
        x: sinPhi * Math.cos(lon),
        y: Math.cos(phi),
        z: sinPhi * Math.sin(lon),
        lon,
        ring: false,
      });
    }
  }
  for (const pf of IDLE_RING_PHI) {
    const phi = pf * Math.PI;
    const sinPhi = Math.sin(phi);
    const yv = Math.cos(phi);
    for (let i = 0; i < IDLE_RING_DOTS; i++) {
      const theta = (i / IDLE_RING_DOTS) * TAU;
      dots.push({
        x: sinPhi * Math.cos(theta),
        y: yv,
        z: sinPhi * Math.sin(theta),
        lon: theta,
        ring: true,
      });
    }
  }
  return dots;
})();

/** Persistent projection scratch, sorted back to front each frame so nearer
 *  dots paint over farther ones without allocating per frame. */
const IDLE_PROJ = IDLE_SPHERE.map((_, idx) => ({ idx, xr: 0, yr: 0, zr: 0 }));

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
  // solving: drawn by paintSolve as a dot diamond, not the particle path. Kept
  // for the record type.
  dots: {
    radius: 0.92,
    dot: 0.05,
    spin: 0.62,
    globalRadius: () => 1,
    particleRadius: () => 1,
    glow: () => 1,
  },
  // working: drawn by paintWork as a dotted disc, not the particle path. Kept
  // for the record type.
  spark: {
    radius: 0.9,
    dot: 0.048,
    spin: 1.5,
    globalRadius: () => 1,
    particleRadius: () => 1,
    glow: () => 1,
  },
  // listening: drawn by paintListen as a dotted sphere of latitude rows, not
  // the particle path. Kept for the record type.
  cluster: {
    radius: 0.64,
    dot: 0.058,
    spin: 0.42,
    globalRadius: () => 1,
    particleRadius: () => 1,
    glow: () => 1,
  },
  // idle: drawn by paintIdle as a dotted wireframe sphere, not the particle
  // path. Kept for the record type.
  pulse: {
    radius: 0.82,
    dot: 0.062,
    spin: 0.26,
    globalRadius: () => 1,
    particleRadius: () => 1,
    glow: () => 1,
  },
};

/* -------------------------------------------------------------------------- */
/* Canvas                                                                      */
/* -------------------------------------------------------------------------- */

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
 * `spark` (working): a disc built entirely from dots. A square lattice clipped
 * to a circle forms the inner field, which never moves and stays faint. Around
 * it sit WORK_BAND_RINGS rings that carry a bright section travelling round the
 * rim like a comet. Each rim dot's brightness, scale and glow come from its
 * angular distance to a moving head angle, with a quick rise on the leading
 * side and a long fade on the trailing side, so the bright core sits just
 * behind the leading edge. The head's rate is uneven (a sine term speeds it up
 * and eases it off around the circle) and each ring lags the one outside it, so
 * the band reads as a curved surface passing round the edge rather than a flat
 * arc. At `t` near 0 the section sits at the 3 o'clock point, which is the
 * frame shown when the animation is paused or reduced.
 */
function paintWork(ctx, state, t) {
  const { w, h, dpr, color } = state;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const unit = Math.min(w, h) / 2;
  const workR = unit * 0.92;
  const baseDot = Math.max(0.4 * dpr, unit * WORK_STEP * 0.3);

  // Head angle of the travelling section. The sine term makes it accelerate and
  // decelerate around the circle instead of sweeping at a constant rate; it
  // never stops or reverses.
  const head = t * 1.6 + 0.45 * Math.sin(t * 1.6);

  for (let i = 0; i < WORK_DISC.length; i++) {
    const dot = WORK_DISC[i];

    if (dot.band === 0) {
      // Inner grid: near-static, faint, lightly textured by its jitter.
      const alpha = 0.1 + dot.jit * 0.1;
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(cx + dot.x * workR, cy + dot.y * workR, baseDot, 0, TAU);
      ctx.fill();
      continue;
    }

    // Rim rings. Inner rings lag the outer ones and breathe a little out of
    // step, so the three together look like a band with depth.
    const lag = (WORK_BAND_RINGS - dot.band) * 0.14;
    const rf = dot.rf * (1 + 0.015 * Math.sin(t * 1.3 + dot.band));

    let rel = (dot.ang - head + lag) % TAU;
    if (rel < -Math.PI) rel += TAU;
    else if (rel > Math.PI) rel -= TAU;

    // Asymmetric Gaussian: narrow ahead of the head, wide behind it.
    const sigma = rel > 0 ? 0.36 : 0.7;
    const ringGain = 0.72 + (0.28 * dot.band) / WORK_BAND_RINGS;
    const g = Math.exp(-(rel * rel) / (2 * sigma * sigma)) * ringGain;

    const alpha = Math.min(1, 0.09 + g * 0.7);
    const radius = baseDot * (0.85 + g * 1.0);
    const px = cx + Math.cos(dot.ang) * rf * workR;
    const py = cy + Math.sin(dot.ang) * rf * workR;

    if (g > 0.62) {
      ctx.shadowBlur = 3 * dpr * g;
      ctx.shadowColor = `rgba(${color},${(0.22 * g).toFixed(3)})`;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, TAU);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

/**
 * `cluster` (listening): a sphere of dots in latitude rows that never moves. A
 * horizontal plane scans up and down through it; a dot's brightness, scale and
 * glow come from how close its row sits to that plane, with a Gaussian falloff,
 * so one row lights fully while its neighbours read medium and the rest stay
 * dim. Front dots are brighter and larger than back dots, so the rows keep
 * their roundness. The plane's height is a sine sweep, so the motion eases on
 * its own: quickest through the middle, slowing to a stop at each pole before
 * it reverses, a seamless up-down loop. At `t` near 0 the plane sits at the
 * equator, which is the frame shown when the animation is paused or reduced.
 */
function paintListen(ctx, state, t) {
  const { w, h, dpr, color } = state;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const unit = Math.min(w, h) / 2;
  const sphereR = unit * 0.78;
  const baseDot = Math.max(0.4 * dpr, unit * 0.055);
  const twoSigmaSq = 2 * LISTEN_BAND_SIGMA * LISTEN_BAND_SIGMA;

  // Scan-plane height in sphere-Y. The sine sweep never quite reaches the poles
  // and eases to a halt at each turn before reversing.
  const band = 0.85 * Math.sin(t * 1.15);

  for (let i = 0; i < LISTEN_SPHERE.length; i++) {
    const dot = LISTEN_SPHERE[i];

    const dy = dot.y - band;
    const g = Math.exp(-(dy * dy) / twoSigmaSq);
    const front = 0.5 + 0.5 * dot.depth;

    const alpha = Math.min(1, 0.06 + 0.1 * dot.depth + g * 0.64 * front);
    const radius = baseDot * (0.7 + 0.3 * dot.depth + g * 1.05);
    const px = cx + dot.sx * sphereR;
    const py = cy + dot.sy * sphereR;

    if (g > 0.62) {
      ctx.shadowBlur = 3.5 * dpr * g * front;
      ctx.shadowColor = `rgba(${color},${(0.26 * g).toFixed(3)})`;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, TAU);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

/**
 * `dots` (solving): a fixed diamond of dots that never moves. A horizontal
 * band of light scans down it and back up; a dot's brightness, radius and glow
 * follow a Gaussian on the distance from its row to the band centre, so the
 * edge between lit and unlit rows is soft and the brightest dots sit on the
 * band's spine. Dots near the vertical spine read a little stronger than dots
 * out at the tips, which gives the band a shallow sense of depth. The band's
 * position is a sine sweep, so it runs quickest through the centre and eases
 * to a stop at each tip before reversing, a seamless top-bottom loop. At `t`
 * near 0 the band sits on the centre row, which is the frame shown when the
 * animation is paused or reduced.
 */
function paintSolve(ctx, state, t) {
  const { w, h, dpr, color } = state;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const unit = Math.min(w, h) / 2;
  const scale = unit * 0.8;
  const baseDot = Math.max(0.4 * dpr, unit * 0.045);
  const twoSigmaSq = 2 * SOLVE_BAND_SIGMA * SOLVE_BAND_SIGMA;

  // Band position in row-fraction units, -1 (top) .. 1 (bottom). A plain sine
  // sweep gives the acceleration for free: fastest across the centre, easing
  // to a halt at each tip before it reverses.
  const band = Math.sin(t * 2.6);

  for (let i = 0; i < SOLVE_DIAMOND.length; i++) {
    const dot = SOLVE_DIAMOND[i];

    const dy = dot.row - band;
    const g = Math.exp(-(dy * dy) / twoSigmaSq);
    const spine = 1 - 0.28 * dot.edge;

    const alpha = Math.min(1, 0.1 + g * 0.66 * spine);
    const radius = baseDot * (0.8 + g * 0.95 * spine);
    const px = cx + dot.x * scale;
    const py = cy + dot.y * scale;

    if (g > 0.62) {
      ctx.shadowBlur = 2.5 * dpr * g;
      ctx.shadowColor = `rgba(${color},${(0.2 * g).toFixed(3)})`;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, TAU);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

/**
 * `pulse` (idle): a dotted wireframe sphere, meridian lines plus a few
 * latitude rings, that holds its shape. One slow breath (about four seconds)
 * eases its radius and overall brightness up and down together, and the dot
 * nearest the centre carries an extra soft pulse and a faint glow. A second,
 * much slower sine drifts the yaw a few degrees each way, so the meridians
 * trade prominence left to right without the sphere ever turning. A meridian
 * seen edge-on reads dimmer than the one facing the viewer, which keeps the
 * centre column bright and the silhouette faint. At `t` near 0 the sphere sits
 * still with a softly lit centre, the frame shown when the animation is paused
 * or reduced.
 */
function paintIdle(ctx, state, t) {
  const { w, h, dpr, color } = state;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const unit = Math.min(w, h) / 2;
  const radius0 = unit * 0.78;
  const baseDot = Math.max(0.4 * dpr, unit * 0.044);

  const breathe = Math.sin(t * 1.5);
  const globalR = 1 + 0.045 * breathe;
  const glow = 0.86 + 0.14 * breathe;
  const centreBoost = 0.2 * (0.5 + 0.5 * breathe);
  const yaw = 0.17 * Math.sin(t * 0.5);
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);

  for (let i = 0; i < IDLE_SPHERE.length; i++) {
    const d = IDLE_SPHERE[i];
    const x = d.x * globalR;
    const y = d.y * globalR;
    const z = d.z * globalR;
    const xr = x * cosYaw + z * sinYaw;
    const zc = z * cosYaw - x * sinYaw;
    const p = IDLE_PROJ[i];
    p.xr = xr;
    p.yr = y * COS_TILT - zc * SIN_TILT;
    p.zr = y * SIN_TILT + zc * COS_TILT;
  }
  IDLE_PROJ.sort((a, b) => a.zr - b.zr);

  for (let i = 0; i < IDLE_PROJ.length; i++) {
    const p = IDLE_PROJ[i];
    const d = IDLE_SPHERE[p.idx];
    const depth = (p.zr + 1) / 2;
    const near = 1 + p.zr * PERSPECTIVE * 0.5;
    const sx = p.xr * near;
    const sy = p.yr * near;
    const px = cx + sx * radius0;
    const py = cy + sy * radius0;

    const edge = d.ring ? 0.3 : Math.abs(Math.cos(d.lon + yaw));
    const facing = 1 - 0.62 * edge;
    const centreness = Math.exp(-(sx * sx + sy * sy) / 0.1);

    const baseA = d.ring ? 0.1 : 0.14;
    const alpha = Math.min(
      1,
      (baseA + depth * 0.5) * facing * glow + centreness * (0.32 + centreBoost),
    );
    const dotRadius =
      baseDot * (0.68 + depth * 0.55 + centreness * (0.8 + centreBoost * 2));

    if (centreness > 0.45) {
      ctx.shadowBlur = 5 * dpr * centreness * (0.6 + centreBoost);
      ctx.shadowColor = `rgba(${color},${(0.4 * centreness).toFixed(3)})`;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(px, py, dotRadius, 0, TAU);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function paint(ctx, state, field, kind, t) {
  if (kind === "wave") {
    paintWave(ctx, state, t);
    return;
  }
  if (kind === "pulse") {
    paintIdle(ctx, state, t);
    return;
  }
  if (kind === "dots") {
    paintSolve(ctx, state, t);
    return;
  }
  if (kind === "spark") {
    paintWork(ctx, state, t);
    return;
  }
  if (kind === "cluster") {
    paintListen(ctx, state, t);
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
