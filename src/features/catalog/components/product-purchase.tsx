"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { addProductToBasket } from "@/features/basket/actions";
import { DEFAULT_WEIGHT, priceForWeight, WEIGHTS, weightLabel, type Weight } from "@/features/basket/pricing";
import { CAKE_MESSAGE_MAX } from "@/features/basket/schema";
import { useBasketAction } from "@/features/basket/use-add-to-basket";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export type EditingLine = { id: string; weight: Weight; message: string };

/** Right-hand column of the product page: name, live price, weight, message, CTAs. */
export function ProductPurchase({
  productId,
  name,
  basePriceCents,
  description,
  editing,
}: {
  productId: string;
  name: string;
  basePriceCents: number;
  description: string;
  editing?: EditingLine;
}) {
  const [weight, setWeight] = useState<Weight>(editing?.weight ?? DEFAULT_WEIGHT);
  const [message, setMessage] = useState(editing?.message ?? "");
  const { pending, run } = useBasketAction();
  const messageId = useId();

  const submit = (then?: "basket" | "checkout") =>
    run(
      () => addProductToBasket({ productId, weight, message, quantity: 1, editLineId: editing?.id }),
      { successMessage: `${name} added to your basket`, then },
    );

  return (
    <div className="flex flex-col">
      <h1 className="text-h1 font-extrabold">{name}</h1>
      <p className="mt-3 text-h1 text-black" aria-live="polite">
        {formatPrice(priceForWeight(basePriceCents, weight))}
      </p>

      <fieldset className="mt-10">
        <legend className="text-body1 font-extrabold">Select Weight</legend>
        <div role="radiogroup" aria-label="Weight" className="mt-5 grid grid-cols-4 gap-3 md:gap-5">
          {WEIGHTS.map((option) => {
            const selected = option === weight;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setWeight(option)}
                className={cn(
                  "h-16 cursor-pointer rounded-pill text-body1 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected
                    ? "border-2 border-lilac-700 text-lilac-700"
                    : "border border-grey-600 text-grey-600 hover:border-black-300 hover:text-black-300",
                )}
              >
                {weightLabel(option)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <hr className="mt-10 border-grey-400" />

      <section className="mt-10" aria-labelledby={`${messageId}-description`}>
        <h2 id={`${messageId}-description`} className="text-body1 font-extrabold">
          Product Description
        </h2>
        <p className="mt-3 text-body1 text-black">{description}</p>
      </section>

      <hr className="mt-10 border-grey-400" />

      <label htmlFor={messageId} className="mt-10 text-body1 font-extrabold">
        Cake message
      </label>
      <input
        id={messageId}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        maxLength={CAKE_MESSAGE_MAX}
        placeholder="Enter your message"
        aria-describedby={`${messageId}-hint`}
        className="mt-5 h-16 w-full rounded-pill border border-black-300 px-5 text-body1 outline-none placeholder:text-black-500 focus-visible:border-lilac-800 focus-visible:ring-3 focus-visible:ring-ring/40"
      />
      <p id={`${messageId}-hint`} className="mt-1 px-5 text-caption text-grey-700">
        Optional, up to {CAKE_MESSAGE_MAX} characters ({CAKE_MESSAGE_MAX - message.length} left)
      </p>

      <div className="mt-10 grid grid-cols-2 gap-5">
        {editing ? (
          <Button
            className="col-span-2"
            aria-busy={pending || undefined}
            disabled={pending}
            onClick={() => submit("basket")}
          >
            {pending ? "Saving…" : "Update basket"}
          </Button>
        ) : (
          <>
            <Button variant="outline-lilac" disabled={pending} aria-busy={pending || undefined} onClick={() => submit()}>
              Add basket
            </Button>
            <Button disabled={pending} aria-busy={pending || undefined} onClick={() => submit("checkout")}>
              Buy
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
