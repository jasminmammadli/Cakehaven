import Image from "next/image";
import Link from "next/link";

import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/constants";

import { CopyrightYear } from "./copyright-year";

const NAV = [
  { href: "/#about", label: "About" },
  { href: "/cakes", label: "Gallery" },
  { href: "/cakes?category=birthday", label: "Category" },
  { href: "/design", label: "Design the cake" },
  { href: "/cakes#sweet-success", label: "Best sellers" },
];

const COLUMNS = [
  {
    title: "Cakes",
    links: [
      { href: "/cakes?flavour=fruits", label: "Fruit cake" },
      { href: "/cakes?flavour=snickers", label: "Snickers cake" },
      { href: "/cakes?category=brownies", label: "Brownies" },
      { href: "/cakes?category=cupcakes", label: "Cupcakes" },
    ],
  },
  {
    title: "Type",
    links: [
      { href: "/cakes?category=birthday", label: "Birthday" },
      { href: "/cakes?category=wedding", label: "Wedding" },
      { href: "/cakes?category=anniversary", label: "Anniversary" },
    ],
  },
  {
    title: "Design the cake",
    links: [
      { href: "/cakes#designer-cakes", label: "Designer cake" },
      { href: "/design", label: "Design your own" },
    ],
  },
];

const linkClass =
  "rounded-sm outline-none transition-colors hover:text-lilac-900 focus-visible:ring-3 focus-visible:ring-ring/60";

/** Figma "Group 36" (desktop) and "mobile footer" (393px). */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-grey-300 bg-white text-black-500">
      {/* Primary navigation row */}
      <nav aria-label="Footer" className="border-b-2 border-grey-300">
        <ul className="container-site grid grid-cols-2 gap-x-6 gap-y-[30px] py-10 text-[18px] leading-6 md:flex md:justify-between md:gap-6 md:py-[42px] md:text-h2">
          {NAV.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Link columns separated by vertical rules */}
      <div className="md:grid md:grid-cols-[1fr_1.27fr_1fr]">
        {COLUMNS.map((column, index) => (
          <div
            key={column.title}
            className={
              index === 0
                ? "container-site py-8 md:mx-0 md:max-w-none md:py-[42px] md:pr-0 md:pl-[max(1.25rem,calc((100vw-1180px)/2))]"
                : "hidden md:flex md:justify-center md:border-l-2 md:border-grey-300 md:py-[42px] md:last:justify-end md:last:pr-[max(1.25rem,calc((100vw-1180px)/2))]"
            }
          >
            <div>
              <h2 className="text-[18px] leading-7 md:text-h3">{column.title}</h2>
              <ul className="mt-[26px] flex flex-col gap-[26px] text-[18px] leading-7 font-extralight md:text-h3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Contact row */}
      <div className="mx-[10px] border-t-2 border-grey-300">
        <div className="container-site flex flex-col items-center gap-6 py-6 md:flex-row md:justify-between md:py-5">
          <ul className="order-1 flex items-center gap-10 md:order-3 md:gap-[30px]">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`CakeHaven on ${social.label}`}
                  className={`${linkClass} block`}
                >
                  <Image src={social.icon} alt="" width={27} height={27} className="size-[27px]" />
                </a>
              </li>
            ))}
          </ul>
          <a href={`mailto:${CONTACT_EMAIL}`} className={`${linkClass} order-2 text-body1 md:order-1 md:text-h3`}>
            {CONTACT_EMAIL}
          </a>
          <p className="order-3 flex items-center gap-2 text-body1 font-extralight md:order-2">
            <span aria-hidden>®</span> <CopyrightYear /> All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
