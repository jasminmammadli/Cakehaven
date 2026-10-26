import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

/** Figma "breadcrumbs" (node 149:2224): grey-800 Body1 with 24px chevrons. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body2 text-grey-800 md:text-body1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-4">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm outline-none hover:text-black-500 focus-visible:ring-3 focus-visible:ring-ring/60"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
              {!isLast && <ChevronRight aria-hidden className="size-6 text-black-500" strokeWidth={1.5} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
