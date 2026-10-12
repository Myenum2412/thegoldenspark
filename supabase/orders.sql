-- Golden Spark orders checkout.
-- Run in Supabase → SQL Editor → paste → Run.
-- Stores customer orders placed from the homepage pricelist cart.

create table if not exists orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id),
  customer_name text not null,
  phone text not null,
  total numeric not null default 0,
  status text not null default 'new',
  created_at timestamptz default now()
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint references orders(id) on delete cascade,
  product_id bigint,
  item_no integer not null default 0,
  name text not null,
  qty integer not null default 1,
  rate numeric not null default 0,
  amount numeric not null default 0
);

alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "public insert orders" on orders;
create policy "public insert orders" on orders
  for insert with check (true);

drop policy if exists "public read orders" on orders;
create policy "public read orders" on orders
  for select using (true);

drop policy if exists "public insert order_items" on order_items;
create policy "public insert order_items" on order_items
  for insert with check (true);

drop policy if exists "public read order_items" on order_items;
create policy "public read order_items" on order_items
  for select using (true);
