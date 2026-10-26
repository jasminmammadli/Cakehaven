import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";
import { buttonVariants } from "@/components/ui/button";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

import { catalogHref, type CatalogFilters } from "../filters";
import type { ProductPage } from "../types";

function Pagination({ filters, page }: { filters: CatalogFilters; page: ProductPage }) {
  if (page.pageCount <= 1) return null;
  const pages = Array.from({ length: page.pageCount }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
      {page.page > 1 ? (
        <Link
          href={catalogHref({ ...filters, page: page.page - 1 })}
          aria-label="Previous page"
          className={buttonVariants({ variant: "circle", size: "icon" })}
        >
          <ChevronLeft strokeWidth={1.5} />
        </Link>
      ) : (
        <span aria-hidden className={cn(buttonVariants({ variant: "circle", size: "icon" }), "opacity-40")}>
          <ChevronLeft strokeWidth={1.5} />
        </span>
      )}
      <ol className="flex gap-2">
        {pages.map((number) => (
          <li key={number}>
            <Link
              href={catalogHref({ ...filters, page: number })}
              aria-current={number === page.page ? "page" : undefined}
              className={cn(
                "grid size-11 place-items-center rounded-full text-body1 outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
                number === page.page ? "bg-lilac-700 text-white" : "hover:bg-lilac-100",
              )}
            >
              {number}
            </Link>
          </li>
        ))}
      </ol>
      {page.page < page.pageCount ? (
        <Link
          href={catalogHref({ ...filters, page: page.page + 1 })}
          aria-label="Next page"
          className={buttonVariants({ variant: "circle", size: "icon" })}
        >
          <ChevronRight strokeWidth={1.5} />
        </Link>
      ) : (
        <span aria-hidden className={cn(buttonVariants({ variant: "circle", size: "icon" }), "opacity-40")}>
          <ChevronRight strokeWidth={1.5} />
        </span>
      )}
    </nav>
  );
}

export function ProductResults({
  title,
  filters,
  page,
}: {
  title: string;
  filters: CatalogFilters;
  page: ProductPage;
}) {
  return (
    <section aria-labelledby="results-title">
      <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id="results-title" className="text-h2 font-extrabold md:text-h1">
          {title}
        </h2>
        <p className="text-body1 text-grey-800" aria-live="polite">
          {pluralize(page.total, "cake")}
        </p>
      </div>

      {page.items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No cakes match"
          description="Try another category, widen the price range or clear some filters."
          action={
            <Link href="/cakes" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Show all cakes
            </Link>
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {page.items.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      )}

      <Pagination filters={filters} page={page} />
    </section>
  );
}
