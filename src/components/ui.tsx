import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold transition active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-brand disabled:opacity-50";
const variants = {
  primary: "bg-violet-brand text-white shadow-lg shadow-violet-brand/25 hover:bg-[#6a5ad3]",
  gold: "bg-gold text-ink shadow-lg shadow-gold/25 hover:bg-[#ffc54f]",
  danger: "bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500",
  ghost: "bg-black/5 text-ink hover:bg-black/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12",
};

type Variant = keyof typeof variants;

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({ to, variant = "primary", className = "", children }: { to: string; variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <Link to={to} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-black/[.06] bg-white/80 shadow-sm backdrop-blur dark:border-night-line dark:bg-night-2/80 ${className}`}>
      {children}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { id: T; name: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-flow-col gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/6">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            value === o.id ? "bg-white text-ink shadow-sm dark:bg-violet-brand dark:text-white" : "text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}
