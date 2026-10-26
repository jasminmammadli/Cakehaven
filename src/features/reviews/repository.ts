import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

export type Review = {
  id: string;
  authorName: string;
  avatarUrl: string | null;
  body: string;
  likeCount: number;
  createdAt: string;
};

export const REVIEWS_PAGE_SIZE = 20;

export function reviewsTag(productId: string) {
  return `reviews:${productId}`;
}

export async function getReviews(productId: string): Promise<Review[]> {
  "use cache";
  cacheTag(reviewsTag(productId));
  cacheLife("minutes");

  const { data, error } = await createPublicClient()
    .from("reviews")
    .select("id, author_name, avatar_url, body, like_count, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(REVIEWS_PAGE_SIZE);

  if (error) throw new Error(`Failed to load reviews: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    authorName: row.author_name,
    avatarUrl: row.avatar_url,
    body: row.body,
    likeCount: row.like_count,
    createdAt: row.created_at,
  }));
}

/** Which of these reviews the signed-in user has liked (RLS limits rows to their own). */
export async function getLikedReviewIds(userId: string, reviewIds: string[]): Promise<Set<string>> {
  if (reviewIds.length === 0) return new Set();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_likes")
    .select("review_id")
    .eq("user_id", userId)
    .in("review_id", reviewIds);

  if (error) throw new Error(`Failed to load likes: ${error.message}`);
  return new Set(data.map((row) => row.review_id));
}
