import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/types/database";

// Exercises RLS, triggers and create_order against a live Supabase.
// Local: `npm run db:start` then `npm run test:integration`.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const secretKey = process.env.SUPABASE_SECRET_KEY!;

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const anon = createClient<Database>(url, publishableKey, options);
const admin = createClient<Database>(url, secretKey, options);

type TestUser = { id: string; client: SupabaseClient<Database> };
const createdUserIds: string[] = [];
const createdOrderIds: string[] = [];

async function createUser(fullName: string): Promise<TestUser> {
  const email = `test-${crypto.randomUUID()}@cakehaven.test`;
  const password = "correct-horse-battery";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  createdUserIds.push(data.user.id);

  const client = createClient<Database>(url, publishableKey, options);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return { id: data.user.id, client };
}

const validOrder = {
  user_id: "",
  customer_name: "Sam Baker",
  phone: "+44 20 1234 5678",
  email: "sam@example.com",
  address_type: "home",
  city: "London",
  address_line: "1 Cake Lane",
  postcode: "N1 1AA",
  payment_method: "card",
  card_last4: "4242",
  subtotal_cents: 16200,
  discount_cents: 0,
  total_cents: 16200,
  promo_code: "",
};

let productId: string;
let reviewId: string;

beforeAll(async () => {
  const { data, error } = await anon.from("products").select("id").eq("slug", "very-berry-strawberry-cake").single();
  if (error) throw error;
  productId = data.id;

  const { data: review, error: reviewError } = await anon
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .limit(1)
    .single();
  if (reviewError) throw reviewError;
  reviewId = review.id;
});

afterAll(async () => {
  if (createdOrderIds.length) await admin.from("orders").delete().in("id", createdOrderIds);
  // Reviews outlive deleted accounts (user_id is set null), so remove them first.
  if (createdUserIds.length) await admin.from("reviews").delete().in("user_id", createdUserIds);
  for (const id of createdUserIds) await admin.auth.admin.deleteUser(id);
});

describe("public catalogue", () => {
  it("lets anonymous visitors read active products, categories and collections", async () => {
    const [products, categories, collections] = await Promise.all([
      anon.from("products").select("id", { count: "exact", head: true }),
      anon.from("categories").select("id", { count: "exact", head: true }),
      anon.from("collection_products").select("product_id", { count: "exact", head: true }),
    ]);
    expect(products.count).toBe(16);
    expect(categories.count).toBe(7);
    expect(collections.count).toBeGreaterThan(0);
  });

  it("hides inactive products", async () => {
    await admin.from("products").update({ is_active: false }).eq("id", productId);
    const { data } = await anon.from("products").select("id").eq("id", productId);
    await admin.from("products").update({ is_active: true }).eq("id", productId);
    expect(data).toEqual([]);
  });
});

describe("privileged data", () => {
  it("does not expose promo codes to the public", async () => {
    const { data } = await anon.from("promo_codes").select("code");
    expect(data).toEqual([]);
  });

  it("does not let the public create orders directly", async () => {
    const rpc = await anon.rpc("create_order", { p_order: validOrder, p_items: [] });
    expect(rpc.error).not.toBeNull();

    const insert = await anon.from("orders").insert({ ...validOrder, user_id: null, card_last4: "4242" });
    expect(insert.error).not.toBeNull();
  });
});

