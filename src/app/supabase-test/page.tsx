import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function SessionStatus() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  return (
    <pre className="mt-4 max-w-xl overflow-auto rounded bg-zinc-100 p-4 text-xs dark:bg-zinc-900">
      {error
        ? `Error: ${error.message}`
        : `Session: ${data.session ? "active" : "none (connected OK)"}`}
    </pre>
  );
}

export default function SupabaseTestPage() {
  const isConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !==
      "https://your-project.supabase.co";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
      <p className="mt-2 text-sm text-zinc-600">
        {isConfigured
          ? "Env vars are set. Checking session…"
          : "⚠️ Using placeholder env vars — add your real keys to .env.local"}
      </p>
      <Suspense fallback={<p className="mt-4 text-sm">Checking…</p>}>
        <SessionStatus />
      </Suspense>
      <a href="/" className="mt-6 underline">
        ← Back home
      </a>
    </main>
  );
}
