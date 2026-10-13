import { Account, Client } from "appwrite";

// Treat blank/placeholder env values as "unset" so a stale value (e.g. the
// old REPLACE_WITH_DATABASE_ID template) can't disable the app. We know the
// project, database and table ids, so these defaults are safe.
function envOr(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const v = value.trim();
  if (!v) return fallback;
  const lowered = v.toLowerCase();
  if (
    lowered.startsWith("replace_with_") ||
    lowered.startsWith("your-") ||
    lowered === "undefined"
  ) {
    return fallback;
  }
  return v;
}

// Public (browser-safe) Appwrite config. Data access happens server-side
// in appwrite-server.ts / store.server.ts using the API key; the browser
// only ever needs the endpoint, project id and the session cookie.
export const APPWRITE_ENDPOINT = envOr(
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  "https://sfo.cloud.appwrite.io/v1"
);
export const APPWRITE_PROJECT_ID = envOr(
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  "6ac84fa0002e5ccfa934"
);
export const APPWRITE_PROJECT_NAME = envOr(
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME,
  "sasi"
);

export const APPWRITE_DATABASE_ID = envOr(
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  "billing_db"
);

// The app maps onto the existing "Billing" database. Table ids (not
// collections) — reads/writes go through the TablesDB API.
export const TABLES = {
  products: envOr(process.env.NEXT_PUBLIC_APPWRITE_TABLE_PRODUCTS, "products"),
  clients: envOr(process.env.NEXT_PUBLIC_APPWRITE_TABLE_CLIENTS, "clients"),
  sales: envOr(process.env.NEXT_PUBLIC_APPWRITE_TABLE_SALES, "sales"),
} as const;

// HttpOnly cookie set by /api/auth/login on the app's own domain. The proxy
// guards /dashboard and /api/store with it. (Appwrite's own a_session_* cookie
// lives on the Appwrite domain and never reaches this app.)
export const GS_SESSION_COOKIE = "gs_session";

export function isAppwriteConfigured(): boolean {
  return !APPWRITE_DATABASE_ID.startsWith("REPLACE_WITH_");
}

export function assertAppwriteConfigured(): void {
  if (!isAppwriteConfigured()) {
    throw new Error(
      "Appwrite database is not configured yet — set NEXT_PUBLIC_APPWRITE_DATABASE_ID and the table ids in .env.local."
    );
  }
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);

export { account, client };
