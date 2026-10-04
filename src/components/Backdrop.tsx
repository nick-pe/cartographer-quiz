// Port of Views/GeoBackdrop.swift: a flat vector landscape behind a quiz.
// Deliberately low contrast and confined to the bottom of the screen, where
// the question text isn't. One parametric scene; styles are data.
import type { BackdropId } from "../data/types";

type Rgb = [number, number, number];
interface Style {
  terrain: "peaks" | "dunes" | "skyline" | "swells";
  vegetation: "none" | "palms" | "conifers";
  far: Rgb;
  near: Rgb;
  water: Rgb | null;
  sky: Rgb | null;
  terrainHeight: number;
}

const STYLES: Record<BackdropId, Style> = {
  alpine: { terrain: "peaks", vegetation: "conifers", far: [0.26, 0.34, 0.56], near: [0.14, 0.2, 0.38], water: [0.1, 0.24, 0.42], sky: [0.42, 0.52, 0.78], terrainHeight: 0.34 },
  tropical: { terrain: "swells", vegetation: "palms", far: [0.14, 0.42, 0.44], near: [0.1, 0.28, 0.34], water: [0.1, 0.4, 0.52], sky: [0.3, 0.62, 0.66], terrainHeight: 0.2 },
  desert: { terrain: "dunes", vegetation: "palms", far: [0.46, 0.34, 0.24], near: [0.3, 0.21, 0.16], water: null, sky: [0.62, 0.44, 0.28], terrainHeight: 0.26 },
  ocean: { terrain: "swells", vegetation: "none", far: [0.12, 0.32, 0.52], near: [0.08, 0.22, 0.4], water: [0.09, 0.28, 0.48], sky: [0.26, 0.48, 0.7], terrainHeight: 0.16 },
  arctic: { terrain: "peaks", vegetation: "conifers", far: [0.34, 0.44, 0.58], near: [0.18, 0.26, 0.4], water: [0.12, 0.24, 0.38], sky: [0.4, 0.58, 0.72], terrainHeight: 0.28 },
  city: { terrain: "skyline", vegetation: "none", far: [0.22, 0.28, 0.48], near: [0.12, 0.16, 0.32], water: [0.1, 0.2, 0.36], sky: [0.36, 0.42, 0.68], terrainHeight: 0.26 },
  temperate: { terrain: "dunes", vegetation: "conifers", far: [0.2, 0.34, 0.36], near: [0.12, 0.22, 0.28], water: [0.1, 0.24, 0.34], sky: [0.32, 0.5, 0.52], terrainHeight: 0.24 },
  river: { terrain: "peaks", vegetation: "conifers", far: [0.18, 0.36, 0.42], near: [0.11, 0.24, 0.3], water: [0.1, 0.34, 0.46], sky: [0.3, 0.54, 0.58], terrainHeight: 0.3 },
};

const rgb = ([r, g, b]: Rgb, a = 1) => `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)} / ${a})`;

// Drawn in a 1000 × 1000 box stretched to the viewport (preserveAspectRatio="none").
const W = 1000;
const H = 1000;

function ridge(peaks: number[], top: number, height: number) {
  const step = W / (peaks.length - 1);
  const bottom = top + height;
  return `M0 ${bottom} ` + peaks.map((p, i) => `L${i * step} ${bottom - p * height}`).join(" ") + ` L${W} ${bottom} Z`;
}

function dunes(crests: number[], top: number, height: number) {
  const step = W / (crests.length - 1);
  const bottom = top + height;
  const y = (i: number) => bottom - crests[i] * height;
  let d = `M0 ${bottom} L0 ${y(0)}`;
  for (let i = 1; i < crests.length; i++) {
    d += ` C${(i - 1) * step + step / 2} ${y(i - 1)} ${i * step - step / 2} ${y(i)} ${i * step} ${y(i)}`;
  }
  return d + ` L${W} ${bottom} Z`;
}

function skyline(seed: number, blocks: number, top: number, height: number) {
  // A tiny LCG, so the skyline is the same on every render.
  let s = seed;
  const rand = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const bw = W / blocks;
  const bottom = top + height;
  let d = `M0 ${bottom}`;
  for (let i = 0; i < blocks; i++) {
    const h = (0.32 + rand() * 0.68) * height;
    const x = i * bw;
    d += ` L${x} ${bottom - h} L${x + bw * 0.86} ${bottom - h} L${x + bw * 0.86} ${bottom} L${x + bw} ${bottom}`;
  }
  return d + ` L${W} ${bottom} Z`;
}

