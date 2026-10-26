import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Carousel } from "@/components/shared/carousel";

import type { Category } from "../types";

function CategoryTile({ category }: { category: Category & { imageUrl: string } }) {
  const href = `/cakes?category=${category.slug}`;

  return (
    <>
      {/* Desktop: Figma Component 1 (295x419) with gradient and arrow circle */}
      <Link
        href={href}
        className="group relative hidden aspect-[295/419] w-[calc(100%/4)] shrink-0 snap-start overflow-hidden border-y border-l border-black-500 outline-none last:border-r focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset md:block"
      >
        <Image
          src={category.imageUrl}
          alt=""
          fill
          sizes="295px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-[53.94%] bottom-0 bg-gradient-to-b from-[rgba(217,217,217,0)] from-[7%] to-black"
        />
        <span className="absolute inset-x-0 top-[68.02%] text-center text-h2 text-white uppercase">
          {category.name}
        </span>
        <span
          aria-hidden
          className="absolute top-[80.43%] left-1/2 grid size-[50px] -translate-x-1/2 place-items-center rounded-full border border-white text-white transition-colors group-hover:bg-white group-hover:text-black-500 group-focus-visible:bg-white group-focus-visible:text-black-500"
        >
          <ArrowRight className="size-6" strokeWidth={1.5} />
        </span>
      </Link>

      {/* Mobile: Figma "mobil home page" 2x2 grid (167px tiles, label below) */}
      <Link
        href={href}
        className="flex flex-col gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring md:hidden"
      >
        <span className="relative aspect-square overflow-hidden rounded-[24px]">
          <Image src={category.imageUrl} alt="" fill sizes="50vw" className="object-cover" />
        </span>
        <span className="text-h3 font-normal">{category.name}</span>
      </Link>
    </>
  );
}

export function CategorySection({ categories }: { categories: Category[] }) {
  const withImages = categories.filter((c): c is Category & { imageUrl: string } => Boolean(c.imageUrl));
  if (withImages.length === 0) return null;

  return (
    <div className="container-site">
      <div className="hidden md:block">
        <Carousel title="Category of cakes" id="categories" trackClassName="gap-0 snap-x">
          {withImages.map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
        </Carousel>
      </div>
      <section aria-labelledby="categories-mobile-title" className="md:hidden">
        <h2 id="categories-mobile-title" className="mb-8 text-h2 font-extrabold">
          Category of cakes
        </h2>
        <div className="grid grid-cols-2 gap-5">
          {withImages.slice(0, 4).map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
