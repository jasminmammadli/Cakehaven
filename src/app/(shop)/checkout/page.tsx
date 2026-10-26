import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ShoppingBasket } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getBasketView } from "@/features/basket/service";
import { CheckoutFlow } from "@/features/checkout/components/checkout-flow";
import { CheckoutSummary } from "@/features/checkout/components/checkout-summary";

export const metadata: Metadata = { title: "Order the cake", robots: { index: false } };

async function Checkout() {
  const basket = await getBasketView();

  if (basket.lines.length === 0) {
    return (
      <div className="mt-10">
        <EmptyState
          icon={ShoppingBasket}
          title="Nothing to check out yet"
          description="Add a cake to your basket first."
          action={
            <Link href="/cakes" className={buttonVariants({ size: "sm" })}>
              Browse cakes
            </Link>
          }
        />
      </div>
    );
  }

  return <CheckoutFlow summary={<CheckoutSummary basket={basket} />} />;
}

export default function CheckoutPage() {
  return (
    <div className="container-site pt-8 pb-20 md:pt-10 md:pb-[100px]">
      <Breadcrumbs
        items={[
          { label: "Home page", href: "/" },
          { label: "My basket", href: "/basket" },
          { label: "Checkout" },
        ]}
      />
      <h1 className="mt-8 text-[28px] leading-9 font-extrabold md:mt-10 md:text-display">Order the cake</h1>
      <Suspense fallback={<Skeleton className="mt-10 h-[600px] w-full" />}>
        <Checkout />
      </Suspense>
    </div>
  );
}
