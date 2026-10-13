export const SETUP_SQL = `-- Appwrite backend is not configured yet, so no data is loading.
-- Create the database + collections once in the Appwrite console:
--   1. Follow docs/appwrite-schema.md (database, 4 collections, permissions).
--   2. Create a login user under Auth → Users.
--   3. Put the Database ID + Collection IDs in .env.local, restart the app.
-- Seed the 90-item pricelist from docs/pricelist-seed.json (see the doc).`;

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
