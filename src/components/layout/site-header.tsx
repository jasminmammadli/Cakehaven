import Link from "next/link";

import { getCategories } from "@/features/catalog/repository";

import { AccountButton, CartButton, MenuButton, MobileSearchToggle, type NavLink } from "./header-actions";
import { Logo } from "./logo";
import { SearchForm } from "./search-form";

async function getMenuLinks(): Promise<NavLink[]> {
  const categories = await getCategories();
  return [
    { href: "/", label: "Home" },
    { href: "/cakes", label: "All cakes" },
    ...categories.map((category) => ({
      href: `/cakes?category=${category.slug}`,
      label: `${category.name} cakes`,
    })),
    { href: "/design", label: "Design the cake" },
    { href: "/basket", label: "My basket" },
  ];
}

/** Figma "header" component (node 73:774): 60px bar with a 1px grey-300 rule. */
export async function SiteHeader() {
  const links = await getMenuLinks();

  return (
    <header className="relative z-30 border-b border-grey-300 bg-white md:pt-8">
      <div className="container-site flex h-[51px] items-center gap-6 md:h-[60px] md:pb-5 md:gap-[45px]">
        <Logo className="shrink-0" />
        <SearchForm className="hidden w-full max-w-[580px] md:block" />
        <nav aria-label="Shop" className="ml-auto flex items-center gap-2 md:gap-4 lg:gap-6">
          <Link
            href="/design"
            className="mr-2 hidden rounded-md text-body1 whitespace-nowrap text-black-500 outline-none hover:text-lilac-900 focus-visible:ring-3 focus-visible:ring-ring/60 lg:mr-6 lg:inline"
          >
            Design the cake
          </Link>
          <MobileSearchToggle />
          <span className="hidden md:inline-flex">
            <AccountButton />
          </span>
          <CartButton />
          <MenuButton links={links} />
        </nav>
      </div>
    </header>
  );
}
