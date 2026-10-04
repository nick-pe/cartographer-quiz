import { asset } from "../lib/site";

/** The app icon. */
export function Logo({ className = "size-9" }: { className?: string }) {
  return <img src={asset("icon-192.png")} alt="" className={`rounded-[22%] ${className}`} />;
}
