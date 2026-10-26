import { formatPrice } from "@/lib/format";

import type { BasketView } from "../view";

/** Figma "Order Summary" card (node 102:1977): 32px radius, lilac-700 border. */
export function OrderSummary({ basket }: { basket: BasketView }) {
  const { totals, promo } = basket;

  return (
    <section
      aria-labelledby="summary-title"
      className="rounded-[32px] border border-lilac-700 px-6 py-8 md:px-10 md:pt-10 md:pb-[42px]"
    >
      <h2 id="summary-title" className="text-h3 font-extrabold text-black">
        Order Summary
      </h2>
      <dl className="mt-8 flex flex-col gap-5 text-body1 text-black">
        <div className="flex justify-between">
          <dt>Sub Total</dt>
          <dd className="font-extrabold">{formatPrice(totals.subtotalCents)}</dd>
        </div>
        {promo && (
          <div className="flex justify-between">
            <dt>
              Discount <span className="text-grey-800">({promo.code}, {promo.percentOff}%)</span>
            </dt>
            <dd className="font-extrabold">−{formatPrice(totals.discountCents)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>Grand Total</dt>
          <dd className="font-extrabold">{formatPrice(totals.totalCents)}</dd>
        </div>
      </dl>
      <hr className="mt-10 border-lilac-400" />
      <p className="mt-10 text-h2 text-black-500">
        Total: <strong className="font-extrabold">{formatPrice(totals.totalCents)}</strong>
      </p>
    </section>
  );
}
