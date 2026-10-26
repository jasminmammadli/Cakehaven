import type { ProductSummary } from "@/features/catalog/types";

import { Carousel } from "./carousel";
import { ProductCard } from "./product-card";

export function ProductCarousel({
  title,
  id,
  products,
  className,
}: {
  title: string;
  id?: string;
  products: ProductSummary[];
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <Carousel title={title} id={id} className={className}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          className="w-[246px] shrink-0 snap-start md:w-[calc((100%-60px)/4)]"
        />
      ))}
    </Carousel>
  );
}
