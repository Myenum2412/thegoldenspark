// Server-only Appwrite access. Uses the API key when one is provided; otherwise
// falls back to an anonymous client (the Billing tables currently grant
// read/create/update/delete to "any", so no key is required to operate).
// This module must never be imported from a client component.
import { Client, TablesDB } from "appwrite";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  assertAppwriteConfigured,
} from "./appwrite";

export const DB_ID = APPWRITE_DATABASE_ID;
export const ENDPOINT = APPWRITE_ENDPOINT;
export const PROJECT_ID = APPWRITE_PROJECT_ID;

let cached: TablesDB | null = null;

// Lazily build the TablesDB client so importing this module never throws at
// build time. The API key is optional — see the module comment above.
export function tables(): TablesDB {
  assertAppwriteConfigured();
  if (!cached) {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    // appwrite SDK v28 removed setKey(); the API key (when present) is a header.
    const key = process.env.APPWRITE_API_KEY?.trim();
    if (key) client.headers["X-Appwrite-Key"] = key;
    cached = new TablesDB(client);
  }
  return cached;
}
