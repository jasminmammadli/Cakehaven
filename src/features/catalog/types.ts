import type { Flavour, Shape } from "./filters";

export type Category = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
};

export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  ingredients: string;
  basePriceCents: number;
  imageUrl: string;
};

export type ProductDetail = ProductSummary & {
  description: string;
  shape: Shape;
  flavours: Flavour[];
  gallery: string[];
  category: { slug: string; name: string };
};

export type Collection = {
  slug: string;
  title: string;
  products: ProductSummary[];
};

export type ProductPage = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageCount: number;
};
