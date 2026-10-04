// Small hand-rolled SVG charts for Trends: one series each, thin marks,
// recessive grid, a hover tooltip, and a table view for screen readers.
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { DailyPoint } from "../lib/engine/stats";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(560);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

const shortDate = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const PAD = { top: 10, right: 12, bottom: 22, left: 32 };

function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-lg border border-surface-line bg-[var(--bg-bottom)] px-2.5 py-1.5 text-xs shadow-lg whitespace-nowrap"
      style={{ left: Math.min(Math.max(x, 50), width - 50), top: y - 8, transform: "translate(-50%, -100%)" }}
    >
      {children}
    </div>
  );
}

function AxisDates({ points, x, y }: { points: DailyPoint[]; x: (i: number) => number; y: number }) {
  return (
    <>
      <text x={x(0)} y={y} className="fill-fg-3 text-[10px]" textAnchor="start">{shortDate(points[0].day)}</text>
      <text x={x(points.length - 1)} y={y} className="fill-fg-3 text-[10px]" textAnchor="end">Today</text>
    </>
  );
}

/** Average accuracy on active days: line + light area, with a crosshair tooltip. */
export function AccuracyChart({ points, color }: { points: DailyPoint[]; color: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 160;
  const active = points.map((p, i) => ({ ...p, i })).filter((p) => p.quizzes > 0);
  const x = (i: number) => PAD.left + (i / Math.max(1, points.length - 1)) * (width - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - v / 100) * (height - PAD.top - PAD.bottom);
  const line = active.map((p, k) => `${k ? "L" : "M"}${x(p.i)} ${y(p.accuracy)}`).join(" ");
  const area = `${line} L${x(active.at(-1)!.i)} ${y(0)} L${x(active[0].i)} ${y(0)} Z`;
  const h = hover === null ? null : active[hover];

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Average accuracy per active day"
        onPointerMove={(e) => {
          const px = e.clientX - e.currentTarget.getBoundingClientRect().left;
          let best = 0;
          active.forEach((p, k) => Math.abs(x(p.i) - px) < Math.abs(x(active[best].i) - px) && (best = k));
          setHover(best);
        }}
        onPointerLeave={() => setHover(null)}
      >
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} className="stroke-surface-line" />
            <text x={PAD.left - 6} y={y(v) + 3} textAnchor="end" className="fill-fg-3 text-[10px] tabular-nums">{v}%</text>
          </g>
        ))}
        <path d={area} fill={color} opacity={0.12} />
        <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {h && <line x1={x(h.i)} x2={x(h.i)} y1={PAD.top} y2={y(0)} className="stroke-fg-3" strokeWidth={1} />}
        {active.map((p, k) => (
          <circle key={p.day} cx={x(p.i)} cy={y(p.accuracy)} r={hover === k ? 5 : 4} fill={color} stroke="var(--bg-top)" strokeWidth={2} />
        ))}
        <AxisDates points={points} x={x} y={height - 6} />
      </svg>
      {h && (
        <Tooltip x={x(h.i)} y={y(h.accuracy)} width={width}>
          <div className="text-fg-3">{shortDate(h.day)}</div>
          <div className="font-semibold">{Math.round(h.accuracy)}% · {h.quizzes} {h.quizzes === 1 ? "quiz" : "quizzes"}</div>
        </Tooltip>
      )}
    </div>
  );
}

/** Quizzes per day as columns, every day in the range. */
export function VolumeChart({ points, color }: { points: DailyPoint[]; color: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 140;
  const max = Math.max(1, ...points.map((p) => p.quizzes));
  const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, i) => i) : [0, Math.round(max / 2), max];
  const plotW = width - PAD.left - PAD.right;
  const slot = plotW / points.length;
  const barW = Math.max(1, Math.min(24, slot - 2));
  const x = (i: number) => PAD.left + slot * i + slot / 2;
  const y = (v: number) => PAD.top + (1 - v / max) * (height - PAD.top - PAD.bottom);
  const h = hover === null ? null : points[hover];

  return (
    <div ref={ref} className="relative">
      <svg width={width} height={height} role="img" aria-label="Quizzes played per day" onPointerLeave={() => setHover(null)}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} className="stroke-surface-line" />
            <text x={PAD.left - 6} y={y(v) + 3} textAnchor="end" className="fill-fg-3 text-[10px] tabular-nums">{v}</text>
          </g>
        ))}
        {points.map((p, i) => {
          const top = y(p.quizzes);
          const bh = y(0) - top;
          const r = Math.min(4, barW / 2, bh);
          return (
            <g key={p.day} onPointerEnter={() => setHover(i)}>
              {/* Hit target: the whole column slot, bigger than the mark. */}
              <rect x={x(i) - slot / 2} y={PAD.top} width={slot} height={y(0) - PAD.top} fill="transparent" />
              {p.quizzes > 0 && (
                <path
                  d={`M${x(i) - barW / 2} ${y(0)} V${top + r} Q${x(i) - barW / 2} ${top} ${x(i) - barW / 2 + r} ${top} H${x(i) + barW / 2 - r} Q${x(i) + barW / 2} ${top} ${x(i) + barW / 2} ${top + r} V${y(0)} Z`}
                  fill={color}
                  opacity={hover === null || hover === i ? 1 : 0.55}
                />
              )}
            </g>
          );
        })}
        <AxisDates points={points} x={x} y={height - 6} />
      </svg>
      {h && (
        <Tooltip x={x(hover!)} y={y(h.quizzes)} width={width}>
          <div className="text-fg-3">{shortDate(h.day)}</div>
          <div className="font-semibold">{h.quizzes} {h.quizzes === 1 ? "quiz" : "quizzes"}</div>
        </Tooltip>
      )}
    </div>
  );
}

/** The same series as a table, for screen readers and anyone who prefers numbers. */
export function SeriesTable({ points }: { points: DailyPoint[] }) {
  const active = points.filter((p) => p.quizzes > 0);
  return (
    <details className="text-xs text-fg-2">
      <summary className="cursor-pointer select-none font-semibold text-fg-3 hover:text-fg-2">Show as table</summary>
      <table className="mt-2 w-full tabular-nums">
        <thead className="text-left text-fg-3">
          <tr><th className="py-1 font-semibold">Day</th><th className="font-semibold">Quizzes</th><th className="font-semibold">Accuracy</th></tr>
        </thead>
        <tbody>
          {active.map((p) => (
            <tr key={p.day} className="border-t border-surface-line">
              <td className="py-1">{shortDate(p.day)}</td><td>{p.quizzes}</td><td>{Math.round(p.accuracy)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
