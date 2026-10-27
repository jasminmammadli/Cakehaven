import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * CakeHaven wordmark: "Cake" in the hero serif with "Haven" tucked in as the
 * hero script, echoing the Bodoni/WindSong pairing of the home headline.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="CakeHaven home"
      className={cn(
        "group relative inline-flex items-baseline rounded-md leading-none whitespace-nowrap outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/60",
        className,
      )}
    >
      <span aria-hidden className="font-display text-[26px] tracking-[-0.02em] text-lilac-950 italic md:text-[30px]">
        Cake
      </span>
      <span
        aria-hidden
        className="-ml-0.5 font-script text-[22px] text-lilac-800 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:-rotate-3 md:text-[26px]"
      >
        Haven
      </span>
      <span
        aria-hidden
        className="absolute top-0.5 left-[27px] md:left-[32px] size-1.5 rounded-full bg-lilac-700 transition-transform duration-300 group-hover:scale-125 md:size-[7px]"
      />
    </Link>
  );
}
