import { z } from "zod";

/**
 * Option catalogue for "Design the cake". Figma only shows the cream options
 * (vanilla, chocolate, cocoa, fruit, dry fruit) and a total of $80; the other
 * tabs and all prices are product assumptions. The defaults add up to $80.
 */
export const DESIGNER_GROUPS = [
  {
    key: "size",
    label: "size",
    options: [
      { value: "0.5kg", label: "0.5 kg", priceCents: 4000 },
      { value: "1kg", label: "1 kg", priceCents: 6000 },
      { value: "2kg", label: "2 kg", priceCents: 9500 },
      { value: "3kg", label: "3 kg", priceCents: 13000 },
    ],
  },
  {
    key: "sponge",
    label: "ingredients",
    options: [
      { value: "vanilla", label: "vanilla", priceCents: 0 },
      { value: "chocolate", label: "chocolate", priceCents: 0 },
      { value: "red-velvet", label: "red velvet", priceCents: 500 },
      { value: "lemon", label: "lemon", priceCents: 300 },
      { value: "carrot", label: "carrot", priceCents: 400 },
    ],
  },
  {
    key: "filling",
    label: "filling",
    options: [
      { value: "strawberry", label: "strawberry", priceCents: 500 },
      { value: "caramel", label: "caramel", priceCents: 500 },
      { value: "ganache", label: "ganache", priceCents: 600 },
      { value: "cream-cheese", label: "cream cheese", priceCents: 600 },
      { value: "none", label: "no filling", priceCents: 0 },
    ],
  },
  {
    key: "cream",
    label: "cream",
    options: [
      { value: "vanilla", label: "vanilla", priceCents: 0 },
      { value: "chocolate", label: "chocolate", priceCents: 500 },
      { value: "cocoa", label: "cocoa", priceCents: 500 },
      { value: "fruit", label: "fruit", priceCents: 600 },
      { value: "dry-fruit", label: "dry fruit", priceCents: 800 },
    ],
  },
  {
    key: "decor",
    label: "decor",
    options: [
      { value: "chocolate-shavings", label: "chocolate shavings", priceCents: 1000 },
      { value: "berries", label: "fresh berries", priceCents: 1200 },
      { value: "sprinkles", label: "sprinkles", priceCents: 400 },
      { value: "macarons", label: "macarons", priceCents: 1500 },
      { value: "none", label: "no decor", priceCents: 0 },
    ],
  },
] as const;

export type DesignerGroup = (typeof DESIGNER_GROUPS)[number];
export type DesignerGroupKey = DesignerGroup["key"];

type OptionValue<K extends DesignerGroupKey> = Extract<
  DesignerGroup,
  { key: K }
>["options"][number]["value"];

function optionEnum<K extends DesignerGroupKey>(key: K) {
  const group = DESIGNER_GROUPS.find((g) => g.key === key)!;
  const values = group.options.map((o) => o.value) as [OptionValue<K>, ...OptionValue<K>[]];
  return z.enum(values);
}

export const CAKE_TEXT_MAX = 40;

export const designerOptionsSchema = z.object({
  size: optionEnum("size"),
  sponge: optionEnum("sponge"),
  filling: optionEnum("filling"),
  cream: optionEnum("cream"),
  decor: optionEnum("decor"),
  text: z.string().trim().max(CAKE_TEXT_MAX).default(""),
});

export type DesignerOptions = z.infer<typeof designerOptionsSchema>;

export const DEFAULT_DESIGN: DesignerOptions = {
  size: "1kg",
  sponge: "chocolate",
  filling: "caramel",
  cream: "chocolate",
  decor: "chocolate-shavings",
  text: "",
};

function findOption(key: DesignerGroupKey, value: string) {
  const group = DESIGNER_GROUPS.find((g) => g.key === key);
  const option = group?.options.find((o) => o.value === value);
  if (!option) throw new Error(`Unknown designer option ${key}=${value}`);
  return option;
}

export function designerPrice(options: DesignerOptions): number {
  return DESIGNER_GROUPS.reduce(
    (sum, group) => sum + findOption(group.key, options[group.key]).priceCents,
    0,
  );
}

/** Human-readable summary, e.g. "1 kg, chocolate sponge, caramel filling, …". */
export function describeDesign(options: DesignerOptions): string {
  const parts = [
    findOption("size", options.size).label,
    `${findOption("sponge", options.sponge).label} sponge`,
    options.filling === "none" ? null : `${findOption("filling", options.filling).label} filling`,
    `${findOption("cream", options.cream).label} cream`,
    options.decor === "none" ? null : findOption("decor", options.decor).label,
    options.text ? `“${options.text}”` : null,
  ];
  return parts.filter(Boolean).join(", ");
}
