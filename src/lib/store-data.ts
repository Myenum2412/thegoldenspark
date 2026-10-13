export const SETUP_SQL = `-- The Appwrite "Billing" database is the backend (TablesDB).
-- Configuration lives in .env.local locally, or in the host's env vars:
--   1. NEXT_PUBLIC_APPWRITE_DATABASE_ID      (default: billing_db)
--   2. NEXT_PUBLIC_APPWRITE_TABLE_PRODUCTS   (default: products)
--      NEXT_PUBLIC_APPWRITE_TABLE_CLIENTS    (default: clients)
--      NEXT_PUBLIC_APPWRITE_TABLE_SALES      (default: sales)
--   3. APPWRITE_API_KEY — optional server-only key (databases.read + tables.read/write).
--      The Billing tables allow anonymous access, so it is not required.
-- The login user lives under Auth → Users in the Appwrite console.`;

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
