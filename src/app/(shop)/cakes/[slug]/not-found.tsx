import Link from "next/link";
import { CakeSlice } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <CakeSlice aria-hidden className="size-16 text-lilac-800" strokeWidth={1.25} />
      <h1 className="text-display font-extrabold">Cake not found</h1>
      <p className="max-w-md text-body1 text-black-400">
        This cake is no longer on the menu, or the link is mistyped.
      </p>
      <Link href="/cakes" className={buttonVariants({ size: "md" })}>
        Browse cakes
      </Link>
    </div>
  );
}
