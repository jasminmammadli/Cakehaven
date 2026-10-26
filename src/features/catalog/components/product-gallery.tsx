"use client";

import Image from "next/image";
import { useState } from "react";

import { FavoriteButton } from "@/features/favorites/favorite-button";
import { cn } from "@/lib/utils";

/**
 * Figma "inside cake page": three 180px thumbnails beside a 450x580 main image.
 * Choosing a thumbnail swaps it with the main image so every photo stays reachable.
 */
export function ProductGallery({
  productId,
  name,
  images,
}: {
  productId: string;
  name: string;
  images: string[];
}) {
  const [order, setOrder] = useState(images);
  const [main, ...thumbs] = order;

  function select(index: number) {
    setOrder((current) => {
      const next = [...current];
      [next[0], next[index + 1]] = [next[index + 1], next[0]];
      return next;
    });
  }

  return (
    <div className="flex flex-col-reverse gap-5 md:flex-row">
      {thumbs.length > 0 && (
        <ul className="flex gap-3 md:flex-col md:gap-5" aria-label="More photos">
          {thumbs.slice(0, 3).map((src, index) => (
            <li key={src} className="flex-1 md:flex-none">
              <button
                type="button"
                onClick={() => select(index)}
                aria-label={`Show photo ${index + 2} of ${name}`}
                className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-[8px] outline-none transition-opacity hover:opacity-85 focus-visible:ring-3 focus-visible:ring-ring md:size-[180px]"
              >
                <Image src={src} alt="" fill sizes="(min-width: 768px) 180px, 30vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        className={cn(
          "relative aspect-[450/580] w-full overflow-hidden rounded-[24px] bg-lilac-50",
          thumbs.length > 0 ? "md:w-[450px]" : "md:w-[650px]",
        )}
      >
        <Image
          key={main}
          src={main}
          alt={name}
          fill
          priority
          sizes="(min-width: 768px) 450px, 100vw"
          className="object-cover"
        />
        <FavoriteButton productId={productId} productName={name} className="absolute top-5 right-5" />
      </div>
    </div>
  );
}
