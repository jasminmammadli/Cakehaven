import type { ProductSummary } from "@/features/catalog/types";
import { describeDesign, designerPrice } from "@/features/designer/options";

import { computeTotals, lineTotal, priceForWeight, weightLabel, type Totals } from "./pricing";
import type { BasketLine, CustomLine, ProductLine } from "./schema";

export const CUSTOM_CAKE_NAME = "Custom cake";
export const CUSTOM_CAKE_IMAGE = "/images/design-preview.png";

export type PricedLine = {
  id: string;
  kind: BasketLine["kind"];
  productId: string | null;
  name: string;
  description: string;
  imageUrl: string;
  editHref: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  /** Persisted on the order item for fulfilment. */
  details: Record<string, string>;
};

export type BasketView = {
  lines: PricedLine[];
  itemCount: number;
  promo: { code: string; percentOff: number } | null;
  totals: Totals;
};

function priceProductLine(line: ProductLine, product: ProductSummary): PricedLine {
  const unitPriceCents = priceForWeight(product.basePriceCents, line.weight);
  const details: Record<string, string> = { weight: weightLabel(line.weight) };
  if (line.message) details.message = line.message;

  return {
    id: line.id,
    kind: "product",
    productId: product.id,
    name: product.name,
    description: [product.ingredients, weightLabel(line.weight), line.message && `“${line.message}”`]
      .filter(Boolean)
      .join(" · "),
    imageUrl: product.imageUrl,
    editHref: `/cakes/${product.slug}?edit=${line.id}`,
    unitPriceCents,
    quantity: line.quantity,
    lineTotalCents: lineTotal(unitPriceCents, line.quantity),
    details,
  };
}

function priceCustomLine(line: CustomLine): PricedLine {
  const unitPriceCents = designerPrice(line.options);
  return {
    id: line.id,
    kind: "custom",
    productId: null,
    name: CUSTOM_CAKE_NAME,
    description: describeDesign(line.options),
    imageUrl: CUSTOM_CAKE_IMAGE,
    editHref: `/design?edit=${line.id}`,
    unitPriceCents,
    quantity: line.quantity,
    lineTotalCents: lineTotal(unitPriceCents, line.quantity),
    details: { ...line.options },
  };
}

/**
 * Prices basket lines against current product data. Lines whose product no
 * longer exists (deleted or deactivated) are dropped.
 */
export function buildBasketView(
  lines: BasketLine[],
  products: ProductSummary[],
  promo: BasketView["promo"],
): BasketView {
  const byId = new Map(products.map((product) => [product.id, product]));

  const priced = lines.flatMap((line) => {
    if (line.kind === "custom") return [priceCustomLine(line)];
    const product = byId.get(line.productId);
    return product ? [priceProductLine(line, product)] : [];
  });

  return {
    lines: priced,
    itemCount: priced.reduce((sum, line) => sum + line.quantity, 0),
    promo,
    totals: computeTotals(
      priced.map((line) => line.lineTotalCents),
      promo?.percentOff ?? null,
    ),
  };
}
