"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-site flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <TriangleAlert aria-hidden className="size-14 text-lilac-800" strokeWidth={1.25} />
      <h1 className="text-h1 font-extrabold">Something went wrong</h1>
      <p className="max-w-md text-body1 text-black-400">
        We couldn’t load this page. Please try again in a moment.
        {error.digest && <span className="mt-2 block text-caption text-grey-700">Reference: {error.digest}</span>}
      </p>
      <div className="flex gap-4">
        <Button size="md" onClick={reset}>
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "md" })}>
          Go home
        </Link>
      </div>
    </div>
  );
}
