import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Link } from "react-router";
import { TIERS, type Difficulty } from "../lib/engine/difficulty";

const base =
  "inline-flex items-center justify-center gap-2 rounded-button px-5 py-3.5 text-[17px] font-semibold transition active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-50";
const variants = {
  blue: "bg-blue text-white hover:brightness-110",
  violet: "bg-violet text-white hover:brightness-110",
  danger: "bg-wrong text-white hover:brightness-110",
  ghost: "bg-fg/8 text-fg hover:bg-fg/12",
  pill: "rounded-full bg-white/92 text-black/80 hover:bg-white py-3 text-[15px] font-bold",
};

type Variant = keyof typeof variants;

export function Button({ variant = "blue", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({ to, variant = "blue", className = "", style, children }: { to: string; variant?: Variant; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <Link to={to} style={style} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-card border border-surface-line bg-surface backdrop-blur ${className}`}>{children}</div>;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className = "",
}: {
  value: T;
  options: { id: T; name: string }[];
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`grid grid-flow-col auto-cols-fr gap-0.5 rounded-[9px] bg-fg/8 p-0.5 ${className}`}>
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-[7px] px-3 py-1.5 text-[13px] font-semibold transition ${
            value === o.id ? "bg-white text-black shadow-sm dark:bg-[#636366] dark:text-white" : "text-fg-2 hover:text-fg"
          }`}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

/** Small tier badge, so the difficulty is never ambiguous mid-quiz. */
export function DifficultyChip({ difficulty }: { difficulty: Difficulty }) {
  const tier = TIERS[difficulty];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ color: tier.accent, background: `color-mix(in srgb, ${tier.accent} 15%, transparent)` }}
    >
      <span aria-hidden="true" className="text-[9px]">{tier.icon}</span>
      {tier.title}
    </span>
  );
}

export function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-3" role="img" aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className="size-10 animate-star" style={{ animationDelay: `${n * 200}ms` }}>
          <path
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
            className={n <= count ? "fill-gold" : "fill-none stroke-fg-3"}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}
