import { ProductCarousel } from "@/components/shared/product-carousel";
import { AboutSection } from "@/features/catalog/components/about-section";
import { CategorySection } from "@/features/catalog/components/category-section";
import { Hero } from "@/features/catalog/components/hero";
import { HowItWorks } from "@/features/catalog/components/how-it-works";
import { getCategories, getCollections } from "@/features/catalog/repository";

export default async function HomePage() {
  const [categories, collections] = await Promise.all([
    getCategories(),
    getCollections(["sweet-success", "designer-cakes"]),
  ]);

  return (
    <div className="flex flex-col gap-20 pb-20 md:gap-[140px] md:pb-[140px]">
      <Hero />
      <CategorySection categories={categories} />
      <HowItWorks />
      <div className="container-site flex flex-col gap-20 md:gap-[149px]">
        {collections.map((collection) => (
          <ProductCarousel
            key={collection.slug}
            id={collection.slug}
            title={collection.title}
            products={collection.products}
          />
        ))}
      </div>
      <AboutSection />
    </div>
  );
}
