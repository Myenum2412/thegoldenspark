import { Account, Client, Databases } from "appwrite";

export const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ??
  "https://sfo.cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "6ac84fa0002e5ccfa934";
export const APPWRITE_PROJECT_NAME =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME ?? "sasi";

export const APPWRITE_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "REPLACE_WITH_DATABASE_ID";

export const COLLECTIONS = {
  products:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRODUCTS ??
    "REPLACE_WITH_PRODUCTS_COLLECTION_ID",
  customers:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CUSTOMERS ??
    "REPLACE_WITH_CUSTOMERS_COLLECTION_ID",
  orders:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDERS ??
    "REPLACE_WITH_ORDERS_COLLECTION_ID",
  orderItems:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ITEMS ??
    "REPLACE_WITH_ORDER_ITEMS_COLLECTION_ID",
} as const;

// Session cookie the Appwrite web SDK persists after login.
// The middleware uses its presence to guard /dashboard routes.
export const APPWRITE_SESSION_COOKIE = `a_session_${APPWRITE_PROJECT_ID}`;

export function isAppwriteConfigured(): boolean {
  return (
    !APPWRITE_DATABASE_ID.startsWith("REPLACE_WITH_") &&
    !Object.values(COLLECTIONS).some((id) => id.startsWith("REPLACE_WITH_"))
  );
}

export function assertAppwriteConfigured(): void {
  if (!isAppwriteConfigured()) {
    throw new Error(
      "Appwrite database is not configured yet — set NEXT_PUBLIC_APPWRITE_DATABASE_ID and the collection IDs in .env.local (see docs/appwrite-schema.md)."
    );
  }
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

export { account, client, databases };
