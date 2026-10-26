"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { Category } from "../types";

/**
 * Figma category tabs (node 36:777…): two-line 20px labels, active tab bold
 * with a 62px underline, plus a 54px chevron circle that scrolls the strip.
 */
export function CategoryTabs({
  categories,
  activeSlug,
}: {
  categories: Pick<Category, "slug" | "name">[];
  activeSlug?: string;
}) {
  const stripRef = useRef<HTMLUListElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const update = () => setCanScroll(strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 4);
    update();
    strip.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(strip);
    return () => {
      strip.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    stripRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeSlug]);

  const tabs = [{ slug: undefined, name: "All" }, ...categories];

  return (
    <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-7">
      <nav aria-label="Cake categories" className="min-w-0 flex-1">
        <ul ref={stripRef} className="scrollbar-none flex gap-8 overflow-x-auto md:gap-[76px]">
          {tabs.map((tab) => {
            const active = tab.slug === activeSlug;
            return (
              <li key={tab.slug ?? "all"} className="shrink-0">
                <Link
                  href={tab.slug ? `/cakes?category=${tab.slug}` : "/cakes"}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex flex-col items-center rounded-md pb-2 text-center text-h3 outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
                    active ? "font-extrabold text-black-500" : "text-grey-800 hover:text-black-500",
                  )}
                >
                  <span>{tab.name}</span>
                  <span>Cakes</span>
                  {active && <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-black-500" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        aria-label="Show more categories"
        disabled={!canScroll}
        onClick={() => stripRef.current?.scrollBy({ left: 240, behavior: "smooth" })}
        className="hidden size-[54px] shrink-0 cursor-pointer place-items-center rounded-full border border-black-500 text-black-500 outline-none transition-colors hover:bg-lilac-100 focus-visible:ring-3 focus-visible:ring-ring/60 disabled:cursor-default disabled:opacity-40 md:grid"
      >
        <ChevronRight aria-hidden className="size-6" strokeWidth={1.5} />
      </button>
    </div>
  );
}
