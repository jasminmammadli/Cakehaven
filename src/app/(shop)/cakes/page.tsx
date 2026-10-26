import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryTabs } from "@/features/catalog/components/category-tabs";
import { FilterDialog } from "@/features/catalog/components/filter-dialog";
import { ProductResults } from "@/features/catalog/components/product-results";
import { countRefinements, hasActiveFilters, parseCatalogFilters } from "@/features/catalog/filters";
import { getCategories, getCollections, searchProducts } from "@/features/catalog/repository";

export const metadata: Metadata = {
  title: "Category of cakes",
  description: "Browse birthday, wedding, anniversary and designer cakes. Filter by price, shape and flavour.",
};

const COLLECTION_SLUGS = ["sweet-success", "designer-cakes", "surprise-your-loved-one", "trending-cakes"];

async function Catalog({ searchParams }: { searchParams: PageProps<"/cakes">["searchParams"] }) {
  const filters = parseCatalogFilters(await searchParams);
  const categories = await getCategories();
  const activeCategory = categories.find((category) => category.slug === filters.category);
  const narrowed = hasActiveFilters(filters);

  const resultsTitle = filters.q
    ? `Results for “${filters.q}”`
    : activeCategory
      ? `${activeCategory.name} cakes`
      : "Cakes";

  return (
    <>
      <div className="mt-8 flex items-center gap-4 md:mt-[66px] md:gap-[33px]">
        <CategoryTabs categories={categories} activeSlug={activeCategory?.slug} />
        <FilterDialog
          key={JSON.stringify(filters)}
          filters={filters}
          activeCount={countRefinements(filters)}
        />
      </div>

      <div className="mt-12 flex flex-col gap-20 md:mt-[62px] md:gap-[149px]">
        {narrowed ? (
          <ProductResults title={resultsTitle} filters={filters} page={await searchProducts(filters)} />
        ) : (
          (await getCollections(COLLECTION_SLUGS)).map((collection) => (
            <ProductCarousel
              key={collection.slug}
              id={collection.slug}
              title={collection.title}
              products={collection.products}
            />
          ))
        )}
      </div>
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div aria-hidden className="mt-8 md:mt-[66px]">
      <Skeleton className="h-[68px] w-full rounded-pill" />
      <Skeleton className="mt-12 h-9 w-56" />
      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="aspect-[280/460] rounded-none" />
        ))}
      </div>
    </div>
  );
}

export default function CakesPage({ searchParams }: PageProps<"/cakes">) {
  return (
    <div className="container-site pt-8 pb-20 md:pt-[66px] md:pb-[140px]">
      <Breadcrumbs items={[{ label: "Home page", href: "/" }, { label: "Category of cakes" }]} />
      <h1 className="mt-8 text-[28px] leading-9 font-extrabold md:mt-[80px] md:text-display">Category of cakes</h1>
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
