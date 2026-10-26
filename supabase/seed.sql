-- Catalogue content taken from the Figma design (file AM9qiZGn6NbJjLnwv9XPJT).
-- Card prices in the design are the 0.5 kg price (base_price_cents).

insert into public.categories (slug, name, image_url, sort_order) values
  ('brownies',    'Brownies',    '/images/categories/brownies.png',   1),
  ('wedding',     'Wedding',     '/images/categories/wedding.png',    2),
  ('birthday',    'Birthday',    '/images/categories/birthday.png',   3),
  ('cheesecake',  'Cheesecake',  '/images/categories/cheesecake.png', 4),
  ('occasion',    'Occasion',    null,                                5),
  ('cupcakes',    'Cupcakes',    null,                                6),
  ('anniversary', 'Anniversary', null,                                7);

insert into public.products
  (slug, name, description, ingredients, category_id, base_price_cents, shape, flavours, image_url, gallery)
select
  p.slug, p.name, p.description, p.ingredients, c.id, p.price, 'round', p.flavours, p.image_url, p.gallery
from (values
  ('chocolate-truffle-cake', 'Chocolate Truffle Cake',
   'Layers of dark chocolate sponge soaked in cocoa syrup, finished with a glossy truffle ganache and chocolate curls.',
   'Chocolate, cream, cocoa', 'birthday', 7000, array['dark-chocolate'],
   '/images/cakes/chocolate-truffle.jpg', array[]::text[]),
  ('chocolate-vanilla-half', 'Chocolate Vanilla Half',
   'Half dark chocolate, half vanilla bean: one cake for both camps, topped with caramel ribbons and a cherry.',
   'Chocolate, vanilla, cherry', 'anniversary', 7000, array['vanilla', 'dark-chocolate'],
   '/images/cakes/chocolate-vanilla-half.jpg', array[]::text[]),
  ('strawberry-velvet-cake', 'Strawberry Velvet Cake',
   'Light vanilla sponge with strawberry mousse under a mirror glaze, crowned with fresh strawberries.',
   'Strawberry, vanilla, cream', 'birthday', 7000, array['fruits', 'vanilla'],
   '/images/cakes/strawberry-velvet.jpg', array[]::text[]),
  ('butterscotch-topped-cake', 'Butterscotch Topped Cake',
   'Butterscotch sponge layered with salted caramel cream and finished with chocolate crumb.',
   'Caramel, butterscotch, cream', 'occasion', 7000, array['caramel'],
   '/images/cakes/butterscotch-topped.jpg', array[]::text[]),
  ('chocolate-truffle-crunch-cake', 'Chocolate Truffle Crunch Cake',
   'Rich truffle cake loaded with chocolate chips and crisp wafer cones.',
   'Chocolate, wafer, cream', 'birthday', 7000, array['dark-chocolate', 'kit-kat'],
   '/images/cakes/chocolate-truffle-designer.jpg', array[]::text[]),
  ('nutella-hazelnut-cake', 'Nutella Hazelnut Cake',
   'Hazelnut sponge with Nutella cream, a milk-chocolate glaze and roasted hazelnuts around the base.',
   'Hazelnut, chocolate, cream', 'anniversary', 5000, array['hazelnut'],
   '/images/cakes/nutella-hazelnut.jpg', array[]::text[]),
  ('very-berry-strawberry-cake', 'Very Berry Strawberry Cake',
   'Strawberry vanilla cake with strawberry filling and rich white cream topping.',
   'Strawberry, vanilla, cream', 'birthday', 4500, array['fruits', 'vanilla'],
   '/images/cakes/very-berry-strawberry-main.jpg',
   array['/images/cakes/very-berry-strawberry-2.jpg', '/images/cakes/very-berry-strawberry-3.jpg', '/images/cakes/very-berry-strawberry-4.jpg']),
  ('red-velvet-cream-cake', 'Red Velvet Cream Cake',
   'Classic red velvet layers with cream-cheese frosting and a red velvet crumb top.',
   'Red velvet, cream cheese', 'cheesecake', 3000, array['red-velvet', 'cheese'],
   '/images/cakes/red-velvet-cream.jpg', array[]::text[]),
  ('choco-vanilla-cake', 'Choco Vanilla Cake',
   'Vanilla cream cake with a white chocolate drip and dark chocolate shards.',
   'Vanilla, white chocolate', 'anniversary', 7000, array['vanilla', 'white-chocolate'],
   '/images/cakes/choco-vanilla.jpg', array[]::text[]),
  ('walnut-topped-cake', 'Walnut Topped Cake',
   'Dark chocolate cake covered in caramelised walnuts.',
   'Chocolate, walnuts, caramel', 'occasion', 5000, array['dark-chocolate', 'caramel'],
   '/images/cakes/walnut-topped.jpg', array[]::text[]),
  ('indulgent-chocolate-cake', 'Indulgent Chocolate Cake',
   'Milk chocolate mousse cake with praline crunch and toasted almonds.',
   'Chocolate, praline, almonds', 'birthday', 4500, array['dark-chocolate', 'hazelnut'],
   '/images/cakes/indulgent-chocolate.jpg', array[]::text[]),
  ('choco-chip-truffle-cake', 'Choco Chip Truffle Cake',
   'Fudgy, brownie-dense truffle cake with a chocolate swirl and chip border.',
   'Chocolate, cocoa, chips', 'brownies', 3000, array['dark-chocolate'],
   '/images/cakes/choco-chip-truffle.jpg', array[]::text[]),
  ('classic-chocolate-truffle-cake', 'Classic Chocolate Truffle Cake',
   'Our signature truffle: chocolate sponge, whipped chocolate cream and a hazelnut crown.',
   'Chocolate, cream, hazelnuts', 'wedding', 4500, array['dark-chocolate', 'hazelnut'],
   '/images/cakes/classic-chocolate-truffle.jpg', array[]::text[]),
  ('butterscotch-cherry-topped-cake', 'Butterscotch Cherry Topped Cake',
   'Butterscotch sponge with cherry compote, hazelnut praline and a white chocolate curl.',
   'Hazelnuts, cherry, cream', 'wedding', 3500, array['caramel', 'hazelnut', 'fruits'],
   '/images/cakes/butterscotch-cherry.jpg', array[]::text[]),
  ('rasmalai-pista-whipped-cream-cake', 'Rasmalai Pista Whipped Cream Cake',
   'Saffron milk sponge with pistachio whipped cream and a fresh fruit topping.',
   'Lemon, cream, apple', 'occasion', 4000, array['fruits', 'vanilla'],
   '/images/cakes/rasmalai-pista.jpg', array[]::text[]),
  ('chocolate-ganache-truffle-cake', 'Chocolate Ganache Truffle Cake',
   'Dense chocolate cake under a soft ganache, rolled in chocolate crumb.',
   'Chocolate, cream, nuts', 'brownies', 2800, array['dark-chocolate'],
   '/images/cakes/chocolate-ganache-truffle.jpg', array[]::text[])
) as p (slug, name, description, ingredients, category_slug, price, flavours, image_url, gallery)
join public.categories c on c.slug = p.category_slug;

