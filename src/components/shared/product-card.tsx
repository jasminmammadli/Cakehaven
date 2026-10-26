import Image from "next/image";
import Link from "next/link";

import type { ProductSummary } from "@/features/catalog/types";
import { FavoriteButton } from "@/features/favorites/favorite-button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Figma "card" (Component 2, node 48:604): 280x460 on desktop, 246x386 on
 * mobile. Image fills the top 81%, text sits in a box bordered on 3 sides.
 */
export function ProductCard({
  product,
  className,
  priority,
}: {
  product: ProductSummary;
  className?: string;
  priority?: boolean;
}) {
  return (
    <article className={cn("group relative flex aspect-[246/386] flex-col md:aspect-[280/460]", className)}>
      <Link
        href={`/cakes/${product.slug}`}
        className="flex flex-1 flex-col outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative basis-[81.09%] overflow-hidden bg-lilac-50">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 768px) 280px, 246px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center border-x border-b border-grey-700 px-[30px] text-body1 text-ink">
          <h3 className="line-clamp-1 font-normal">{product.name}</h3>
          <p className="font-extrabold">{formatPrice(product.basePriceCents)}</p>
        </div>
      </Link>
      <FavoriteButton
        productId={product.id}
        productName={product.name}
        className="absolute top-[3.48%] right-[5.71%] size-11 md:size-[54px]"
      />
    </article>
  );
}
