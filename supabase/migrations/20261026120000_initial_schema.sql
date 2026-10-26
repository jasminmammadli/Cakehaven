-- CakeHaven initial schema.
-- Catalogue is public-read; user data is owner-only; orders are written only
-- through create_order(), which is executable by service_role alone.

create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 60),
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  ingredients text not null default '' check (char_length(ingredients) <= 200),
  category_id uuid not null references public.categories (id) on delete restrict,
  -- Price of the smallest (0.5 kg) size; other weights are derived in app code.
  base_price_cents integer not null check (base_price_cents > 0),
  shape text not null default 'round'
    check (shape in ('round', 'square', 'heart', 'cupcake')),
  flavours text[] not null default '{}'
    check (flavours <@ array[
      'caramel', 'vanilla', 'cheese', 'hazelnut', 'white-chocolate',
      'dark-chocolate', 'fruits', 'red-velvet', 'kit-kat', 'snickers'
    ]::text[]),
  image_url text not null,
  gallery text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_id) where is_active;
create index products_price_idx on public.products (base_price_cents) where is_active;
create index products_flavours_idx on public.products using gin (flavours);
create index products_name_trgm_idx on public.products using gin (name extensions.gin_trgm_ops);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 80),
  sort_order integer not null default 0
);

create table public.collection_products (
  collection_id uuid not null references public.collections (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  position integer not null default 0,
  primary key (collection_id, product_id)
);

create index collection_products_product_idx on public.collection_products (product_id);

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 100)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Reviews, likes, favourites
-- ---------------------------------------------------------------------------

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  -- Null for seeded/editorial reviews.
  user_id uuid references public.profiles (id) on delete set null,
  author_name text not null check (char_length(author_name) between 1 and 100),
  avatar_url text,
  body text not null check (char_length(btrim(body)) between 3 and 1000),
  like_count integer not null default 0 check (like_count >= 0),
  created_at timestamptz not null default now()
);

create index reviews_product_created_idx on public.reviews (product_id, created_at desc);
create index reviews_user_idx on public.reviews (user_id);

-- Authors cannot choose their display name, avatar, like count or timestamp.
create function public.set_review_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is not null then
    select coalesce(nullif(btrim(p.full_name), ''), 'CakeHaven customer')
      into new.author_name
      from public.profiles p
     where p.id = new.user_id;
    new.author_name := coalesce(new.author_name, 'CakeHaven customer');
    new.avatar_url := null;
    new.like_count := 0;
    new.created_at := now();
  end if;
  new.body := btrim(new.body);
  return new;
end;
$$;

create trigger reviews_set_defaults
  before insert on public.reviews
  for each row execute function public.set_review_defaults();

