"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Section with the Figma "arrow" pair (two 54px circles, 40px apart) that
 * scrolls a horizontal snap row. Arrows disable themselves at either end and
 * are hidden on mobile, where the design uses swipe-only scrollers.
 */
export function Carousel({
  title,
  id,
  children,
  className,
  trackClassName,
  headingLevel = 2,
}: {
  title: string;
  id?: string;
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  headingLevel?: 2 | 3;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const headingId = id ? `${id}-title` : undefined;

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    update();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  function scroll(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  }

  return (
    <section id={id} aria-labelledby={headingId} className={cn("scroll-mt-24", className)}>
      <div className="mb-8 flex items-center justify-between gap-4 md:mb-[15px]">
        <Heading id={headingId} className="text-h2 font-extrabold md:text-h1">
          {title}
        </Heading>
        <div className="hidden gap-10 md:flex">
          <Button
            variant="circle"
            size="icon"
            aria-label={`Previous ${title}`}
            aria-controls={id ? `${id}-track` : undefined}
            disabled={!canPrev}
            onClick={() => scroll(-1)}
          >
            <ChevronLeft strokeWidth={1.5} />
          </Button>
          <Button
            variant="circle"
            size="icon"
            aria-label={`Next ${title}`}
            aria-controls={id ? `${id}-track` : undefined}
            disabled={!canNext}
            onClick={() => scroll(1)}
          >
            <ChevronRight strokeWidth={1.5} />
          </Button>
        </div>
      </div>
      <div
        ref={trackRef}
        id={id ? `${id}-track` : undefined}
        className={cn(
          "scrollbar-none -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 md:mx-0 md:scroll-px-0 md:px-0",
          trackClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
