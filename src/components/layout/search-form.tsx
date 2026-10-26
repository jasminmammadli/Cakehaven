import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

/** GET form to /cakes?q=…, so search works without JavaScript. */
export function SearchForm({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  return (
    <form action="/cakes" role="search" className={cn("relative", className)}>
      <label htmlFor="site-search" className="sr-only">
        Search cakes
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-black-500/60"
      />
      <input
        id="site-search"
        name="q"
        type="search"
        placeholder="Search"
        maxLength={60}
        autoFocus={autoFocus}
        className="h-10 w-full rounded-[5px] bg-search pr-3.5 pl-8 text-[17px] leading-[22px] tracking-[-0.408px] text-black-500 outline-none placeholder:text-[rgb(10_10_15/0.6)] focus-visible:ring-3 focus-visible:ring-ring/60"
      />
    </form>
  );
}