describe("create_order", () => {
  const item = () => ({
    product_id: productId,
    kind: "product",
    name: "Very Berry Strawberry Cake",
    details: { weight: "1 kg" },
    unit_price_cents: 8100,
    quantity: 2,
  });

  it("creates an order and its items atomically for the server", async () => {
    const { data, error } = await admin.rpc("create_order", { p_order: validOrder, p_items: [item()] }).single();
    expect(error).toBeNull();
    createdOrderIds.push(data!.id);
    expect(data!.reference).toMatch(/^[A-F0-9]{10}$/);

    const { data: items } = await admin.from("order_items").select("line_total_cents").eq("order_id", data!.id);
    expect(items).toEqual([{ line_total_cents: 16200 }]);
  });

  it("rejects inconsistent totals and leaves nothing behind", async () => {
    const before = await admin.from("orders").select("id", { count: "exact", head: true });
    const { error } = await admin.rpc("create_order", {
      p_order: { ...validOrder, total_cents: 1 },
      p_items: [item()],
    });
    const after = await admin.from("orders").select("id", { count: "exact", head: true });
    expect(error).not.toBeNull();
    expect(after.count).toBe(before.count);
  });

  it("rejects an empty basket and card payments without last four digits", async () => {
    const empty = await admin.rpc("create_order", { p_order: validOrder, p_items: [] });
    expect(empty.error?.message).toContain("non-empty");

    const noLast4 = await admin.rpc("create_order", {
      p_order: { ...validOrder, card_last4: "" },
      p_items: [item()],
    });
    expect(noLast4.error).not.toBeNull();
  });
});

describe("signed-in users", () => {
  let alice: TestUser;
  let bob: TestUser;

  beforeAll(async () => {
    [alice, bob] = await Promise.all([createUser("Alice Baker"), createUser("Bob Pastry")]);
  });

  it("creates a profile from sign-up metadata", async () => {
    const { data } = await alice.client.from("profiles").select("full_name").eq("id", alice.id).single();
    expect(data?.full_name).toBe("Alice Baker");
  });

  it("stamps reviews with the author's real name, ignoring client-supplied fields", async () => {
    const { data, error } = await alice.client
      .from("reviews")
      .insert({
        product_id: productId,
        user_id: alice.id,
        author_name: "Somebody Famous",
        avatar_url: "https://evil.example/x.png",
        like_count: 9999,
        body: "  Lovely sponge!  ",
      })
      .select("author_name, avatar_url, like_count, body")
      .single();
    expect(error).toBeNull();
    expect(data).toEqual({ author_name: "Alice Baker", avatar_url: null, like_count: 0, body: "Lovely sponge!" });
  });

  it("refuses reviews written on behalf of someone else", async () => {
    const { error } = await alice.client
      .from("reviews")
      .insert({ product_id: productId, user_id: bob.id, author_name: "x", body: "Pretending to be Bob" });
    expect(error).not.toBeNull();
  });

  it("keeps like counts in sync and prevents double likes", async () => {
    const count = async () =>
      (await anon.from("reviews").select("like_count").eq("id", reviewId).single()).data!.like_count;
    const start = await count();

    await alice.client.from("review_likes").insert({ review_id: reviewId, user_id: alice.id });
    expect(await count()).toBe(start + 1);

    const duplicate = await alice.client.from("review_likes").insert({ review_id: reviewId, user_id: alice.id });
    expect(duplicate.error).not.toBeNull();

    await alice.client.from("review_likes").delete().eq("review_id", reviewId).eq("user_id", alice.id);
    expect(await count()).toBe(start);
  });

  it("keeps favourites private to their owner", async () => {
    const insert = await alice.client.from("favorites").insert({ user_id: alice.id, product_id: productId });
    expect(insert.error).toBeNull();

    const own = await alice.client.from("favorites").select("product_id");
    const others = await bob.client.from("favorites").select("product_id").eq("user_id", alice.id);
    const spoof = await bob.client.from("favorites").insert({ user_id: alice.id, product_id: productId });

    expect(own.data).toEqual([{ product_id: productId }]);
    expect(others.data).toEqual([]);
    expect(spoof.error).not.toBeNull();
  });

  it("shows users only their own orders", async () => {
    const { data } = await admin
      .rpc("create_order", {
        p_order: { ...validOrder, user_id: alice.id },
        p_items: [
          { product_id: productId, kind: "product", name: "Cake", details: {}, unit_price_cents: 16200, quantity: 1 },
        ],
      })
      .single();
    createdOrderIds.push(data!.id);

    const mine = await alice.client.from("orders").select("id").eq("id", data!.id);
    const notMine = await bob.client.from("orders").select("id").eq("id", data!.id);
    expect(mine.data).toHaveLength(1);
    expect(notMine.data).toEqual([]);
  });
});
