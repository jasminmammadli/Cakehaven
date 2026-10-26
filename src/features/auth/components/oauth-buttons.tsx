"use client";

import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";

import { signInWithOAuth } from "../actions";
import type { OAuthProvider } from "../schemas";

const PROVIDERS: { id: OAuthProvider; label: string; icon: string }[] = [
  { id: "google", label: "Continue with Google", icon: "/icons/google.svg" },
  { id: "facebook", label: "Continue with Facebook", icon: "/icons/facebook-auth.svg" },
];

/** "or" divider and the two 220x64 social buttons from the Figma auth card. */
export function OAuthButtons({ next }: { next: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-5 text-body1 text-black" role="separator" aria-label="or">
        <span aria-hidden className="h-px flex-1 bg-grey-300" />
        <span aria-hidden>or</span>
        <span aria-hidden className="h-px flex-1 bg-grey-300" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            disabled={pending}
            aria-label={provider.label}
            onClick={() =>
              startTransition(async () => {
                // On success the action redirects to the provider.
                const result = await signInWithOAuth(provider.id, next);
                if (!result.ok) toast.error(result.error);
              })
            }
            className="grid h-16 cursor-pointer place-items-center rounded-pill border border-black outline-none transition-colors hover:bg-lilac-50 focus-visible:ring-3 focus-visible:ring-ring/60 disabled:cursor-progress disabled:opacity-60"
          >
            <Image src={provider.icon} alt="" width={28} height={28} className="size-7" />
          </button>
        ))}
      </div>
    </div>
  );
}
