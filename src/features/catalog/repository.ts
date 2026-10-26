import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { createPublicClient } from "@/lib/supabase/public";

import { PAGE_SIZE, type CatalogFilters, type Flavour, type Shape } from "./filters";
import type { Category, Collection, ProductDetail, ProductPage, ProductSummary } from "./types";

// Public catalogue reads. Cached across requests and invalidated with the
// "catalog" tag; they use the cookie-less anon client, so RLS still applies.

export const CATALOG_TAG = "catalog";

const SUMMARY_COLUMNS = "id, slug, name, ingredients, base_price_cents, image_url";

type SummaryRow = {
  id: string;
  slug: string;
  name: string;
  ingredients: string;
  base_price_cents: number;
  image_url: string;
};

function toSummary(row: SummaryRow): ProductSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    ingredients: row.ingredients,
    basePriceCents: row.base_price_cents,
    imageUrl: row.image_url,
  };
}

function fail(context: string, error: { message: string }): never {
  throw new Error(`${context}: ${error.message}`);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient()
    .from("categories")
    .select("id, slug, name, image_url")
    .order("sort_order");

  if (error) fail("Failed to load categories", error);
  return data.map((row) => ({ id: row.id, slug: row.slug, name: row.name, imageUrl: row.image_url }));
}

export async function getCollections(slugs: string[]): Promise<Collection[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient()
    .from("collections")
    .select(`slug, title, sort_order, collection_products ( position, products ( ${SUMMARY_COLUMNS} ) )`)
    .in("slug", slugs)
    .order("sort_order")
    .order("position", { referencedTable: "collection_products" });

  if (error) fail("Failed to load collections", error);

  const bySlug = new Map(
    data.map((collection) => [
      collection.slug,
      {
        slug: collection.slug,
        title: collection.title,
        // Inactive products are hidden by RLS and come back as null.
        products: collection.collection_products
          .map((entry) => entry.products)
          .filter((product): product is SummaryRow => product !== null)
          .map(toSummary),
      },
    ]),
  );

  return slugs.map((slug) => bySlug.get(slug)).filter((c): c is Collection => Boolean(c));
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient()
    .from("products")
    .select(`${SUMMARY_COLUMNS}, description, shape, flavours, gallery, categories ( slug, name )`)
    .eq("slug", slug)
    .maybeSingle();

  if (error) fail("Failed to load product", error);
  if (!data) return null;

  return {
    ...toSummary(data),
    description: data.description,
    shape: data.shape as Shape,
    flavours: data.flavours as Flavour[],
    gallery: data.gallery,
    category: { slug: data.categories.slug, name: data.categories.name },
  };
}

/** Looks up products for basket lines. Missing/inactive ids are simply absent. */
export async function getProductsByIds(ids: string[]): Promise<ProductSummary[]> {
  if (ids.length === 0) return [];
  return getProductsByIdsCached([...new Set(ids)].sort());
}

async function getProductsByIdsCached(ids: string[]): Promise<ProductSummary[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient()
    .from("products")
    .select(SUMMARY_COLUMNS)
    .in("id", ids);

  if (error) fail("Failed to load basket products", error);
  return data.map(toSummary);
}

/** Escapes LIKE wildcards so user input is matched literally. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function searchProducts(filters: CatalogFilters): Promise<ProductPage> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const from = (filters.page - 1) * PAGE_SIZE;

  let query = createPublicClient()
    .from("products")
    .select(`${SUMMARY_COLUMNS}, categories!inner ( slug )`, { count: "exact" });

  if (filters.category) query = query.eq("categories.slug", filters.category);
  if (filters.q) query = query.ilike("name", `%${escapeLike(filters.q)}%`);
  if (filters.min !== undefined) query = query.gte("base_price_cents", filters.min * 100);
  if (filters.max !== undefined) query = query.lte("base_price_cents", filters.max * 100);
  if (filters.shape.length) query = query.in("shape", filters.shape);
  if (filters.flavour.length) query = query.overlaps("flavours", filters.flavour);

  const { data, error, count } = await query
    .order("name")
    .range(from, from + PAGE_SIZE - 1);

  if (error) fail("Failed to search products", error);

  const total = count ?? 0;
  return {
    items: data.map(toSummary),
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
