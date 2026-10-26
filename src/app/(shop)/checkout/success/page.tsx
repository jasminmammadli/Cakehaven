import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Check } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { buttonVariants } from "@/components/ui/button";
import { getCollections } from "@/features/catalog/repository";

export const metadata: Metadata = { title: "Payment success", robots: { index: false } };

async function OrderReference({ searchParams }: { searchParams: PageProps<"/checkout/success">["searchParams"] }) {
  const { ref } = await searchParams;
  // Only echo a well-formed reference; nothing is looked up from it.
  if (typeof ref !== "string" || !/^[A-Z0-9]{6,20}$/.test(ref)) return null;
  return (
    <p className="text-body1 text-black-400">
      Order reference <strong className="font-extrabold text-black-500">{ref}</strong>
    </p>
  );
}

export default async function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const [recommended] = await getCollections(["surprise-your-loved-one"]);

  return (
    <div className="container-site pt-8 pb-20 md:pt-10 md:pb-[140px]">
      <Breadcrumbs items={[{ label: "Home page", href: "/" }, { label: "Order the cake" }]} />
      <h1 className="mt-8 text-[28px] leading-9 font-extrabold md:mt-10 md:text-display">Order the cake</h1>

      {/* Figma "Frame 199" */}
      <section aria-labelledby="success-title" className="mt-14 flex flex-col items-center gap-10 text-center md:mt-[60px]">
        <Check aria-hidden className="size-[100px] text-lilac-700" strokeWidth={2.5} />
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-2">
            <h2 id="success-title" className="text-h1 font-extrabold uppercase">
              Payment success
            </h2>
            <p className="text-body1 text-black-400">
              Payment completed successfully.
              <br />
              Thank you for your order.
            </p>
            <Suspense fallback={null}>
              <OrderReference searchParams={searchParams} />
            </Suspense>
          </div>
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "lg" })}>
            Back to home
          </Link>
        </div>
      </section>

      {recommended && (
        <ProductCarousel
          id="you-will-like-it"
          title="You will like it"
          products={recommended.products}
          className="mt-20 md:mt-[140px]"
        />
      )}
    </div>
  );
}
