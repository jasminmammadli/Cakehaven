import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Figma home hero (Rectangle 99 + Frame 108): 680px photo with a 10% black scrim. */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative md:h-[680px]">
      <div className="relative h-[283px] md:absolute md:inset-0 md:h-auto">
        <Image
          src="/images/hero.jpg"
          alt="Chocolate cupcake with whipped chocolate cream on a dark plate"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-black/10" />
      </div>

      <div className="container-site relative flex h-full flex-col items-center gap-6 py-6 text-center md:items-start md:justify-center md:gap-10 md:pt-0 md:pb-[10px] md:text-left md:text-white">
        <h1 id="hero-title" className="flex flex-col gap-2 md:gap-[21px]">
          <span className="font-display text-[20px] leading-[17px] uppercase md:text-[40px] md:leading-7">
            Indulge in Sweet Delights:
          </span>
          <span className="font-script text-[24px] leading-[17px] md:text-[50px] md:leading-7">
            your perfect slice awaits!
          </span>
        </h1>
        <p className="hidden max-w-[480px] text-body1 md:block">
          Indulge in a world of sweet delights where every slice is a masterpiece waiting to be
          savored. Find your perfect cake and elevate every moment with our irresistible flavors.
        </p>
        <Link
          href="/cakes"
          className={cn(buttonVariants({ size: "lg" }), "h-12 w-full max-w-[354px] text-body1 md:h-[68px] md:w-[280px] md:text-h3")}
        >
          Discover us
        </Link>
      </div>
    </section>
  );
}
