import Link from "next/link";
import { CakeSlice } from "lucide-react";

import { cn } from "@/lib/utils";

/** CakeHaven wordmark, sized to the 112x27 logo slot in the Figma header. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="CakeHaven home"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md text-[22px] leading-none font-extrabold tracking-tight text-lilac-950 outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
        className,
      )}
    >
      <CakeSlice aria-hidden className="size-7 text-lilac-800" strokeWidth={1.75} />
      CakeHaven
    </Link>
  );
}
