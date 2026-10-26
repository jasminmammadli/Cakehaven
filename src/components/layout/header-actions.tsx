"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/features/auth/actions";
import { useViewerContext } from "@/features/auth/viewer-context";
import { cn } from "@/lib/utils";

import { SearchForm } from "./search-form";

const iconButton =
  "relative inline-flex size-10 items-center justify-center rounded-full text-black-500 outline-none transition-colors hover:bg-lilac-100 focus-visible:ring-3 focus-visible:ring-ring/60 [&_svg]:size-6";

export type NavLink = { href: string; label: string };

export function AccountButton() {
  const { viewer } = useViewerContext();

  if (!viewer?.user) {
    return (
      <Link href="/login" className={iconButton} aria-label="Log in">
        <User strokeWidth={1.75} />
      </Link>
    );
  }

  const { user } = viewer;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={iconButton} aria-label="Account menu">
        <User strokeWidth={1.75} />
        <span aria-hidden className="absolute top-1.5 right-1.5 size-2 rounded-full bg-lilac-700" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-body2">
            <span className="block font-extrabold text-black-500">{user.fullName || "Signed in"}</span>
            <span className="block truncate text-grey-800">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void signOut();
          }}
        >
          <LogOut aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CartButton() {
  const { viewer } = useViewerContext();
  const count = viewer?.basketCount ?? 0;

  return (
    <Link
      href="/basket"
      className={iconButton}
      aria-label={count > 0 ? `Basket, ${count} ${count === 1 ? "item" : "items"}` : "Basket"}
    >
      <ShoppingCart strokeWidth={1.75} />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-lilac-800 px-1 text-caption leading-5 text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function MobileSearchToggle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(iconButton, "md:hidden")}
        aria-label={open ? "Close search" : "Open search"}
        aria-expanded={open}
        aria-controls="mobile-search"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X strokeWidth={1.75} /> : <Search strokeWidth={1.75} />}
      </button>
      {open && (
        <div id="mobile-search" className="absolute inset-x-0 top-full z-40 border-b border-grey-300 bg-white px-5 py-3 md:hidden">
          <SearchForm autoFocus />
        </div>
      )}
    </>
  );
}

export function MenuButton({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const { viewer } = useViewerContext();
  const user = viewer?.user;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={iconButton} aria-label="Open menu">
        <Menu strokeWidth={1.75} />
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] gap-0 bg-white p-0">
        <SheetTitle className="border-b border-grey-300 px-6 py-5 text-h3 font-extrabold text-black-500">
          Menu
        </SheetTitle>
        <nav aria-label="Main" className="flex flex-col overflow-y-auto py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-6 py-3 text-h3 font-normal text-black-500 outline-none hover:bg-lilac-50 focus-visible:bg-lilac-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-grey-300 px-6 py-5">
          {user ? (
            <div className="flex flex-col gap-3">
              <p className="truncate text-body2 text-grey-800">Signed in as {user.email}</p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="inline-flex items-center gap-2 self-start rounded-md text-body1 text-black-500 outline-none hover:text-lilac-900 focus-visible:ring-3 focus-visible:ring-ring/60"
              >
                <LogOut aria-hidden className="size-5" /> Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-md text-body1 text-black-500 outline-none hover:text-lilac-900 focus-visible:ring-3 focus-visible:ring-ring/60"
            >
              <User aria-hidden className="size-5" /> Log in or sign up
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
