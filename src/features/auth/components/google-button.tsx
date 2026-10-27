"use client";

import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";

import { signInWithGoogle } from "../actions";

/** "or" divider and the Google button; one flow covers both sign-up and log-in. */
export function GoogleButton({ next }: { next: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-5 text-body1 text-black" role="separator" aria-label="or">
        <span aria-hidden className="h-px flex-1 bg-grey-300" />
        <span aria-hidden>or</span>
        <span aria-hidden className="h-px flex-1 bg-grey-300" />
      </div>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={() =>
          startTransition(async () => {
            // On success the action redirects to Google.
            const result = await signInWithGoogle(next);
            if (!result.ok) toast.error(result.error);
          })
        }
        className="flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-pill border border-black text-body1 text-black outline-none transition-colors hover:bg-lilac-50 focus-visible:ring-3 focus-visible:ring-ring/60 disabled:cursor-progress disabled:opacity-60"
      >
        <Image src="/icons/google.svg" alt="" width={28} height={28} className="size-7" />
        {pending ? "Redirecting to Google…" : "Continue with Google"}
      </button>
    </div>
  );
}