function band(style: Style, far: boolean) {
  const height = H * style.terrainHeight * (far ? 1 : 0.75);
  const top = H - height - (far ? H * 0.055 : 0);
  switch (style.terrain) {
    case "peaks":
      return ridge(far ? [0.1, 0.72, 0.34, 0.94, 0.46, 0.8, 0.28] : [0.3, 0.58, 0.22, 0.7, 0.36, 0.52, 0.24], top, height);
    case "dunes":
      return dunes(far ? [0.55, 0.85, 0.45, 0.75] : [0.4, 0.62, 0.34, 0.58], top, height);
    case "skyline":
      return skyline(far ? 3 : 7, far ? 11 : 8, top, height);
    case "swells":
      return dunes(far ? [0.7, 0.5, 0.8, 0.55] : [0.45, 0.65, 0.4, 0.6], top, height);
  }
}

function Conifer({ x, w, h, fill }: { x: number; w: number; h: number; fill: string }) {
  const bottom = H - H * 0.085;
  const top = bottom - h;
  const mid = x + w / 2;
  const trunk = w * 0.14;
  const tiers = [0, 1, 2].map((t) => {
    const ty = top + h * (0.04 + t * 0.24);
    const by = top + h * (0.4 + t * 0.24);
    const half = w * (0.22 + t * 0.14);
    return `M${mid} ${ty} L${mid + half} ${by} L${mid - half} ${by} Z`;
  });
  return <path d={`M${mid - trunk / 2} ${bottom - h * 0.18} h${trunk} v${h * 0.18} h${-trunk} Z ${tiers.join(" ")}`} fill={fill} />;
}

function Palm({ x, w, h, fill }: { x: number; w: number; h: number; fill: string }) {
  const bottom = H - H * 0.085;
  const top = bottom - h;
  const base = x + w / 2;
  const cx = base + w * 0.08;
  const cy = top + h * 0.34;
  const fronds = [[-0.5, 0.02], [-0.36, -0.2], [0.36, -0.2], [0.5, 0.02], [0, -0.3]]
    .map(([dx, dy]) => {
      const tx = cx + w * dx;
      const ty = cy + h * dy;
      return `M${cx} ${cy} Q${cx + w * dx * 0.45} ${cy + h * (dy - 0.2)} ${tx} ${ty} Q${cx + w * dx * 0.55} ${cy + h * (dy + 0.06)} ${cx} ${cy} Z`;
    })
    .join(" ");
  const trunk =
    `M${base - w * 0.06} ${bottom} Q${base + w * 0.18} ${top + h / 2} ${cx + w * 0.03} ${cy} ` +
    `L${cx - w * 0.05} ${cy} Q${base + w * 0.08} ${top + h / 2} ${base + w * 0.04} ${bottom} Z`;
  return <path d={`${trunk} ${fronds}`} fill={fill} />;
}

export function Backdrop({ id }: { id: BackdropId }) {
  const style = STYLES[id];
  const waterH = H * 0.11;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ opacity: "var(--scene-opacity)" }}>
      {style.sky && (
        <div
          className="absolute aspect-square w-[90vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: "76%", top: "16%", background: `radial-gradient(circle, ${rgb(style.sky, 0.16)}, transparent 70%)` }}
        />
      )}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full">
        <path d={band(style, true)} fill={rgb(style.far, 0.38)} />
        <path d={band(style, false)} fill={rgb(style.near, 0.62)} />
        {style.water && (
          <>
            <defs>
              <linearGradient id={`water-${id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={rgb(style.water, 0.55)} />
                <stop offset="1" stopColor={rgb(style.water, 0.85)} />
              </linearGradient>
            </defs>
            <rect x="0" y={H - waterH} width={W} height={waterH} fill={`url(#water-${id})`} />
            {[0, 1, 2].map((i) => {
              const y = H - 16 - i * 24 - 6;
              const pts = Array.from({ length: 251 }, (_, k) => `${k * 4} ${y + Math.sin((k * 4) / 46 + i * 1.4) * 5}`);
              return <path key={i} d={`M${pts.join(" L")}`} fill="none" stroke="rgb(255 255 255 / .08)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />;
            })}
          </>
        )}
        {style.vegetation === "conifers" && (
          <>
            <Conifer x={60} w={90} h={110} fill={rgb(style.near, 0.85)} />
            <Conifer x={185} w={120} h={150} fill={rgb(style.near, 0.95)} />
            <Conifer x={340} w={80} h={100} fill={rgb(style.near, 0.8)} />
          </>
        )}
        {style.vegetation === "palms" && (
          <>
            <Palm x={550} w={200} h={170} fill={rgb(style.near, 0.9)} />
            <Palm x={810} w={140} h={120} fill={rgb(style.near, 0.7)} />
          </>
        )}
      </svg>
    </div>
  );
}