insert into public.collections (slug, title, sort_order) values
  ('sweet-success',          'Sweet Success',           1),
  ('designer-cakes',         'Designer Cakes',          2),
  ('surprise-your-loved-one','Surprise Your Loved One', 3),
  ('trending-cakes',         'Trending Cakes',          4);

insert into public.collection_products (collection_id, product_id, position)
select col.id, prod.id, entry.position
from (values
  ('sweet-success', 'chocolate-truffle-cake', 1),
  ('sweet-success', 'chocolate-vanilla-half', 2),
  ('sweet-success', 'strawberry-velvet-cake', 3),
  ('sweet-success', 'butterscotch-topped-cake', 4),
  ('sweet-success', 'classic-chocolate-truffle-cake', 5),
  ('sweet-success', 'butterscotch-cherry-topped-cake', 6),
  ('designer-cakes', 'chocolate-truffle-crunch-cake', 1),
  ('designer-cakes', 'nutella-hazelnut-cake', 2),
  ('designer-cakes', 'very-berry-strawberry-cake', 3),
  ('designer-cakes', 'red-velvet-cream-cake', 4),
  ('designer-cakes', 'rasmalai-pista-whipped-cream-cake', 5),
  ('surprise-your-loved-one', 'choco-vanilla-cake', 1),
  ('surprise-your-loved-one', 'walnut-topped-cake', 2),
  ('surprise-your-loved-one', 'indulgent-chocolate-cake', 3),
  ('surprise-your-loved-one', 'choco-chip-truffle-cake', 4),
  ('surprise-your-loved-one', 'chocolate-ganache-truffle-cake', 5),
  ('trending-cakes', 'red-velvet-cream-cake', 1),
  ('trending-cakes', 'very-berry-strawberry-cake', 2),
  ('trending-cakes', 'chocolate-truffle-crunch-cake', 3),
  ('trending-cakes', 'nutella-hazelnut-cake', 4)
) as entry (collection_slug, product_slug, position)
join public.collections col on col.slug = entry.collection_slug
join public.products prod on prod.slug = entry.product_slug;

insert into public.reviews (product_id, author_name, avatar_url, body, like_count, created_at)
select prod.id, r.author_name, r.avatar_url, r.body, r.like_count, r.created_at
from (values
  ('Christopher Nguyen', '/images/reviews/christopher.png',
   'I just had a slice of this cake, and I can''t stop raving about it! The sponge is incredibly moist and fluffy, and the frosting is to die for - it''s creamy, smooth, and just the right amount of sweet.',
   21, now() - interval '1 day'),
  ('David Martinez', '/images/reviews/david.png',
   'Wow, I just had a slice of this cake, and it was absolutely amazing! The sponge was so light and fluffy, and the frosting was perfectly creamy without being overly sweet.',
   14, now() - interval '2 days'),
  ('Emily Smith', '/images/reviews/emily.png',
   'The moment I took my first bite, I was transported to dessert heaven. The sponge is incredibly light and fluffy, and the frosting...oh, don''t even get me started on the frosting! It''s so creamy and perfectly sweet without being overwhelming. And those little decorative touches on top? They''re like tiny bursts of joy with every bite.',
   18, now() - interval '3 days')
) as r (author_name, avatar_url, body, like_count, created_at)
cross join public.products prod
where prod.slug = 'very-berry-strawberry-cake';

insert into public.promo_codes (code, percent_off) values ('SWEET20', 20);
