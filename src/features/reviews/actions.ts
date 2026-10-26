"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/features/auth/session";
import { authRequired, invalidInput, type ActionResult } from "@/lib/action-result";
import { createClient } from "@/lib/supabase/server";

import { reviewsTag } from "./repository";

const reviewSchema = z.object({
  productId: z.uuid(),
  body: z
    .string()
    .trim()
    .min(3, "Write at least 3 characters.")
    .max(1000, "Reviews can be up to 1000 characters."),
});

export async function addReview(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    body: formData.get("body") ?? "",
  });
  if (!parsed.success) return invalidInput(parsed.error, parsed.error.issues[0]?.message);

  const user = await getCurrentUser();
  if (!user) return authRequired();

  const supabase = await createClient();
  // author_name, avatar, like count and timestamp are set by a database trigger.
  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.productId,
    user_id: user.id,
    author_name: user.fullName || "CakeHaven customer",
    body: parsed.data.body,
  });

  if (error) {
    const message = error.code === "23503" ? "This cake is no longer available." : "Could not post your review. Please try again.";
    return { ok: false, error: message };
  }

  updateTag(reviewsTag(parsed.data.productId));
  return { ok: true };
}

const likeSchema = z.object({ reviewId: z.uuid(), productId: z.uuid() });

export async function toggleReviewLike(
  input: z.input<typeof likeSchema>,
): Promise<ActionResult<{ liked: boolean }>> {
  const parsed = likeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Unknown review." };

  const user = await getCurrentUser();
  if (!user) return authRequired();

  const supabase = await createClient();
  const { reviewId, productId } = parsed.data;

  const { data: deleted, error: deleteError } = await supabase
    .from("review_likes")
    .delete()
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .select("review_id");
  if (deleteError) return { ok: false, error: "Could not update your like. Please try again." };

  let liked = false;
  if (deleted.length === 0) {
    const { error } = await supabase.from("review_likes").insert({ review_id: reviewId, user_id: user.id });
    if (error) return { ok: false, error: "Could not update your like. Please try again." };
    liked = true;
  }

  updateTag(reviewsTag(productId));
  return { ok: true, data: { liked } };
}
