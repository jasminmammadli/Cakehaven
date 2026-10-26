import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { readBasket } from "@/features/basket/store";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { ProductPurchase, type EditingLine } from "@/features/catalog/components/product-purchase";
import { getCollections, getProductBySlug } from "@/features/catalog/repository";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";

export async function generateMetadata({ params }: PageProps<"/cakes/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Cake not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.imageUrl] },
  };
}

/** Basket "Edit" links open the product with ?edit=<lineId>. */
async function findEditingLine(productId: string, editParam: unknown): Promise<EditingLine | undefined> {
  if (typeof editParam !== "string") return undefined;
  const line = (await readBasket()).find((l) => l.id === editParam);
  if (!line || line.kind !== "product" || line.productId !== productId) return undefined;
  return { id: line.id, weight: line.weight, message: line.message };
}

async function ProductContent({ params, searchParams }: PageProps<"/cakes/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [editing, [related]] = await Promise.all([
    findEditingLine(product.id, (await searchParams).edit),
    getCollections(["surprise-your-loved-one"]),
  ]);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home page", href: "/" },
          { label: "Category of cakes", href: `/cakes?category=${product.category.slug}` },
          { label: product.name },
        ]}
      />

      {/* DOM order gives the mobile order (gallery, purchase, reviews); on desktop
          the reviews sit under the gallery as in the Figma frame. */}
      <div className="mt-8 grid items-start gap-10 md:mt-[60px] md:grid-cols-[650px_1fr] md:gap-x-[50px] md:gap-y-[100px]">
        <div className="md:col-start-1 md:row-start-1">
          <ProductGallery
            productId={product.id}
            name={product.name}
            images={[product.imageUrl, ...product.gallery]}
          />
        </div>
        <div className="md:col-start-2 md:row-span-2 md:row-start-1">
          <ProductPurchase
            key={editing?.id ?? "new"}
            productId={product.id}
            name={product.name}
            basePriceCents={product.basePriceCents}
            description={product.description}
            editing={editing}
          />
        </div>
        <div className="md:col-start-1 md:row-start-2">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <ReviewsSection productId={product.id} slug={product.slug} />
          </Suspense>
        </div>
      </div>

      {related && (
        <ProductCarousel
          id="related"
          title={related.title}
          products={related.products.filter((item) => item.id !== product.id)}
          className="mt-20 md:mt-[153px]"
        />
      )}
    </>
  );
}

export default function ProductPage(props: PageProps<"/cakes/[slug]">) {
  return (
    <div className="container-site pt-8 pb-20 md:pt-10 md:pb-[140px]">
      <Suspense
        fallback={
          <div aria-hidden className="grid gap-10 md:grid-cols-[650px_1fr]">
            <Skeleton className="aspect-[650/580] rounded-[24px]" />
            <Skeleton className="h-[580px]" />
          </div>
        }
      >
        <ProductContent {...props} />
      </Suspense>
    </div>
  );
}
