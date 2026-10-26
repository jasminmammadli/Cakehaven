"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/action-result";

import { addReview } from "../actions";

/** Figma "Component 11": 680px pill input with a trailing arrow submit. */
export function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(addReview, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      toast.success("Thanks! Your review is live.");
    }
  }, [state]);

  const error = state && !state.ok ? state.error : null;

  return (
    <form ref={formRef} action={formAction} className="mt-10">
      <input type="hidden" name="productId" value={productId} />
      <label htmlFor="review-body" className="sr-only">
        Add a comment
      </label>
      <div className="relative">
        <input
          id="review-body"
          name="body"
          required
          minLength={3}
          maxLength={1000}
          placeholder="Add a comment"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "review-error" : undefined}
          className="h-16 w-full rounded-pill border border-black-300 pr-16 pl-5 text-body1 outline-none placeholder:text-black-500 focus-visible:border-lilac-800 focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Post comment"
          className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-black-500 outline-none hover:bg-lilac-100 focus-visible:ring-3 focus-visible:ring-ring/60 disabled:cursor-progress"
        >
          {pending ? (
            <LoaderCircle aria-hidden className="size-6 animate-spin" />
          ) : (
            <ArrowRight aria-hidden className="size-7" strokeWidth={1.5} />
          )}
        </button>
      </div>
      {error && (
        <p id="review-error" role="alert" className="mt-2 px-5 text-body2 text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
