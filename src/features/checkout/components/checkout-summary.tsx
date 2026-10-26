import Image from "next/image";

import { EditRemove } from "@/features/basket/components/line-actions";
import type { BasketView } from "@/features/basket/view";
import { formatPrice } from "@/lib/format";

/** Figma "Price cards" (node 85:1301): 580px card listing basket lines with Edit/Remove. */
export function CheckoutSummary({ basket }: { basket: BasketView }) {
  return (
    <aside aria-label="Your order" className="rounded-[32px] border border-lilac-700 p-6 md:p-10">
      <ul>
        {basket.lines.map((line) => (
          <li key={line.id} className="flex gap-5 border-b border-lilac-400 py-5 first:pt-0">
            <div className="relative size-[110px] shrink-0 overflow-hidden rounded-[8px] bg-lilac-50">
              <Image src={line.imageUrl} alt="" fill sizes="110px" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-h3 font-extrabold">
                  {line.name}
                  {line.quantity > 1 && <span className="font-normal text-grey-800"> × {line.quantity}</span>}
                </h3>
                <p className="line-clamp-2 text-body1">{line.description}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-h3 font-extrabold">{formatPrice(line.lineTotalCents)}</p>
                <EditRemove lineId={line.id} editHref={line.editHref} name={line.name} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <dl className="mt-5 flex flex-col items-end gap-1 text-body1">
        {basket.promo && (
          <div className="flex gap-2 text-grey-800">
            <dt>Discount ({basket.promo.code})</dt>
            <dd>−{formatPrice(basket.totals.discountCents)}</dd>
          </div>
        )}
        <div className="flex gap-2 text-h2">
          <dt>Total:</dt>
          <dd className="font-extrabold">{formatPrice(basket.totals.totalCents)}</dd>
        </div>
      </dl>
    </aside>
  );
}
