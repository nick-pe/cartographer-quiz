export function Logo({ className = "size-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" rx="22" fill="#5B4BC4" />
      <path d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42 Z" fill="#FFB829" />
      <circle cx="50" cy="50" r="6" fill="#12172a" />
    </svg>
  );
}
