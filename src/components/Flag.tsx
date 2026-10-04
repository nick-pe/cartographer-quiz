export function Flag({ code, className = "" }: { code: string; className?: string }) {
  return (
    <img
      src={`./flags/${code.toLowerCase()}.svg`}
      alt="A national flag"
      draggable={false}
      className={`aspect-[4/3] rounded-lg object-cover shadow-lg ring-1 ring-black/10 dark:ring-white/10 ${className}`}
    />
  );
}
