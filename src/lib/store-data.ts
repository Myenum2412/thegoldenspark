export const SETUP_SQL = `-- Tables are missing, so no data is being stored yet.
-- Run the full seed script in Supabase → SQL Editor → paste → Run:
--   1. Open the file supabase/seed.sql in this repo (GitHub)
--   2. Copy its entire contents, paste into SQL Editor, press Run.
-- It creates the customers + products tables, permissions,
-- and loads the full 90-item pricelist.`;

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
  item_no: number;
  name: string;
  category: string;
  packing: string;
  mrp: number;
  special_rate: number;
  stock: number;
  created_at?: string;
};
