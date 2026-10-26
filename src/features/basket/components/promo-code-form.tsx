"use client";

import { useActionState, useTransition } from "react";
import { ArrowRight, LoaderCircle, X } from "lucide-react";

import type { ActionResult } from "@/lib/action-result";

import { applyPromoCode, removePromoCode } from "../actions";

type PromoState = ActionResult<{ code: string; percentOff: number }> | null;

/** Figma "Component 6" with trailing arrow and the "20% off discount" caption. */
export function PromoCodeForm({ applied }: { applied: { code: string; percentOff: number } | null }) {
  const [state, formAction, pending] = useActionState<PromoState, FormData>(applyPromoCode, null);
  const [removing, startRemove] = useTransition();
  const error = state && !state.ok ? state.error : null;

  if (applied) {
    return (
      <div className="flex flex-col gap-[5px]">
        <div className="flex h-16 items-center justify-between rounded-pill border border-lilac-700 bg-lilac-50 px-5 text-body1">
          <span className="font-extrabold tracking-wide">{applied.code}</span>
          <button
            type="button"
            disabled={removing}
            onClick={() => startRemove(async () => void (await removePromoCode()))}
            aria-label={`Remove promo code ${applied.code}`}
            className="grid size-10 cursor-pointer place-items-center rounded-full outline-none hover:bg-lilac-100 focus-visible:ring-3 focus-visible:ring-ring/60"
          >
            {removing ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <X aria-hidden className="size-6" />}
          </button>
        </div>
        <p className="px-0.5 text-caption text-grey-700">{applied.percentOff}% off discount</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-[5px]">
      <label htmlFor="promo-code" className="sr-only">
        Promo code
      </label>
      <div className="relative">
        <input
          id="promo-code"
          name="code"
          placeholder="Promocode"
          autoComplete="off"
          maxLength={30}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby="promo-hint"
          className="h-16 w-full rounded-pill border border-black-300 pr-16 pl-5 text-body1 uppercase outline-none placeholder:normal-case placeholder:text-black-500 focus-visible:border-lilac-800 focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Apply promo code"
          className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full outline-none hover:bg-lilac-100 focus-visible:ring-3 focus-visible:ring-ring/60"
        >
          {pending ? <LoaderCircle aria-hidden className="size-6 animate-spin" /> : <ArrowRight aria-hidden className="size-7" strokeWidth={1.5} />}
        </button>
      </div>
      <p id="promo-hint" role={error ? "alert" : undefined} className={error ? "px-0.5 text-caption text-destructive" : "px-0.5 text-caption text-grey-700"}>
        {error ?? "Have a promo code? Enter it to get a discount."}
      </p>
    </form>
  );
}
