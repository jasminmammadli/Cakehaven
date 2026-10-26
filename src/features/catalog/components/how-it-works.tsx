import Image from "next/image";

const STEPS = [
  {
    icon: "/icons/how-cake.svg",
    title: "personalisable cakes",
    text: "with over 2,000 different designs, you'll be spoilt for choice!",
  },
  {
    icon: "/icons/how-eco.svg",
    title: "eco friendly",
    text: "we're doing our part to save the world so you won't find any non-recyclable packaging here!",
  },
  {
    icon: "/icons/how-box.svg",
    title: "through the letterbox",
    text: "all our letterbox gift cakes can be sent posted straight through their letterbox, no signature needed!",
  },
];

/** Figma "Frame 120": three centred columns on desktop, icon + text rows on mobile. */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="container-site">
      <h2 id="how-title" className="mb-8 text-h2 font-extrabold md:mb-9 md:text-center md:text-h1">
        How it works
      </h2>
      <ul className="flex flex-col gap-7 md:grid md:grid-cols-3 md:gap-[19px]">
        {STEPS.map((step) => (
          <li key={step.title} className="flex gap-[42px] md:flex-col md:items-center md:gap-[22px] md:text-center">
            <Image src={step.icon} alt="" width={48} height={48} className="size-[52px] shrink-0 md:size-12" />
            <div className="flex flex-col gap-2 md:gap-[22px]">
              <h3 className="text-h3 font-extrabold">{step.title}</h3>
              <p className="max-w-[380px] text-body1 text-black-400 md:leading-[27px]">{step.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