create table public.review_likes (
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create index review_likes_user_idx on public.review_likes (user_id);

create function public.sync_review_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.reviews set like_count = like_count + 1 where id = new.review_id;
    return new;
  end if;
  update public.reviews set like_count = greatest(like_count - 1, 0) where id = old.review_id;
  return old;
end;
$$;

create trigger review_likes_sync_count
  after insert or delete on public.review_likes
  for each row execute function public.sync_review_like_count();

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index favorites_product_idx on public.favorites (product_id);

-- ---------------------------------------------------------------------------
-- Promotions and orders
-- ---------------------------------------------------------------------------

create table public.promo_codes (
  code text primary key check (code = upper(code) and char_length(code) between 3 and 30),
  percent_off integer not null check (percent_off between 1 and 90),
  is_active boolean not null default true,
  expires_at timestamptz
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique
    default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  user_id uuid references public.profiles (id) on delete set null,
  status text not null default 'paid' check (status in ('paid', 'cancelled')),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 6 and 30),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  address_type text not null check (address_type in ('home', 'office', 'other')),
  city text not null check (char_length(city) between 2 and 100),
  address_line text not null check (char_length(address_line) between 3 and 200),
  postcode text not null check (char_length(postcode) between 2 and 20),
  payment_method text not null check (payment_method in ('card', 'apple_pay', 'paypal')),
  card_last4 text check (card_last4 ~ '^[0-9]{4}$'),
  subtotal_cents integer not null check (subtotal_cents > 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  promo_code text references public.promo_codes (code) on delete set null,
  created_at timestamptz not null default now(),
  check ((payment_method = 'card') = (card_last4 is not null)),
  check (total_cents = subtotal_cents - discount_cents)
);

create index orders_user_created_idx on public.orders (user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  kind text not null check (kind in ('product', 'custom')),
  name text not null check (char_length(name) between 1 and 120),
  details jsonb not null default '{}'::jsonb,
  unit_price_cents integer not null check (unit_price_cents > 0),
  quantity integer not null check (quantity between 1 and 20),
  line_total_cents integer not null,
  check (line_total_cents = unit_price_cents * quantity)
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- Inserts an order and its items atomically. Prices are computed by the
-- application server; this function is only reachable with the secret key.
create function public.create_order(p_order jsonb, p_items jsonb)
returns table (id uuid, reference text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 20 then
    raise exception 'create_order: items must be a non-empty array of at most 20 lines';
  end if;

  insert into public.orders (
    user_id, customer_name, phone, email, address_type, city, address_line,
    postcode, payment_method, card_last4, subtotal_cents, discount_cents,
    total_cents, promo_code
  )
  values (
    nullif(p_order ->> 'user_id', '')::uuid,
    p_order ->> 'customer_name',
    p_order ->> 'phone',
    p_order ->> 'email',
    p_order ->> 'address_type',
    p_order ->> 'city',
    p_order ->> 'address_line',
    p_order ->> 'postcode',
    p_order ->> 'payment_method',
    nullif(p_order ->> 'card_last4', ''),
    (p_order ->> 'subtotal_cents')::integer,
    (p_order ->> 'discount_cents')::integer,
    (p_order ->> 'total_cents')::integer,
    nullif(p_order ->> 'promo_code', '')
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, product_id, kind, name, details, unit_price_cents, quantity, line_total_cents
  )
  select
    v_order.id,
    item.product_id,
    item.kind,
    item.name,
    coalesce(item.details, '{}'::jsonb),
    item.unit_price_cents,
    item.quantity,
    item.unit_price_cents * item.quantity
  from jsonb_to_recordset(p_items) as item (
    product_id uuid,
    kind text,
    name text,
    details jsonb,
    unit_price_cents integer,
    quantity integer
  );

  return query select v_order.id, v_order.reference;
end;
$$;

revoke execute on function public.create_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb) to service_role;

-- Trigger helpers are not meant to be called directly.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_review_defaults() from public, anon, authenticated;
revoke execute on function public.sync_review_like_count() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;
alter table public.review_likes enable row level security;
alter table public.favorites enable row level security;
alter table public.promo_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Categories are public"
  on public.categories for select to anon, authenticated using (true);

create policy "Active products are public"
  on public.products for select to anon, authenticated using (is_active);

create policy "Collections are public"
  on public.collections for select to anon, authenticated using (true);

create policy "Collection entries are public"
  on public.collection_products for select to anon, authenticated using (true);

create policy "Users read their own profile"
  on public.profiles for select to authenticated using ((select auth.uid()) = id);

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Reviews are public"
  on public.reviews for select to anon, authenticated using (true);

create policy "Users write reviews as themselves"
  on public.reviews for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users delete their own reviews"
  on public.reviews for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users read their own likes"
  on public.review_likes for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users like as themselves"
  on public.review_likes for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users remove their own likes"
  on public.review_likes for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users read their own favourites"
  on public.favorites for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users add their own favourites"
  on public.favorites for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users remove their own favourites"
  on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);

-- promo_codes: no policies; read only by the server with the secret key.

create policy "Users read their own orders"
  on public.orders for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users read items of their own orders"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
     where o.id = order_items.order_id and o.user_id = (select auth.uid())
  ));
