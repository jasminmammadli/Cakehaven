import Link from "next/link";
import { CakeSlice } from "lucide-react";

import { Shell } from "@/components/layout/shell";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Shell>
      <div className="container-site flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
        <CakeSlice aria-hidden className="size-16 text-lilac-800" strokeWidth={1.25} />
        <h1 className="text-display font-extrabold">Page not found</h1>
        <p className="max-w-md text-body1 text-black-400">
          We couldn’t find that page. It may have been moved, or the cake is no longer on the menu.
        </p>
        <Link href="/cakes" className={buttonVariants({ size: "md" })}>
          Browse cakes
        </Link>
      </div>
    </Shell>
  );
}
