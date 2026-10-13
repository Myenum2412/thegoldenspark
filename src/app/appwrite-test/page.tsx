import { Suspense } from "react";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  COLLECTIONS,
  client,
  isAppwriteConfigured,
} from "@/lib/appwrite";

async function ConnectionStatus() {
  let ping: string;
  try {
    await client.ping();
    ping = "pong — endpoint + project reachable";
  } catch (err) {
    ping = `failed: ${err instanceof Error ? err.message : "unknown error"}`;
  }

  return (
    <pre className="mt-4 max-w-xl overflow-auto rounded bg-zinc-100 p-4 text-xs whitespace-pre-wrap dark:bg-zinc-900">
      {`Endpoint: ${APPWRITE_ENDPOINT}
Project: ${APPWRITE_PROJECT_ID}
Database: ${APPWRITE_DATABASE_ID}
Collections: ${Object.values(COLLECTIONS).join(", ")}

Ping: ${ping}
Backend: ${
        isAppwriteConfigured()
          ? "configured — set up collections per docs/appwrite-schema.md"
          : "NOT configured — add Database + Collection IDs to .env.local"
      }`}
    </pre>
  );
}

export default function AppwriteTestPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold">Appwrite Connection Test</h1>
      <p className="mt-2 text-sm text-zinc-600">
        {isAppwriteConfigured()
          ? "IDs are set. Checking connection…"
          : "Add your Database + Collection IDs to .env.local"}
      </p>
      <Suspense fallback={<p className="mt-4 text-sm">Checking…</p>}>
        <ConnectionStatus />
      </Suspense>
      <a href="/" className="mt-6 underline">
        ← Back home
      </a>
    </main>
  );
}
