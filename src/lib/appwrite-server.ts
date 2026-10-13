// Server-only Appwrite access. Uses the API key, so this module must never
// be imported from a client component.
import { Client, TablesDB } from "appwrite";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  assertAppwriteConfigured,
} from "./appwrite";

const API_KEY = process.env.APPWRITE_API_KEY ?? "";

export function getApiKey(): string {
  if (!API_KEY) {
    throw new Error(
      "APPWRITE_API_KEY is not set — add it to .env.local (server-only)."
    );
  }
  return API_KEY;
}

export const DB_ID = APPWRITE_DATABASE_ID;
export const ENDPOINT = APPWRITE_ENDPOINT;
export const PROJECT_ID = APPWRITE_PROJECT_ID;

let cached: TablesDB | null = null;

// Lazily build the admin TablesDB client so importing this module never
// throws at build time when the key is absent.
export function tables(): TablesDB {
  assertAppwriteConfigured();
  if (!cached) {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    // appwrite SDK v28 removed setKey(); the API key is passed as a header.
    client.headers["X-Appwrite-Key"] = getApiKey();
    cached = new TablesDB(client);
  }
  return cached;
}
