import { z } from "zod";

export const SHAPES = [
  { value: "round", label: "Round" },
  { value: "square", label: "Square" },
  { value: "heart", label: "Heart-shaped" },
  { value: "cupcake", label: "Cupcake/Muffin" },
] as const;

export const FLAVOURS = [
  { value: "caramel", label: "Caramel" },
  { value: "cheese", label: "Cheese" },
  { value: "white-chocolate", label: "White chocolate" },
  { value: "fruits", label: "Fruits" },
  { value: "kit-kat", label: "Kit kat" },
  { value: "vanilla", label: "Vanilla" },
  { value: "hazelnut", label: "Hazelnut" },
  { value: "dark-chocolate", label: "Dark chocolate" },
  { value: "red-velvet", label: "Red Velvet" },
  { value: "snickers", label: "Snickers" },
] as const;

export type Shape = (typeof SHAPES)[number]["value"];
export type Flavour = (typeof FLAVOURS)[number]["value"];

/** Upper bound of the price slider, in dollars ("1000+" in the design). */
export const PRICE_SLIDER_MAX = 1000;
export const PAGE_SIZE = 12;

const shapeValues = SHAPES.map((s) => s.value) as [Shape, ...Shape[]];
const flavourValues = FLAVOURS.map((f) => f.value) as [Flavour, ...Flavour[]];

/** Comma-separated multi-value param; unknown values are dropped, not errors. */
function csvOf<T extends string>(values: readonly [T, ...T[]]) {
  return z
    .string()
    .optional()
    .transform((raw) =>
      (raw ?? "")
        .split(",")
        .filter((v): v is T => (values as readonly string[]).includes(v)),
    );
}

const dollars = z.coerce.number().int().min(0).max(PRICE_SLIDER_MAX).optional().catch(undefined);

export const catalogFiltersSchema = z.object({
  category: z.string().regex(/^[a-z0-9-]{1,40}$/).optional().catch(undefined),
  q: z.string().trim().max(60).optional().catch(undefined).transform((v) => v || undefined),
  min: dollars,
  max: dollars,
  shape: csvOf(shapeValues),
  flavour: csvOf(flavourValues),
  page: z.coerce.number().int().min(1).max(500).catch(1).default(1),
});

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;

type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseCatalogFilters(searchParams: RawSearchParams): CatalogFilters {
  const first = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return catalogFiltersSchema.parse({
    category: first("category"),
    q: first("q"),
    min: first("min"),
    max: first("max"),
    shape: first("shape"),
    flavour: first("flavour"),
    page: first("page"),
  });
}

/** True when the visitor narrowed the catalogue (anything beyond "All Cakes"). */
export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.category ||
      filters.q ||
      filters.min !== undefined ||
      filters.max !== undefined ||
      filters.shape.length ||
      filters.flavour.length,
  );
}

export function countRefinements(filters: CatalogFilters): number {
  return (
    (filters.min !== undefined || filters.max !== undefined ? 1 : 0) +
    filters.shape.length +
    filters.flavour.length
  );
}

/** Builds a /cakes URL, dropping empty values and resetting to page 1 unless given. */
export function catalogHref(filters: Partial<CatalogFilters>): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.q) params.set("q", filters.q);
  if (filters.min !== undefined) params.set("min", String(filters.min));
  if (filters.max !== undefined) params.set("max", String(filters.max));
  if (filters.shape?.length) params.set("shape", filters.shape.join(","));
  if (filters.flavour?.length) params.set("flavour", filters.flavour.join(","));
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `/cakes?${query}` : "/cakes";
}
