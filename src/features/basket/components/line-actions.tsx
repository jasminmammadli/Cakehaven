"use client";

import Link from "next/link";
import { Minus, PencilLine, Plus, Trash2 } from "lucide-react";

import { MAX_LINE_QUANTITY } from "../pricing";
import { removeBasketLine, updateBasketQuantity } from "../actions";
import { useBasketAction } from "../use-add-to-basket";

const actionLink =
  "inline-flex cursor-pointer items-center gap-2 rounded-sm text-body2 text-grey-800 outline-none hover:text-black-500 focus-visible:ring-3 focus-visible:ring-ring/60 disabled:cursor-progress";

/** Figma basket stepper: 35 / 63 / 35px boxes with a lilac-700 border. */
export function QuantityStepper({ lineId, quantity, name }: { lineId: string; quantity: number; name: string }) {
  const { pending, run } = useBasketAction();
  const set = (next: number) => run(() => updateBasketQuantity({ lineId, quantity: next }));

  return (
    <div role="group" aria-label={`Quantity of ${name}`} className="flex h-9 items-stretch" aria-busy={pending || undefined}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={pending || quantity <= 1}
        onClick={() => set(quantity - 1)}
        className="grid w-[35px] cursor-pointer place-items-center rounded-l-[5px] border border-lilac-700 outline-none hover:bg-lilac-50 focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60 disabled:cursor-default disabled:opacity-40"
      >
        <Minus aria-hidden className="size-3.5" />
      </button>
      <output
        aria-live="polite"
        className="-mx-px grid w-[63px] place-items-center border border-lilac-700 text-body2 text-black"
      >
        {quantity}
      </output>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={pending || quantity >= MAX_LINE_QUANTITY}
        onClick={() => set(quantity + 1)}
        className="grid w-[35px] cursor-pointer place-items-center rounded-r-[5px] border border-lilac-700 outline-none hover:bg-lilac-50 focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60 disabled:cursor-default disabled:opacity-40"
      >
        <Plus aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}

export function EditRemove({ lineId, editHref, name }: { lineId: string; editHref: string; name: string }) {
  const { pending, run } = useBasketAction();

  return (
    <div className="flex items-center gap-10">
      <Link href={editHref} className={actionLink} aria-label={`Edit ${name}`}>
        <PencilLine aria-hidden className="size-5" strokeWidth={1.5} />
        Edit
      </Link>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending || undefined}
        aria-label={`Remove ${name} from basket`}
        onClick={() => run(() => removeBasketLine(lineId), { successMessage: undefined })}
        className={actionLink}
      >
        <Trash2 aria-hidden className="size-5" strokeWidth={1.5} />
        {pending ? "Removing…" : "Remove"}
      </button>
    </div>
  );
}
