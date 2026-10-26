import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { readBasket } from "@/features/basket/store";
import { CakeDesigner } from "@/features/designer/components/cake-designer";

export const metadata: Metadata = {
  title: "Design the cake",
  description: "Choose the size, sponge, filling, cream, decoration and message for your own cake.",
};

/** Basket "Edit" on a custom cake opens /design?edit=<lineId>. */
async function Designer({ searchParams }: PageProps<"/design">) {
  const { edit } = await searchParams;
  const line =
    typeof edit === "string"
      ? (await readBasket()).find((item) => item.id === edit && item.kind === "custom")
      : undefined;
  const editing = line?.kind === "custom" ? line : undefined;

  return <CakeDesigner key={editing?.id ?? "new"} initial={editing?.options} editLineId={editing?.id} />;
}

export default function DesignPage(props: PageProps<"/design">) {
  return (
    <div className="container-site pt-8 pb-20 md:pt-10 md:pb-[100px]">
      <Breadcrumbs items={[{ label: "Home page", href: "/" }, { label: "Category of cakes", href: "/cakes" }]} />
      <h1 className="mt-8 text-[28px] leading-9 font-extrabold md:mt-10 md:text-display">Order the cake</h1>
      <div className="mt-8 md:mt-8">
        <Suspense fallback={<Skeleton className="aspect-[1180/496] w-full rounded-none" />}>
          <Designer {...props} />
        </Suspense>
      </div>
    </div>
  );
}
