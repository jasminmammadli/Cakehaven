import "server-only";

import { readBasket } from "@/features/basket/store";
import { createClient } from "@/lib/supabase/server";

import { getCurrentUser, type Viewer } from "./session";

export type ViewerState = {
  user: Viewer | null;
  basketCount: number;
  favoriteIds: string[];
};

/** Per-visitor state for the header and heart buttons. Reads cookies. */
export async function getViewerState(): Promise<ViewerState> {
  const [user, lines] = await Promise.all([getCurrentUser(), readBasket()]);
  const basketCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  if (!user) return { user: null, basketCount, favoriteIds: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id)
    .limit(500);

  // Favourites are decorative here; a failed read should not break the page.
  if (error) console.error("Failed to load favourites", error.message);

  return { user, basketCount, favoriteIds: (data ?? []).map((row) => row.product_id) };
}
