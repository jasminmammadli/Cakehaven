import { describe, expect, it } from "vitest";

import { safeNextPath } from "@/features/auth/redirect";
import { catalogHref, hasActiveFilters, parseCatalogFilters } from "@/features/catalog/filters";

describe("parseCatalogFilters", () => {
  it("parses valid params", () => {
    const filters = parseCatalogFilters({
      category: "birthday",
      q: " berry ",
      min: "10",
      max: "80",
      shape: "round,heart",
      flavour: "vanilla,fruits",
      page: "2",
    });
    expect(filters).toEqual({
      category: "birthday",
      q: "berry",
      min: 10,
      max: 80,
      shape: ["round", "heart"],
      flavour: ["vanilla", "fruits"],
      page: 2,
    });
  });

  it("drops invalid values instead of failing", () => {
    const filters = parseCatalogFilters({
      category: "../etc",
      min: "-5",
      max: "abc",
      shape: "round,triangle",
      flavour: "mustard",
      page: "0",
    });
    expect(filters).toMatchObject({ category: undefined, min: undefined, max: undefined, shape: ["round"], flavour: [], page: 1 });
  });

  it("uses the first value of repeated params", () => {
    expect(parseCatalogFilters({ category: ["wedding", "birthday"] }).category).toBe("wedding");
  });

  it("knows when the visitor narrowed the catalogue", () => {
    expect(hasActiveFilters(parseCatalogFilters({}))).toBe(false);
    expect(hasActiveFilters(parseCatalogFilters({ flavour: "vanilla" }))).toBe(true);
  });
});

describe("catalogHref", () => {
  it("serialises filters and omits empties", () => {
    expect(catalogHref({})).toBe("/cakes");
    expect(catalogHref({ category: "wedding", shape: ["round"], flavour: [], page: 1 })).toBe(
      "/cakes?category=wedding&shape=round",
    );
    expect(catalogHref({ min: 0, page: 3 })).toBe("/cakes?min=0&page=3");
  });
});

describe("safeNextPath", () => {
  it("allows same-origin relative paths", () => {
    expect(safeNextPath("/cakes/very-berry?edit=1")).toBe("/cakes/very-berry?edit=1");
  });

  it("blocks open redirects", () => {
    for (const value of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/a\nb", null, 42]) {
      expect(safeNextPath(value)).toBe("/");
    }
  });
});
