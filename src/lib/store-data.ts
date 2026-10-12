export const SETUP_SQL = `-- Run this in Supabase → SQL Editor, then press Run.
-- It creates the app tables and allows the website to read + save data.

create table if not exists customers (
  id bigint generated always as identity primary key,
  name text not null,
  address text not null,
  pincode text not null,
  phone text not null,
  created_at timestamptz default now()
);

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null default 'General',
  price numeric not null default 0,
  stock integer not null default 0,
  created_at timestamptz default now()
);

alter table customers enable row level security;
alter table products enable row level security;

drop policy if exists "public read customers" on customers;
create policy "public read customers" on customers
  for select using (true);

drop policy if exists "public insert customers" on customers;
create policy "public insert customers" on customers
  for insert with check (true);

drop policy if exists "public read products" on products;
create policy "public read products" on products
  for select using (true);

drop policy if exists "public insert products" on products;
create policy "public insert products" on products
  for insert with check (true);

drop policy if exists "public update products" on products;
create policy "public update products" on products
  for update using (true);`;

export type Customer = {
  id: string | number;
  name: string;
  address: string;
  pincode: string;
  phone: string;
  created_at?: string;
};

export type Product = {
  id: string | number;
  name: string;
  category: string;
  price: number;
  stock: number;
  created_at?: string;
};
