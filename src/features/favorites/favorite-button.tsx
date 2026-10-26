"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { useViewerContext } from "@/features/auth/viewer-context";
import { cn } from "@/lib/utils";

import { toggleFavorite } from "./actions";

/** Figma "heart" component (node 48:597): 54px white circle, lilac-900 heart. */
export function FavoriteButton({
  productId,
  productName,
  className,
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const { viewer, setFavorite } = useViewerContext();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const favorited = viewer?.favoriteIds.includes(productId) ?? false;

  function promptLogin() {
    toast("Log in to save your favourite cakes", {
      action: { label: "Log in", onClick: () => router.push(`/login?next=${encodeURIComponent(pathname)}`) },
    });
  }

  function handleClick() {
    if (!viewer) return; // visitor state still loading
    if (!viewer.user) {
      promptLogin();
      return;
    }

    setFavorite(productId, !favorited);
    startTransition(async () => {
      const result = await toggleFavorite(productId);
      if (result.ok) {
        setFavorite(productId, result.data.favorited);
        return;
      }
      setFavorite(productId, favorited);
      if (result.code === "auth_required") promptLogin();
      else toast.error(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorited}
      aria-label={favorited ? `Remove ${productName} from favourites` : `Add ${productName} to favourites`}
      aria-busy={pending || undefined}
      className={cn(
        "grid size-[54px] cursor-pointer place-items-center rounded-full bg-white text-lilac-900 outline-none transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring active:scale-95",
        className,
      )}
    >
      <Heart aria-hidden className={cn("size-7", favorited && "fill-lilac-700")} strokeWidth={1.75} />
    </button>
  );
}
