import Image from "next/image";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// The design's rows carry a ↗ arrow but no destination screens exist, so each
// row expands to a short answer (see docs/figma-analysis.md §6).
const ITEMS = [
  {
    question: "Why choose CakeHaven for online cakes",
    answer:
      "Every cake is baked to order by our pastry team, decorated by hand and delivered fresh. Pick from hundreds of designs or build your own from scratch.",
  },
  {
    question: "Buy a variety of bakery items online",
    answer:
      "Beyond celebration cakes we bake brownies, cupcakes and cheesecakes. Browse them by category or use the filters to find a flavour you love.",
  },
  {
    question: "Order cakes with CakeHaven’s specials",
    answer:
      "Watch for seasonal specials and promo codes. Enter a code in your basket and the discount is applied before checkout.",
  },
  {
    question: "FAQs about online cake delivery",
    answer:
      "Orders placed before noon can be delivered the next day. Letterbox cakes need no signature; larger cakes are delivered by hand to your door or office.",
  },
];

/** Thin ↗ arrow whose head barbs curve back toward the shaft. */
function SwooshArrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5.5 18.5 18 6" />
      <path d="M11 6.8C13.6 6.4 16 6.1 18 6c-.1 2-.4 4.4-.8 7" />
    </svg>
  );
}

/** Figma "About us" (node 48:688): 544x360 photo + list of 88px rows. */
export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="container-site scroll-mt-24">
      <h2 id="about-title" className="mb-3 text-h2 font-extrabold md:mb-8 md:text-h1">
        About us
      </h2>
      <div className="flex flex-col gap-[63px] md:flex-row md:items-start">
        <div className="relative hidden aspect-[544/360] w-[544px] shrink-0 overflow-hidden md:block">
          <Image
            src="/images/about.png"
            alt="Strawberry cupcakes with white chocolate drizzle"
            fill
            sizes="544px"
            className="object-cover"
          />
        </div>
        <Accordion className="flex-1">
          {ITEMS.map((item) => (
            <AccordionItem key={item.question} value={item.question} className="border-b border-grey-600">
              <AccordionTrigger hideIcon className="group/about flex min-h-[70px] w-full items-center justify-between gap-6 py-3 text-left text-body1 font-normal hover:no-underline md:min-h-[88px] md:text-h3">
                <span className="max-w-[380px]">{item.question}</span>
                <SwooshArrow className="size-7 shrink-0 text-black-500 transition-transform duration-200 group-hover/about:-translate-y-0.5 group-hover/about:translate-x-0.5 group-aria-expanded/about:rotate-90 md:size-8" />
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-body1 text-black-400">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
