"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { toggleReviewLike } from "../actions";

export function LikeButton({
  reviewId,
  productId,
  initialLiked,
  initialCount,
  authorName,
}: {
  reviewId: string;
  productId: string;
  initialLiked: boolean;
  initialCount: number;
  authorName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (_state, next: { liked: boolean; count: number }) => next,
  );

  function handleClick() {
    startTransition(async () => {
      setOptimistic({
        liked: !optimistic.liked,
        count: Math.max(optimistic.count + (optimistic.liked ? -1 : 1), 0),
      });
      const result = await toggleReviewLike({ reviewId, productId });
      if (result.ok) return; // updateTag refreshes the server-rendered count
      if (result.code === "auth_required") {
        toast("Log in to like reviews", {
          action: { label: "Log in", onClick: () => router.push(`/login?next=${encodeURIComponent(pathname)}`) },
        });
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={optimistic.liked}
      aria-busy={pending || undefined}
      aria-label={`${optimistic.liked ? "Unlike" : "Like"} review by ${authorName}`}
      className="inline-flex cursor-pointer items-center gap-2 rounded py-1.5 font-review text-body2 leading-6 text-review outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
    >
      <Heart
        aria-hidden
        className={cn("size-6 transition-colors", optimistic.liked && "fill-lilac-700 text-lilac-800")}
        strokeWidth={1.75}
      />
      <span>{optimistic.count}</span>
    </button>
  );
}
