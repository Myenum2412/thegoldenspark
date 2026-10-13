import { createClient } from "@/utils/supabase/client";

type BrowserSupabase = ReturnType<typeof createClient>;

// Deletes customers plus their orders and order items first, so the
// orders.customer_id foreign key never blocks the delete.
export async function deleteCustomersWithOrders(
  supabase: BrowserSupabase,
  ids: string[]
): Promise<{ message?: string } | null> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .in("customer_id", ids);
  if (ordersError) return ordersError;

  const orderIds = ((orders ?? []) as { id: string | number }[]).map((o) =>
    String(o.id)
  );
  if (orderIds.length > 0) {
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .in("order_id", orderIds)
      .select("id");
    if (itemsError) return itemsError;

    const { error: delOrdersError } = await supabase
      .from("orders")
      .delete()
      .in("id", orderIds)
      .select("id");
    if (delOrdersError) return delOrdersError;
  }

  const { data: deleted, error: delError } = await supabase
    .from("customers")
    .delete()
    .in("id", ids)
    .select("id");
  if (delError) return delError;
  if (!deleted || deleted.length === 0) {
    return {
      message:
        "Delete blocked by database permissions — run the delete-policy SQL in Supabase SQL Editor.",
    };
  }
  return null;
}
