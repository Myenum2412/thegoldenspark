import { notFound } from "next/navigation";
import { FileTextIcon } from "lucide-react";
import { getBill } from "@/lib/store.server";
import BillToolbar from "@/components/bill-toolbar";

export const metadata = { title: "Bill — Golden Sparks" };

// The bill renders server-side from the database — don't try to prerender it
// at build time; serve it on demand (blocking route).
export const instant = false;

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const dateStr = (iso: string) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default async function BillPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const bill = await getBill(orderId);
  if (!bill) notFound();

  const { order, items, shop } = bill;

  return (
    <div className="min-h-svh bg-neutral-100 py-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4">
        <BillToolbar />

        <div className="bill-print overflow-hidden rounded-lg border border-neutral-300 bg-white text-neutral-900 shadow-sm">
          {/* ── Header ─────────────────────────────── */}
          <header className="flex flex-col gap-4 border-b-2 border-neutral-900 p-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-600 uppercase">
                <FileTextIcon className="size-4" aria-hidden="true" />
                Tax Invoice / Bill
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                {shop.name || "Golden Sparks"}
              </h1>
              {(shop.addressLine1 || shop.addressLine2) && (
                <p className="mt-1 text-sm text-neutral-600">
                  {[shop.addressLine1, shop.addressLine2]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {shop.phoneNumber && (
                <p className="text-sm text-neutral-600">
                  📞 {shop.phoneNumber}
                </p>
              )}
            </div>
            <dl className="grid gap-1 text-sm">
              <div className="flex justify-between gap-6">
                <dt className="text-neutral-500">Bill No</dt>
                <dd className="font-semibold tabular-nums">
                  {order.invoiceNo}
                </dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-neutral-500">Date</dt>
                <dd className="tabular-nums">{dateStr(order.createdAt)}</dd>
              </div>
              {order.phone && (
                <div className="flex justify-between gap-6">
                  <dt className="text-neutral-500">Bill To</dt>
                  <dd className="font-medium">
                    {order.customer_name}
                    {order.phone ? ` · ${order.phone}` : ""}
                  </dd>
                </div>
              )}
            </dl>
          </header>

          {/* ── Items ──────────────────────────────── */}
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-left">
                  <th className="py-1.5 pr-3 font-semibold">#</th>
                  <th className="py-1.5 pr-3 font-semibold">
                    Product / Description
                  </th>
                  <th className="py-1.5 pr-3 text-right font-semibold">Qty</th>
                  <th className="py-1.5 pr-3 text-right font-semibold">
                    Rate (₹)
                  </th>
                  <th className="py-1.5 text-right font-semibold">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-neutral-500"
                    >
                      No items on this bill.
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr
                      key={it.item_no}
                      className="border-b border-neutral-200"
                    >
                      <td className="py-2 pr-3 tabular-nums text-neutral-500">
                        {it.item_no}
                      </td>
                      <td className="py-2 pr-3 font-medium">{it.name}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {it.qty}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {inr(it.rate)}
                      </td>
                      <td className="py-2 text-right font-semibold tabular-nums">
                        {inr(it.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <dl className="w-64 rounded-lg border border-neutral-300">
                <div className="flex justify-between px-4 py-3 text-sm font-semibold">
                  <dt>Total Amount</dt>
                  <dd className="tabular-nums">₹{inr(order.total)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* ── Footer ─────────────────────────────── */}
          <footer className="border-t border-neutral-200 bg-neutral-50 p-6 text-sm">
            {shop.footerText && (
              <p className="font-medium text-neutral-800">
                {shop.footerText}
              </p>
            )}
            {shop.upiId && (
              <p className="mt-1 text-neutral-600">
                UPI: <span className="font-medium tabular-nums">{shop.upiId}</span>
              </p>
            )}
            <p className="mt-4 text-xs text-neutral-400">
              This bill is generated automatically from the order placed on
              com.sasi.app · Please forward it as a PDF document via WhatsApp.
            </p>
          </footer>
        </div>
      </div>
      <style>{`
        @page { size: A4; margin: 12mm; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          body { background: white !important; }
          .bill-print { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          .bill-print * { color: black !important; }
        }
      `}</style>
    </div>
  );
}