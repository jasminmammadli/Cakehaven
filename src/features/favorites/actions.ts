"use server";

import { z } from "zod";

import { getCurrentUser } from "@/features/auth/session";
import { authRequired, type ActionResult } from "@/lib/action-result";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(productId: string): Promise<ActionResult<{ favorited: boolean }>> {
  const parsed = z.uuid().safeParse(productId);
  if (!parsed.success) return { ok: false, error: "Unknown cake." };

  const user = await getCurrentUser();
  if (!user) return authRequired();

  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", parsed.data)
    .maybeSingle();
  if (readError) return { ok: false, error: "Could not update favourites. Please try again." };

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", parsed.data);
    if (error) return { ok: false, error: "Could not update favourites. Please try again." };
    return { ok: true, data: { favorited: false } };
  }

  const { error } = await supabase.from("favorites").insert({ user_id: user.id, product_id: parsed.data });
  if (error) {
    // A foreign-key violation means the product does not exist.
    const message = error.code === "23503" ? "This cake is no longer available." : "Could not update favourites. Please try again.";
    return { ok: false, error: message };
  }
  return { ok: true, data: { favorited: true } };
}
