import { Suspense } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import TableBlock from "@/components/blocks/table-1";

type Todo = {
  id: string | number;
  name: string;
};

async function Todos() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("todos").select();
  const todos = (data ?? []) as Todo[];

  if (error) {
    return (
      <p className="mt-2 text-sm text-destructive">
        Could not load todos: {error.message}
      </p>
    );
  }

  if (todos.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        Connected OK — the <code>todos</code> table is empty (or has no
        readable rows).
      </p>
    );
  }

  return (
    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <section className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Todos from Supabase
        </h2>
        <Suspense
          fallback={
            <p className="mt-2 text-sm text-muted-foreground">
              Loading todos…
            </p>
          }
        >
          <Todos />
        </Suspense>
      </section>

      <TableBlock />
    </main>
  );
}
