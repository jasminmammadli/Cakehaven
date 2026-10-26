import Image from "next/image";
import Link from "next/link";
import { MessageSquareHeart } from "lucide-react";

import { getCurrentUser } from "@/features/auth/session";

import { getLikedReviewIds, getReviews } from "../repository";
import { LikeButton } from "./like-button";
import { ReviewForm } from "./review-form";

function Avatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return <Image src={src} alt="" width={34} height={34} className="size-[34px] shrink-0 rounded-full object-cover" />;
  }
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span aria-hidden className="grid size-[34px] shrink-0 place-items-center rounded-full bg-lilac-400 text-caption font-extrabold text-lilac-950">
      {initials}
    </span>
  );
}

/** Figma "Comment" blocks (node 105:2862): Roboto 14/22, 34px avatar, like count. */
export async function ReviewsSection({ productId, slug }: { productId: string; slug: string }) {
  const [reviews, user] = await Promise.all([getReviews(productId), getCurrentUser()]);
  const liked = user ? await getLikedReviewIds(user.id, reviews.map((review) => review.id)) : new Set<string>();

  return (
    <section aria-labelledby="reviews-title" className="w-full md:max-w-[680px]">
      <h2 id="reviews-title" className="sr-only">
        Reviews
      </h2>

      {reviews.length === 0 ? (
        <p className="flex items-center gap-3 py-6 text-body1 text-black-400">
          <MessageSquareHeart aria-hidden className="size-6 text-lilac-800" />
          No reviews yet. Be the first to share how it tasted!
        </p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id} className="flex gap-5 border-b border-[rgb(231_231_231/0.4)] py-6">
              <Avatar name={review.authorName} src={review.avatarUrl} />
              <article className="flex min-w-0 flex-1 flex-col gap-2 font-review text-body2 text-review">
                <h3 className="font-medium">{review.authorName}</h3>
                <p className="break-words whitespace-pre-line">{review.body}</p>
                <div>
                  <LikeButton
                    reviewId={review.id}
                    productId={productId}
                    authorName={review.authorName}
                    initialLiked={liked.has(review.id)}
                    initialCount={review.likeCount}
                  />
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <ReviewForm productId={productId} />
      ) : (
        <p className="mt-10 rounded-pill border border-black-300 px-5 py-5 text-body1 text-black-400">
          <Link
            href={`/login?next=${encodeURIComponent(`/cakes/${slug}`)}`}
            className="font-extrabold text-lilac-900 underline-offset-4 hover:underline"
          >
            Log in
          </Link>{" "}
          to add a comment.
        </p>
      )}
    </section>
  );
}
