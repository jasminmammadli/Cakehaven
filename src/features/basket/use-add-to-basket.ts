"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { useViewerContext } from "@/features/auth/viewer-context";
import type { ActionResult } from "@/lib/action-result";

type BasketResult = ActionResult<{ itemCount: number }>;

/** Runs a basket action, keeps the header badge in sync and reports the outcome. */
export function useBasketAction() {
  const router = useRouter();
  const { setBasketCount } = useViewerContext();
  const [pending, startTransition] = useTransition();

  function run(
    action: () => Promise<BasketResult>,
    { successMessage, then }: { successMessage?: string; then?: "basket" | "checkout" } = {},
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setBasketCount(result.data.itemCount);
      if (then) {
        router.push(then === "basket" ? "/basket" : "/checkout");
        return;
      }
      if (successMessage) {
        toast.success(successMessage, {
          action: { label: "View basket", onClick: () => router.push("/basket") },
        });
      }
    });
  }

  return { pending, run };
}
