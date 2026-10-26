import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ShoppingBasket } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditRemove, QuantityStepper } from "@/features/basket/components/line-actions";
import { OrderSummary } from "@/features/basket/components/order-summary";
import { PromoCodeForm } from "@/features/basket/components/promo-code-form";
import { getBasketView } from "@/features/basket/service";
import { formatPrice, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "My basket", robots: { index: false } };

async function Basket() {
  const basket = await getBasketView();

  if (basket.lines.length === 0) {
    return (
      <>
        <h1 className="text-[28px] leading-9 font-extrabold md:text-display">My basket</h1>
        <div className="mt-10">
          <EmptyState
            icon={ShoppingBasket}
            title="Your basket is empty"
            description="Find a cake you love, or design your own from scratch."
            action={
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/cakes" className={buttonVariants({ size: "sm" })}>
                  Browse cakes
                </Link>
                <Link href="/design" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Design the cake
                </Link>
              </div>
            }
          />
        </div>
      </>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[680px_380px] md:justify-between">
      <div>
        <div className="flex items-baseline gap-5">
          <h1 className="text-[28px] leading-9 font-extrabold md:text-display">My basket</h1>
          <p className="text-body1 text-black">( {pluralize(basket.itemCount, "item")} )</p>
        </div>
        <ul className="mt-[60px] flex flex-col">
          {basket.lines.map((line, index) => (
            <li
              key={line.id}
              className={cn("flex gap-4 md:gap-5", index > 0 && "mt-10 border-t border-grey-400 pt-10")}
            >
              <div className="relative size-[110px] shrink-0 overflow-hidden rounded-[24px] bg-lilac-50 md:size-[180px]">
                <Image src={line.imageUrl} alt="" fill sizes="(min-width: 768px) 180px, 110px" className="object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-h3 font-extrabold md:max-w-[300px] md:text-h2">{line.name}</h2>
                    <p className="mt-[7px] text-body2 md:text-body1">{line.description}</p>
                  </div>
                  <p className="text-right text-h3 font-extrabold whitespace-nowrap">
                    {formatPrice(line.lineTotalCents)}
                    {line.quantity > 1 && (
                      <span className="block text-caption font-normal text-grey-800">
                        {formatPrice(line.unitPriceCents)} each
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <QuantityStepper lineId={line.id} quantity={line.quantity} name={line.name} />
                  <EditRemove lineId={line.id} editHref={line.editHref} name={line.name} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="flex flex-col gap-10 md:pt-12" aria-label="Order summary">
        <OrderSummary basket={basket} />
        <PromoCodeForm applied={basket.promo} />
        <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
          Order basket
        </Link>
      </aside>
    </div>
  );
}

export default function BasketPage() {
  return (
    <div className="container-site pt-8 pb-20 md:pt-10 md:pb-[140px]">
      <Suspense
        fallback={
          <div aria-hidden className="grid gap-10 md:grid-cols-[680px_380px] md:justify-between">
            <div className="flex flex-col gap-10">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-[180px]" />
              <Skeleton className="h-[180px]" />
            </div>
            <Skeleton className="h-[320px] rounded-[32px]" />
          </div>
        }
      >
        <Basket />
      </Suspense>
    </div>
  );
}
