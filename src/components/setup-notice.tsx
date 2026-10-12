import { SETUP_SQL } from "@/lib/store-data";

export default function SetupNotice({
  message,
  table,
}: {
  message: string;
  table: "customers" | "products";
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <p className="font-semibold">
        Could not load {table} — no data is being stored yet.
      </p>
      <p className="mt-1 text-muted-foreground">{message}</p>
      <p className="mt-2 text-muted-foreground">
        Create the tables once in Supabase → SQL Editor → paste, Run:
      </p>
      <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-3 text-xs">
        {SETUP_SQL}
      </pre>
    </div>
  );
}
